import { ChevronRight } from "lucide-react";
import type { GradedClaim } from "@/lib/grader/types";
import { Confidence, VerdictChip } from "./VerdictChip";

interface Props {
  claims: GradedClaim[];
  onOpen: (claim: GradedClaim, trigger: HTMLElement) => void;
}

/** Hallucination flags in plain English: what's wrong, why it hurts, what to send instead. */
export function FlagCards({ claims, onOpen }: Props) {
  return (
    <ul className="flex flex-col gap-3">
      {claims.map((claim) => {
        const flag = claim.flag;
        if (!flag) return null;
        return (
          <li key={claim.id}>
            <button
              type="button"
              onClick={(e) => onOpen(claim, e.currentTarget)}
              className="pressable group flex w-full items-start gap-3 rounded-card border border-line bg-surface p-5 text-left hover:border-faint hover:bg-paper active:bg-surface"
              aria-label={`Flagged: ${flag.headline}. Open source trace.`}
            >
              <span className="flex min-w-0 flex-1 flex-col gap-4">
                <span className="flex items-baseline justify-between gap-3">
                  <VerdictChip verdict="flagged" />
                  <Confidence value={claim.confidence} />
                </span>
                <span className="font-display text-20 font-semibold tracking-display text-ink">{flag.headline}</span>
                <span className="border-l border-line pl-3 text-14 text-muted">&ldquo;{claim.text}&rdquo;</span>
                <span className="text-16 text-ink">{flag.explanation}</span>
                {flag.fix && (
                  <span className="flex flex-col gap-1">
                    <span className="eyebrow">Instead</span>
                    <span className="text-14 text-muted">{flag.fix}</span>
                  </span>
                )}
              </span>
              <ChevronRight
                aria-hidden="true"
                strokeWidth={1.5}
                className="mt-1 size-4 shrink-0 text-faint transition-[transform,color] duration-micro ease-out group-hover:translate-x-0.5 group-hover:text-ink"
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
