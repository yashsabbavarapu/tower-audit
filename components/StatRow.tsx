"use client";

import type { AuditStats } from "@/lib/grader/types";
import { useCountUp } from "@/lib/motion";

interface StatProps {
  label: string;
  value: number | null;
  suffix?: string;
  detail?: string;
  /** Tint the cell as a warning (Flags with at least one flag). */
  warn?: boolean;
}

// The grid's gaps show bg-line through, so the warning tint is layered over the
// opaque surface rather than replacing it.
const WARN_TINT = "[background-image:linear-gradient(var(--signal-dim),var(--signal-dim))]";

function Stat({ label, value, suffix, detail, warn }: StatProps) {
  const shown = useCountUp(value);
  return (
    <div className={`flex flex-col bg-ink-900 p-5 sm:p-6 ${warn ? WARN_TINT : ""}`}>
      <span className="eyebrow">{label}</span>
      <span className="mt-3 font-display text-48 font-semibold tabular-nums tracking-display text-paper">
        {shown === null ? "—" : `${shown}${suffix ?? ""}`}
      </span>
      {detail && <span className="mt-2 text-12 text-faint">{detail}</span>}
    </div>
  );
}

/** Hairline-separated stat grid: 2×2 on phones, one row from sm up. */
export function StatRow({ stats }: { stats: AuditStats }) {
  const ofTotal = (n: number) => (stats.claimsChecked ? `${n} of ${stats.claimsChecked}` : "no claims");
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-4">
      <Stat label="Claims checked" value={stats.claimsChecked} detail={stats.claimsChecked ? undefined : "no claims"} />
      <Stat label="Verified" value={stats.verifiedPct} suffix="%" detail={ofTotal(stats.verified)} />
      <Stat
        label="Flags"
        value={stats.flagged}
        detail={stats.flagged ? `${stats.flagged} to fix` : "none raised"}
        warn={stats.flagged > 0}
      />
      <Stat label="Relevance" value={stats.relevance} />
    </div>
  );
}
