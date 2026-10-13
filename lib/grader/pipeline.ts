/**
 * Provider-neutral pieces of the two-call model pipeline (extract, then verify).
 * Every model grader shares these prompts, output schemas and — most
 * importantly — the honesty rules applied to whatever the model returns.
 */
import { z } from "zod";
import { locateExcerpt } from "./sources";
import type { Basis, GradedClaim, GraderResult, Message } from "./types";

/** Verdicts resting only on the model's memory are never presented as near-certain. */
export const MODEL_KNOWLEDGE_CAP = 0.7;

export const ExtractionSchema = z.object({
  claims: z.array(
    z.object({
      message_index: z.number().int().min(0),
      text: z.string().min(1),
    }),
  ),
});

export const VerdictSchema = z.object({
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

export type Extraction = z.infer<typeof ExtractionSchema>;
export type Verification = z.infer<typeof VerdictSchema>;
export interface ExtractedClaim {
  id: string;
  messageIndex: number;
  text: string;
}

export const EXTRACT_SYSTEM = `You are the claim extractor in Tower, an auditing system for AI-written sales outreach.
Split the messages into atomic, checkable factual claims: statements about the prospect, their company, third parties, events, numbers, or the sender's product.
Include: figures, funding, hires, locations, events, attributions ("your talk at X"), product capabilities and results.
Exclude: greetings, sign-offs, questions, calls to action, pure opinion, and generic pleasantries.
One assertion per claim. Keep the original wording. Do not invent claims that are not in the text.`;

export const VERIFY_SYSTEM = `You are the verifier in Tower, an auditing system for AI-written sales outreach. A sales rep is about to send these messages; your job is to stop invented facts reaching prospects.

For each claim decide:
- "verified": the provided sources directly support it. Quote the supporting text verbatim in source_excerpt. basis = "source".
- "flagged": the sources contradict it, OR it asserts a prospect-specific detail (a figure, event, quote, award, appearance) that the sources should cover but do not — the hallmark of a hallucination. basis = "source" when contradicted (quote the contradicting text), "none" when unsupported.
- "unverifiable": not checkable from the sources and not clearly invented (e.g. claims about the sender's own product, general industry statements). Say what evidence would settle it.
When no sources are provided you may use widely known public facts (basis = "model-knowledge"), but never mark a prospect-specific detail verified from memory alone.

Confidence is the probability your verdict is correct. Be calibrated: keyword overlap is not proof, absence of evidence is weaker than contradiction, and memory is weaker than a quoted source.
source_excerpt must be copied character-for-character from the sources, or null. Never paraphrase into it.
Explanations are for a busy sales rep: plain English, one or two sentences, no jargon.
Relevance: score how specifically the messages engage with each prospect's real situation (null only if there is nothing at all to judge).`;

export function formatMessages(messages: Message[]): string {
  return messages
    .map((m) => `<message index="${m.index}">\n${m.subject ? `Subject: ${m.subject}\n` : ""}${m.body}\n</message>`)
    .join("\n\n");
}

export function verifyPrompt(messages: Message[], claims: ExtractedClaim[], sources: string): string {
  const claimList = claims.map((c) => `<claim id="${c.id}" message="${c.messageIndex}">${c.text}</claim>`).join("\n");
  return [
    `<sources>\n${sources || "(none provided)"}\n</sources>`,
    `<messages>\n${formatMessages(messages)}\n</messages>`,
    `<claims>\n${claimList}\n</claims>`,
  ].join("\n\n");
}

/** Drop claims pointing at messages that don't exist and assign stable ids. */
export function toClaims(extraction: Extraction, messages: Message[]): ExtractedClaim[] {
  const valid = new Set(messages.map((m) => m.index));
  return extraction.claims
    .filter((c) => valid.has(c.message_index))
    .map((c, i) => ({ id: `c${i + 1}`, messageIndex: c.message_index, text: c.text.trim() }));
}

export const NO_CLAIMS_RESULT: GraderResult = {
  claims: [],
  relevance: { score: null, rationale: "No checkable claims were found." },
  notes: [],
};

/**
 * Apply Tower's honesty rules to a model's verdicts. The model is not trusted:
 * a quoted excerpt must really appear in the sources, and memory-only verdicts
 * are capped.
 */
export function finalizeVerdicts(claims: ExtractedClaim[], verification: Verification, sources: string): GraderResult {
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
