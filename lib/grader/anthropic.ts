import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { locateExcerpt } from "./sources";
import type { AuditInput, Basis, GradedClaim, Grader, GraderInfo, GraderResult, Message } from "./types";

export const DEFAULT_MODEL = "claude-sonnet-5-5";

/** Verdicts resting only on the model's memory are never presented as near-certain. */
const MODEL_KNOWLEDGE_CAP = 0.7;

const ExtractionSchema = z.object({
  claims: z.array(
    z.object({
      message_index: z.number().int().min(0),
      text: z.string().min(1),
    }),
  ),
});

const VerdictSchema = z.object({
  verdicts: z.array(
    z.object({
      claim_id: z.string(),
      verdict: z.enum(["verified", "unverifiable", "flagged"]),
      confidence: z.number().min(0).max(1),
      basis: z.enum(["source", "model-knowledge", "none"]),
      explanation: z.string(),
      source_excerpt: z.string().nullable().optional(),
      flag: z
        .object({
          headline: z.string(),
          explanation: z.string(),
          fix: z.string().nullable().optional(),
        })
        .nullable()
        .optional(),
    }),
  ),
  relevance: z.object({
    score: z.number().min(0).max(100).nullable(),
    rationale: z.string(),
  }),
});

const EXTRACT_TOOL: Anthropic.Tool = {
  name: "record_claims",
  description: "Record every individually checkable factual claim found in the messages.",
  input_schema: {
    type: "object",
    properties: {
      claims: {
        type: "array",
        items: {
          type: "object",
          properties: {
            message_index: { type: "integer", description: "Index of the message the claim came from." },
            text: {
              type: "string",
              description: "The claim, quoted as closely to the original wording as possible, trimmed to one assertion.",
            },
          },
          required: ["message_index", "text"],
        },
      },
    },
    required: ["claims"],
  },
};

const VERDICT_TOOL: Anthropic.Tool = {
  name: "record_verdicts",
  description: "Record a verdict for every claim, plus an overall relevance judgment.",
  input_schema: {
    type: "object",
    properties: {
      verdicts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            claim_id: { type: "string" },
            verdict: { type: "string", enum: ["verified", "unverifiable", "flagged"] },
            confidence: {
              type: "number",
              description: "Probability (0-1) that this verdict is correct. Calibrated, not flattering.",
            },
            basis: { type: "string", enum: ["source", "model-knowledge", "none"] },
            explanation: {
              type: "string",
              description: "One or two plain-English sentences a sales rep would understand. No jargon.",
            },
            source_excerpt: {
              type: ["string", "null"],
              description: "A short VERBATIM quote from the provided sources that supports or contradicts the claim. Null if none.",
            },
            flag: {
              type: ["object", "null"],
              description: "Required when verdict is flagged; null otherwise.",
              properties: {
                headline: { type: "string", description: "One plain line: what is wrong." },
                explanation: { type: "string", description: "Why sending this would hurt, in plain English." },
                fix: { type: ["string", "null"], description: "A safer replacement line, or null." },
              },
              required: ["headline", "explanation"],
            },
          },
          required: ["claim_id", "verdict", "confidence", "basis", "explanation"],
        },
      },
      relevance: {
        type: "object",
        properties: {
          score: {
            type: ["number", "null"],
            description: "0-100: how specifically the messages engage with each prospect's actual situation.",
          },
          rationale: { type: "string" },
        },
        required: ["score", "rationale"],
      },
    },
    required: ["verdicts", "relevance"],
  },
};

const EXTRACT_SYSTEM = `You are the claim extractor in Tower, an auditing system for AI-written sales outreach.
Split the messages into atomic, checkable factual claims: statements about the prospect, their company, third parties, events, numbers, or the sender's product.
Include: figures, funding, hires, locations, events, attributions ("your talk at X"), product capabilities and results.
Exclude: greetings, sign-offs, questions, calls to action, pure opinion, and generic pleasantries.
One assertion per claim. Keep the original wording. Do not invent claims that are not in the text.`;

const VERIFY_SYSTEM = `You are the verifier in Tower, an auditing system for AI-written sales outreach. A sales rep is about to send these messages; your job is to stop invented facts reaching prospects.

For each claim decide:
- "verified": the provided sources directly support it. Quote the supporting text verbatim in source_excerpt. basis = "source".
- "flagged": the sources contradict it, OR it asserts a prospect-specific detail (a figure, event, quote, award, appearance) that the sources should cover but do not — the hallmark of a hallucination. basis = "source" when contradicted (quote the contradicting text), "none" when unsupported.
- "unverifiable": not checkable from the sources and not clearly invented (e.g. claims about the sender's own product, general industry statements). Say what evidence would settle it.
When no sources are provided you may use widely known public facts (basis = "model-knowledge"), but never mark a prospect-specific detail verified from memory alone.

Confidence is the probability your verdict is correct. Be calibrated: keyword overlap is not proof, absence of evidence is weaker than contradiction, and memory is weaker than a quoted source.
source_excerpt must be copied character-for-character from the sources, or null. Never paraphrase into it.
Explanations are for a busy sales rep: plain English, one or two sentences, no jargon.
Relevance: score how specifically the messages engage with each prospect's real situation (null only if there is nothing at all to judge).`;

