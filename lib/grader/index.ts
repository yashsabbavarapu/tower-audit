import { AnthropicGrader, DEFAULT_MODEL } from "./anthropic";
import { DEFAULT_GEMINI_MODEL, GeminiGrader } from "./gemini";
import { HeuristicGrader } from "./heuristic";
import { splitMessages } from "./messages";
import { computeGrade, computeStats, verdictLine } from "./score";
import type { AuditInput, AuditReport, Grader, GraderInfo } from "./types";

export type * from "./types";

const GRADER_CHOICES = ["anthropic", "gemini", "demo"] as const;
type GraderChoice = (typeof GRADER_CHOICES)[number];

/**
 * Pick the grader from the environment.
 * An explicit TOWER_GRADER always wins. Unset: Anthropic if ANTHROPIC_API_KEY is
 * set, else Gemini if GEMINI_API_KEY is set, else the labeled demo grader.
 * A named grader whose key is missing falls back to demo mode and says why.
 */
export function getGrader(env: Record<string, string | undefined> = process.env): Grader {
  const anthropicKey = env.ANTHROPIC_API_KEY?.trim();
  const geminiKey = env.GEMINI_API_KEY?.trim();
  const requested = env.TOWER_GRADER?.trim().toLowerCase();

  const anthropic = (key: string) => new AnthropicGrader(key, env.TOWER_MODEL?.trim() || DEFAULT_MODEL);
  const gemini = (key: string) => new GeminiGrader(key, env.TOWER_GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL);

  if (!requested) {
    if (anthropicKey) return anthropic(anthropicKey);
    if (geminiKey) return gemini(geminiKey);
    return new HeuristicGrader();
  }
  if (!(GRADER_CHOICES as readonly string[]).includes(requested)) {
    return new HeuristicGrader(
      `TOWER_GRADER="${env.TOWER_GRADER?.trim()}" isn't a known grader (use anthropic, gemini or demo), so Tower is running in demo mode.`,
    );
  }
  switch (requested as GraderChoice) {
    case "anthropic":
      return anthropicKey
        ? anthropic(anthropicKey)
        : new HeuristicGrader("TOWER_GRADER=anthropic but ANTHROPIC_API_KEY isn't set, so Tower is running in demo mode.");
    case "gemini":
      return geminiKey
        ? gemini(geminiKey)
        : new HeuristicGrader("TOWER_GRADER=gemini but GEMINI_API_KEY isn't set, so Tower is running in demo mode.");
    case "demo":
      return new HeuristicGrader();
  }
}

export function graderInfo(): GraderInfo {
  return getGrader().info;
}

export async function runAudit(input: AuditInput, grader: Grader, signal?: AbortSignal): Promise<AuditReport> {
  const started = Date.now();
  const messages = splitMessages(input.output);
  const sourcesProvided = Boolean(input.sources?.trim());
  const result = await grader.grade(input, messages, signal);
  const stats = computeStats(result.claims, result.relevance);
  const grade = computeGrade(result.claims, stats);

  return {
    grader: grader.info,
    grade,
    verdictLine: verdictLine(grade, stats, sourcesProvided),
    stats,
    claims: result.claims,
    messages,
    relevance: result.relevance,
    notes: result.notes,
    sourcesProvided,
    createdAt: new Date().toISOString(),
    durationMs: Date.now() - started,
  };
}
