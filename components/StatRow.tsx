"use client";

import type { AuditStats } from "@/lib/grader/types";
import { pad } from "@/lib/format";
import { useCountUp } from "@/lib/motion";

interface StatProps {
  label: string;
  value: number | null;
  suffix?: string;
  detail?: string;
  /** Tint the cell as a warning (Flags with at least one flag). */
  warn?: boolean;
}

export function Stat({ label, value, suffix, detail, warn }: StatProps) {
  const shown = useCountUp(value);
  return (
    <div className="relative flex flex-col bg-surface p-5 sm:p-6">
      {/* The grid's gaps show bg-line through, so the warning tint is a flat layer over the opaque surface. */}
      {warn && <span aria-hidden="true" className="absolute inset-0 bg-signal-dim" />}
      <span className="eyebrow relative">{label}</span>
      <span className="relative mt-3 font-display text-48 font-semibold tabular-nums tracking-display text-ink">
        {shown === null ? "—" : `${shown}${suffix ?? ""}`}
      </span>
      {detail && <span className="readout relative mt-2 tabular-nums text-faint">{detail}</span>}
    </div>
  );
}

/** Hairline-separated stat grid: 2×2 on phones, one row from sm up. */
export function StatRow({ stats }: { stats: AuditStats }) {
  const ofTotal = (n: number) => (stats.claimsChecked ? `${pad(n)} of ${pad(stats.claimsChecked)}` : "no claims");
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-4">
      <Stat label="Claims checked" value={stats.claimsChecked} detail={stats.claimsChecked ? undefined : "no claims"} />
      <Stat label="Verified" value={stats.verifiedPct} suffix="%" detail={ofTotal(stats.verified)} />
      <Stat
        label="Flags"
        value={stats.flagged}
        detail={stats.flagged ? `${pad(stats.flagged)} to fix` : "none raised"}
        warn={stats.flagged > 0}
      />
      <Stat label="Relevance" value={stats.relevance} />
    </div>
  );
}
