/**
 * Tower Audit grading contract.
 *
 * A Grader turns raw agent output (+ optional source context) into graded
 * claims. Graders only judge claims; the grade, stats and verdict line are
 * computed by one shared, deterministic function (see score.ts) so every
 * grader is scored by the same rules.
 */

export type Verdict = "verified" | "unverifiable" | "flagged";

/** What a verdict rests on. "model-knowledge" is never treated as proof. */
export type Basis = "source" | "model-knowledge" | "none";

export type GraderMode = "model" | "demo";

export interface AuditInput {
  /** Pasted agent output: one or more emails / messages. */
  output: string;
  /** Research the agent worked from (CRM notes, press releases, job posts). */
  sources?: string;
}

export interface Message {
  index: number;
  subject: string | null;
  body: string;
}

export interface SourceTrace {
  /** Verbatim text from the provided sources. Never paraphrased. */
  excerpt: string;
  /** First line of the source block the excerpt came from, if any. */
  label: string | null;
  url: string | null;
}

export interface Flag {
  /** Plain-English, one-line statement of what is wrong. */
  headline: string;
  /** Why this would hurt if sent, without jargon. */
  explanation: string;
  /** A safer line the rep could send instead, when one exists. */
  fix: string | null;
}

export interface GradedClaim {
  id: string;
  messageIndex: number;
  text: string;
  verdict: Verdict;
  /** 0–1: how likely this verdict is correct. Honest, not flattering. */
  confidence: number;
  explanation: string;
  basis: Basis;
  source: SourceTrace | null;
  flag: Flag | null;
}

export interface Relevance {
  /** 0–100, or null when there is nothing to judge relevance against. */
  score: number | null;
  rationale: string;
}

/** What a grader produces. */
export interface GraderResult {
  claims: GradedClaim[];
  relevance: Relevance;
  /** Caveats the user should see (e.g. "no sources provided"). */
  notes: string[];
}

export type GraderProvider = "anthropic" | "gemini";

export interface GraderInfo {
  name: string;
  mode: GraderMode;
  model: string | null;
  /** Which model API grades. Absent in demo mode. */
  provider?: GraderProvider;
  /** Why demo mode is running, in plain English. */
  reason?: string;
}

export interface Grader {
  readonly info: GraderInfo;
  grade(input: AuditInput, messages: Message[], signal?: AbortSignal): Promise<GraderResult>;
}

export interface AuditStats {
  claimsChecked: number;
  verified: number;
  unverifiable: number;
  flagged: number;
  /** 0–100, rounded. Null when there are no claims. */
  verifiedPct: number | null;
  relevance: number | null;
}

export interface AuditReport {
  grader: GraderInfo;
  /** 0–100, or null when no checkable claims were found. */
  grade: number | null;
  verdictLine: string;
  stats: AuditStats;
  claims: GradedClaim[];
  messages: Message[];
  relevance: Relevance;
  notes: string[];
  sourcesProvided: boolean;
  createdAt: string;
  durationMs: number;
}