function formatMessages(messages: Message[]): string {
  return messages
    .map((m) => `<message index="${m.index}">\n${m.subject ? `Subject: ${m.subject}\n` : ""}${m.body}\n</message>`)
    .join("\n\n");
}

function toolInput<T>(response: Anthropic.Message, toolName: string, schema: z.ZodType<T>): T {
  const block = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === toolName,
  );
  if (!block) throw new Error(`Model did not call ${toolName} (stop_reason: ${response.stop_reason}).`);
  const parsed = schema.safeParse(block.input);
  if (!parsed.success) throw new Error(`Model returned malformed ${toolName} output: ${parsed.error.message}`);
  return parsed.data;
}

export class AnthropicGrader implements Grader {
  readonly info: GraderInfo;
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(apiKey: string, model: string = DEFAULT_MODEL) {
    this.client = new Anthropic({ apiKey, timeout: 90_000, maxRetries: 2 });
    this.model = model;
    this.info = { name: "Anthropic grader", mode: "model", model };
  }

  async grade(input: AuditInput, messages: Message[], signal?: AbortSignal): Promise<GraderResult> {
    const sources = input.sources?.trim() ?? "";
    const claims = await this.extract(messages, signal);
    if (!claims.length) {
      return { claims: [], relevance: { score: null, rationale: "No checkable claims were found." }, notes: [] };
    }

    const verification = await this.verify(messages, claims, sources, signal);
    const byId = new Map(verification.verdicts.map((v) => [v.claim_id, v]));
    const notes: string[] = [];
    if (!sources) {
      notes.push("No source context was provided. Verdicts rely on the model's general knowledge, which is never treated as proof.");
    }

    const graded: GradedClaim[] = claims.map((claim) => {
      const v = byId.get(claim.id);
      if (!v) {
        return {
          ...claim,
          verdict: "unverifiable",
          confidence: 0,
          basis: "none",
          explanation: "The verifier returned no verdict for this claim, so Tower is not making one.",
          source: null,
          flag: null,
        };
      }

      // Traceability is enforced, not trusted: an excerpt must exist in the sources.
      const source = v.source_excerpt && sources ? locateExcerpt(sources, v.source_excerpt) : null;
      let verdict = v.verdict;
      let basis: Basis = v.basis;
      let confidence = v.confidence;
      let explanation = v.explanation;

      if (verdict === "verified" && basis === "source" && !source) {
        verdict = "unverifiable";
        basis = "none";
        confidence = Math.min(confidence, 0.5);
        explanation = `${explanation} (Tower couldn't find the quoted support in your sources, so this is not marked verified.)`;
      }
      if (basis === "model-knowledge") confidence = Math.min(confidence, MODEL_KNOWLEDGE_CAP);
      if (basis === "source" && !source) basis = "none";

      const flag =
        verdict === "flagged"
          ? {
              headline: v.flag?.headline ?? "This claim looks invented",
              explanation: v.flag?.explanation ?? explanation,
              fix: v.flag?.fix ?? null,
            }
          : null;

      return { ...claim, verdict, basis, confidence: Number(confidence.toFixed(2)), explanation, source, flag };
    });

    return {
      claims: graded,
      relevance: {
        score: verification.relevance.score === null ? null : Math.round(verification.relevance.score),
        rationale: verification.relevance.rationale,
      },
      notes,
    };
  }

  private async extract(messages: Message[], signal?: AbortSignal) {
    const response = await this.client.messages.create(
      {
        model: this.model,
        max_tokens: 4096,
        system: EXTRACT_SYSTEM,
        tools: [EXTRACT_TOOL],
        tool_choice: { type: "tool", name: EXTRACT_TOOL.name },
        messages: [{ role: "user", content: formatMessages(messages) }],
      },
      { signal },
    );
    const valid = new Set(messages.map((m) => m.index));
    return toolInput(response, EXTRACT_TOOL.name, ExtractionSchema)
      .claims.filter((c) => valid.has(c.message_index))
      .map((c, i) => ({ id: `c${i + 1}`, messageIndex: c.message_index, text: c.text.trim() }));
  }

  private async verify(
    messages: Message[],
    claims: { id: string; messageIndex: number; text: string }[],
    sources: string,
    signal?: AbortSignal,
  ) {
    const claimList = claims.map((c) => `<claim id="${c.id}" message="${c.messageIndex}">${c.text}</claim>`).join("\n");
    const content = [
      `<sources>\n${sources || "(none provided)"}\n</sources>`,
      `<messages>\n${formatMessages(messages)}\n</messages>`,
      `<claims>\n${claimList}\n</claims>`,
    ].join("\n\n");

    const response = await this.client.messages.create(
      {
        model: this.model,
        max_tokens: 8192,
        system: VERIFY_SYSTEM,
        tools: [VERDICT_TOOL],
        tool_choice: { type: "tool", name: VERDICT_TOOL.name },
        messages: [{ role: "user", content }],
      },
      { signal },
    );
    return toolInput(response, VERDICT_TOOL.name, VerdictSchema);
  }
}
