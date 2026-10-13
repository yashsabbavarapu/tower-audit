import { AnthropicGrader, DEFAULT_MODEL } from "./anthropic";
import { HeuristicGrader } from "./heuristic";
import { splitMessages } from "./messages";
import { computeGrade, computeStats, verdictLine } from "./score";
import type { AuditInput, AuditReport, Grader, GraderInfo } from "./types";

export type * from "./types";

/** The real grader when ANTHROPIC_API_KEY is set; the labeled demo grader otherwise. */
export function getGrader(): Grader {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (apiKey) return new AnthropicGrader(apiKey, process.env.TOWER_MODEL?.trim() || DEFAULT_MODEL);
  return new HeuristicGrader();
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
