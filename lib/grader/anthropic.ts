import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import {
  EXTRACT_SYSTEM,
  ExtractionSchema,
  VERIFY_SYSTEM,
  VerdictSchema,
  finalizeVerdicts,
  formatMessages,
  NO_CLAIMS_RESULT,
  toClaims,
  verifyPrompt,
  type ExtractedClaim,
} from "./pipeline";
import type { AuditInput, Grader, GraderInfo, GraderResult, Message } from "./types";

export const DEFAULT_MODEL = "claude-sonnet-5-5";

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
    this.info = { name: "Anthropic grader", mode: "model", model, provider: "anthropic" };
  }

  async grade(input: AuditInput, messages: Message[], signal?: AbortSignal): Promise<GraderResult> {
    const sources = input.sources?.trim() ?? "";
    const claims = await this.extract(messages, signal);
    if (!claims.length) return NO_CLAIMS_RESULT;
    return finalizeVerdicts(claims, await this.verify(messages, claims, sources, signal), sources);
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
    return toClaims(toolInput(response, EXTRACT_TOOL.name, ExtractionSchema), messages);
  }

  private async verify(messages: Message[], claims: ExtractedClaim[], sources: string, signal?: AbortSignal) {
    const response = await this.client.messages.create(
      {
        model: this.model,
        max_tokens: 8192,
        system: VERIFY_SYSTEM,
        tools: [VERDICT_TOOL],
        tool_choice: { type: "tool", name: VERDICT_TOOL.name },
        messages: [{ role: "user", content: verifyPrompt(messages, claims, sources) }],
      },
      { signal },
    );
    return toolInput(response, VERDICT_TOOL.name, VerdictSchema);
  }
}
