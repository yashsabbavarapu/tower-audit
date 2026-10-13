import { getGrader, runAudit } from "@/lib/grader";
import type { AuditReport, GradedClaim, Verdict } from "@/lib/grader/types";
import type { AuditEntry, DriftPoint, QueueItem, ReplayResult } from "./types";

/** Messages are joined with the same separator the splitter honours, so one array entry stays one message. */
const joinMessages = (messages: string[]) => messages.join("\n\n---\n\n");

export const newId = (prefix: string) => `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;

export function auditEntry(entry: Omit<AuditEntry, "id" | "at"> & { at?: string }): AuditEntry {
  return { id: newId("a"), at: new Date().toISOString(), ...entry };
}

export function gradeReport(messages: string[], sources: string | undefined, signal?: AbortSignal): Promise<AuditReport> {
  return runAudit({ output: joinMessages(messages), sources }, getGrader(), signal);
}

export function itemFromReport(
  report: AuditReport,
  input: { agent_name: string; messages: string[]; sources?: string },
): QueueItem {
  return {
    id: newId("q"),
    agent_name: input.agent_name,
    submitted_at: report.createdAt,
    messages: input.messages,
    ...(input.sources?.trim() ? { sources: input.sources } : {}),
    grade: report.grade,
    counts: {
      claims: report.stats.claimsChecked,
      verified: report.stats.verified,
      unverifiable: report.stats.unverifiable,
      flagged: report.stats.flagged,
    },
    status: "pending",
    claims: report.claims,
    ...(report.grader.mode === "demo" ? { demo: true } : {}),
  };
}

export function gradedDetail(item: QueueItem): string {
  const grade = item.grade === null ? "no grade" : `grade ${item.grade}`;
  const demo = item.demo ? " · demo grader" : "";
  return `${grade} · ${item.counts.claims} claims · ${item.counts.flagged} flagged${demo}`;
}

const SEVERITY: Record<Verdict, number> = { verified: 0, unverifiable: 1, flagged: 2 };
const norm = (text: string) => text.toLowerCase().replace(/\s+/g, " ").trim();

/** Claims present in both gradings whose verdict got worse, returned as they now grade. */
export function rottedClaims(before: GradedClaim[], after: GradedClaim[]): GradedClaim[] {
  const old = new Map(before.map((c) => [norm(c.text), c]));
  return after.filter((c) => {
    const prior = old.get(norm(c.text));
    return prior !== undefined && SEVERITY[c.verdict] > SEVERITY[prior.verdict];
  });
}

export function replayResult(item: QueueItem, report: AuditReport): ReplayResult {
  return { old_grade: item.grade, new_grade: report.grade, rotted_claims: rottedClaims(item.claims, report.claims) };
}

/** Average grade per UTC day across every graded item. Ungraded batches count as batches but not in the average. */
export function driftPoints(items: QueueItem[]): DriftPoint[] {
  const days = new Map<string, { sum: number; graded: number; batches: number; flags: number }>();
  for (const item of items) {
    const date = item.submitted_at.slice(0, 10);
    const day = days.get(date) ?? { sum: 0, graded: 0, batches: 0, flags: 0 };
    day.batches += 1;
    day.flags += item.counts.flagged;
    if (item.grade !== null) {
      day.sum += item.grade;
      day.graded += 1;
    }
    days.set(date, day);
  }
  return Array.from(days, ([date, d]) => ({ date, d }))
    .filter(({ d }) => d.graded > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(({ date, d }) => ({ date, avg_grade: Math.round((d.sum / d.graded) * 10) / 10, batches: d.batches, flags: d.flags }));
}
