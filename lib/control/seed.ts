import { HeuristicGrader } from "@/lib/grader/heuristic";
import { runAudit } from "@/lib/grader";
import { SAMPLE_OUTPUT, SAMPLE_SOURCES } from "@/lib/sample";
import { auditEntry, gradedDetail, itemFromReport } from "./grading";
import type { AuditEntry, QueueItem, QueueStatus } from "./types";

/**
 * Sample data. Every row is graded for real by the demo grader from the built-in sample emails,
 * so claims, counts and grades are consistent. Every row carries `sample: true`; nothing here is a real agent run.
 */
const EMAILS = SAMPLE_OUTPUT.split(/\n\n---\n\n/);
const DAY = 86_400_000;
const HOUR = 3_600_000;

interface Plan {
  agent: string;
  emails: number[];
  withSources: boolean;
  /** Age at submission, in ms before seed time. */
  age: number;
  status: QueueStatus;
  decidedAfter?: number;
}

const PLANS: Plan[] = [
  // Pending
  { agent: "Outbound SDR", emails: [0], withSources: true, age: 12 * 60_000, status: "pending" },
  { agent: "Renewals agent", emails: [1], withSources: true, age: 2 * HOUR, status: "pending" },
  { agent: "Expansion agent", emails: [2], withSources: true, age: 5 * HOUR, status: "pending" },
  // History across the last 14 days
  { agent: "Outbound SDR", emails: [0, 1, 2], withSources: false, age: 13.6 * DAY, status: "approved", decidedAfter: 3 * HOUR },
  { agent: "Outbound SDR", emails: [1], withSources: false, age: 12 * DAY, status: "approved", decidedAfter: HOUR },
  { agent: "Renewals agent", emails: [0, 2], withSources: false, age: 10.5 * DAY, status: "rejected", decidedAfter: 2 * HOUR },
  { agent: "Outbound SDR", emails: [0, 1], withSources: true, age: 9 * DAY, status: "rejected", decidedAfter: 4 * HOUR },
  { agent: "Expansion agent", emails: [1, 2], withSources: true, age: 7.2 * DAY, status: "approved", decidedAfter: 90 * 60_000 },
  { agent: "Renewals agent", emails: [1], withSources: true, age: 5.5 * DAY, status: "approved", decidedAfter: 30 * 60_000 },
  { agent: "Outbound SDR", emails: [0, 1, 2], withSources: true, age: 3.8 * DAY, status: "rejected", decidedAfter: 5 * HOUR },
  { agent: "Expansion agent", emails: [1, 2], withSources: true, age: 2.4 * DAY, status: "approved", decidedAfter: 2 * HOUR },
  { agent: "Renewals agent", emails: [1], withSources: true, age: 0.9 * DAY, status: "approved", decidedAfter: 45 * 60_000 },
];

export async function buildSeed(now = Date.now()): Promise<{ items: QueueItem[]; audit: AuditEntry[] }> {
  const grader = new HeuristicGrader();
  const items: QueueItem[] = [];
  const audit: AuditEntry[] = [];

  for (const plan of PLANS) {
    const messages = plan.emails.flatMap((i) => EMAILS[i] ?? []);
    const sources = plan.withSources ? SAMPLE_SOURCES : undefined;
    const report = await runAudit({ output: messages.join("\n\n---\n\n"), sources }, grader);
    const submitted = new Date(now - plan.age).toISOString();
    const item: QueueItem = {
      ...itemFromReport(report, { agent_name: plan.agent, messages, sources }),
      submitted_at: submitted,
      status: plan.status,
      sample: true,
    };
    audit.push(auditEntry({ at: submitted, actor: plan.agent, action: "graded", item_id: item.id, detail: gradedDetail(item), sample: true }));
    if (plan.status !== "pending") {
      item.decided_at = new Date(now - plan.age + (plan.decidedAfter ?? HOUR)).toISOString();
      audit.push(auditEntry({ at: item.decided_at, actor: "operator", action: plan.status, item_id: item.id, detail: "Sample decision", sample: true }));
    }
    items.push(item);
  }
  return { items, audit };
}
