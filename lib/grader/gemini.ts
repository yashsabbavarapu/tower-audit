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

/** Available on the Google AI Studio free tier. */
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const TIMEOUT_MS = 90_000;
const MAX_RETRIES = 2;
const RETRYABLE = new Set([429, 500, 503]);

/** A non-2xx reply from the Gemini API, carrying the API's own message. */
export class GeminiApiError extends Error {
  constructor(
    readonly status: number,
    readonly apiMessage: string,
  ) {
    super(`Gemini API error ${status}: ${apiMessage}`);
    this.name = "GeminiApiError";
  }
}

// Gemini's responseSchema is an OpenAPI subset: uppercase types, `nullable` instead of type unions.
const EXTRACT_SCHEMA = {
  type: "OBJECT",
  properties: {
    claims: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          message_index: { type: "INTEGER", description: "Index of the message the claim came from." },
          text: {
            type: "STRING",
            description: "The claim, quoted as closely to the original wording as possible, trimmed to one assertion.",
          },
        },
        required: ["message_index", "text"],
      },
    },
  },
  required: ["claims"],
};

const VERDICT_SCHEMA = {
  type: "OBJECT",
  properties: {
    verdicts: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          claim_id: { type: "STRING" },
          verdict: { type: "STRING", enum: ["verified", "unverifiable", "flagged"] },
          confidence: {
            type: "NUMBER",
            description: "Probability (0-1) that this verdict is correct. Calibrated, not flattering.",
          },
          basis: { type: "STRING", enum: ["source", "model-knowledge", "none"] },
          explanation: {
            type: "STRING",
            description: "One or two plain-English sentences a sales rep would understand. No jargon.",
          },
          source_excerpt: {
            type: "STRING",
            nullable: true,
            description: "A short VERBATIM quote from the provided sources that supports or contradicts the claim. Null if none.",
          },
          flag: {
            type: "OBJECT",
            nullable: true,
            description: "Required when verdict is flagged; null otherwise.",
            properties: {
              headline: { type: "STRING", description: "One plain line: what is wrong." },
              explanation: { type: "STRING", description: "Why sending this would hurt, in plain English." },
              fix: { type: "STRING", nullable: true, description: "A safer replacement line, or null." },
            },
            required: ["headline", "explanation"],
          },
        },
        required: ["claim_id", "verdict", "confidence", "basis", "explanation"],
      },
    },
    relevance: {
      type: "OBJECT",
      properties: {
        score: {
          type: "NUMBER",
          nullable: true,
          description: "0-100: how specifically the messages engage with each prospect's actual situation.",
        },
        rationale: { type: "STRING" },
      },
      required: ["score", "rationale"],
    },
  },
  required: ["verdicts", "relevance"],
};

interface GenerateContentResponse {
  candidates?: {
    content?: { parts?: { text?: string; thought?: boolean }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
}

/** Pull a JSON object out of model text, tolerating code fences or stray prose around it. */
export function parseJsonLoose(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("Gemini returned no JSON object.");
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

function structuredOutput<T>(response: GenerateContentResponse, label: string, schema: z.ZodType<T>): T {
  if (response.promptFeedback?.blockReason) {
    throw new Error(`Gemini blocked the ${label} request (${response.promptFeedback.blockReason}).`);
  }
  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error(`Gemini returned no candidates for ${label}.`);
  const text = (candidate.content?.parts ?? [])
    .filter((p) => !p.thought && typeof p.text === "string")
    .map((p) => p.text)
    .join("");
  if (!text.trim()) throw new Error(`Gemini returned an empty ${label} response (finishReason: ${candidate.finishReason ?? "unknown"}).`);

  let json: unknown;
  try {
    json = parseJsonLoose(text);
  } catch {
    throw new Error(`Gemini returned unparseable ${label} output (finishReason: ${candidate.finishReason ?? "unknown"}).`);
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) throw new Error(`Gemini returned malformed ${label} output: ${parsed.error.message}`);
  return parsed.data;
}

async function apiErrorMessage(res: Response): Promise<string> {
  const body = await res.text().catch(() => "");
  try {
    const message = (JSON.parse(body) as { error?: { message?: unknown } }).error?.message;
    if (typeof message === "string" && message) return message;
  } catch {
    // Not JSON; fall through to the raw body.
  }
  return body.slice(0, 300) || res.statusText || "no error body";
}

export class GeminiGrader implements Grader {
  readonly info: GraderInfo;
  private readonly apiKey: string;
  private readonly model: string;
  /** Swappable for tests. */
  private fetchImpl: typeof fetch = (...args) => fetch(...args);

  constructor(apiKey: string, model: string = DEFAULT_GEMINI_MODEL) {
    this.apiKey = apiKey;
    this.model = model;
    this.info = { name: "Gemini grader", mode: "model", model, provider: "gemini" };
  }

  async grade(input: AuditInput, messages: Message[], signal?: AbortSignal): Promise<GraderResult> {
    const sources = input.sources?.trim() ?? "";
    const claims = await this.extract(messages, signal);
    if (!claims.length) return NO_CLAIMS_RESULT;
    return finalizeVerdicts(claims, await this.verify(messages, claims, sources, signal), sources);
  }

  private async extract(messages: Message[], signal?: AbortSignal) {
    const response = await this.generate(EXTRACT_SYSTEM, formatMessages(messages), EXTRACT_SCHEMA, signal);
    return toClaims(structuredOutput(response, "claim extraction", ExtractionSchema), messages);
  }

  private async verify(messages: Message[], claims: ExtractedClaim[], sources: string, signal?: AbortSignal) {
    const response = await this.generate(VERIFY_SYSTEM, verifyPrompt(messages, claims, sources), VERDICT_SCHEMA, signal);
    return structuredOutput(response, "verification", VerdictSchema);
  }

  private async generate(
    system: string,
    user: string,
    responseSchema: object,
    signal?: AbortSignal,
  ): Promise<GenerateContentResponse> {
    const url = `${API_BASE}/${encodeURIComponent(this.model)}:generateContent`;
    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        // 2.5-series thinking tokens count against this budget, so leave headroom.
        maxOutputTokens: 32_768,
      },
    });

    for (let attempt = 0; ; attempt++) {
      const timeout = AbortSignal.timeout(TIMEOUT_MS);
      const res = await this.fetchImpl(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": this.apiKey },
        body,
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      });
      if (res.ok) return (await res.json()) as GenerateContentResponse;
      if (RETRYABLE.has(res.status) && attempt < MAX_RETRIES && !signal?.aborted) {
        await res.body?.cancel();
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
        continue;
      }
      throw new GeminiApiError(res.status, await apiErrorMessage(res));
    }
  }
}
