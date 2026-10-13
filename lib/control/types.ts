import type { GradedClaim } from "@/lib/grader/types";

export type QueueStatus = "pending" | "approved" | "rejected";

export interface QueueItem {
  id: string;
  agent_name: string;
  submitted_at: string;
  messages: string[];
  sources?: string;
  /** 0–100, or null when the batch held no checkable claims. */
  grade: number | null;
  counts: { claims: number; verified: number; unverifiable: number; flagged: number };
  status: QueueStatus;
  claims: GradedClaim[];
  decided_at?: string;
  sample?: boolean;
  /** Set when the batch was graded by the demo grader, so the UI can say so. */
  demo?: boolean;
}

export type AuditAction = "graded" | "approved" | "rejected" | "replayed";

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: AuditAction;
  item_id: string;
  detail: string;
  sample?: boolean;
}

export interface DriftPoint {
  date: string;
  avg_grade: number;
  batches: number;
  flags: number;
}

export interface ReplayResult {
  old_grade: number | null;
  new_grade: number | null;
  rotted_claims: GradedClaim[];
}
