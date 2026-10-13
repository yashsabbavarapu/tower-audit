import type { Verdict } from "@/lib/grader/types";

const STYLES: Record<Verdict, { label: string; className: string }> = {
  verified: { label: "Verified", className: "bg-sage-dim text-sage" },
  unverifiable: { label: "Unverifiable", className: "bg-amber-dim text-amber" },
  flagged: { label: "Flagged", className: "bg-signal-dim text-signal" },
};

export const VERDICT_LABEL: Record<Verdict, string> = {
  verified: STYLES.verified.label,
  unverifiable: STYLES.unverifiable.label,
  flagged: STYLES.flagged.label,
};

export function VerdictChip({ verdict }: { verdict: Verdict }) {
  const style = STYLES[verdict];
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center rounded-chip px-3 font-mono text-12 font-medium uppercase tracking-eyebrow ${style.className}`}
    >
      {style.label}
    </span>
  );
}

/** Confidence is shown as a plain percentage, never rounded up to "certain". */
export function Confidence({ value }: { value: number }) {
  const pct = Math.min(99, Math.round(value * 100));
  return (
    <span className="font-mono text-12 text-muted" title="How likely this verdict is correct">
      {pct}% conf
    </span>
  );
}
