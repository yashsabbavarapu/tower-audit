import { ChevronRight } from "lucide-react";
import type { GradedClaim, Message } from "@/lib/grader/types";
import { Confidence, VerdictChip } from "./VerdictChip";

export function messageLabel(message: Message | undefined, index: number): string {
  return `Message ${index + 1}${message?.subject ? ` · ${message.subject}` : ""}`;
}

interface Props {
  claims: GradedClaim[];
  messages: Message[];
  onOpen: (claim: GradedClaim, trigger: HTMLElement) => void;
}

/** Every claim, grouped by the message it came from. Each row opens the source drawer. */
export function ClaimList({ claims, messages, onOpen }: Props) {
  const groups = messages
    .map((message) => ({ message, claims: claims.filter((c) => c.messageIndex === message.index) }))
    .filter((group) => group.claims.length > 0);

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ message, claims: groupClaims }) => (
        <section key={message.index} className="flex flex-col gap-2">
          <h3 className="truncate font-mono text-12 text-faint">{messageLabel(message, message.index)}</h3>
          <ul className="flex flex-col gap-2">
            {groupClaims.map((claim) => (
              <li key={claim.id}>
                <button
                  type="button"
                  onClick={(e) => onOpen(claim, e.currentTarget)}
                  className="pressable group flex w-full items-start gap-3 rounded-card border border-line bg-ink-900 p-4 text-left hover:border-faint hover:bg-ink-800 active:bg-ink-900"
                  aria-label={`${claim.verdict}: ${claim.text}. Open source trace.`}
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-3">
                    <span className="text-16 text-paper">{claim.text}</span>
                    <span className="flex flex-wrap items-baseline gap-3">
                      <VerdictChip verdict={claim.verdict} />
                      <Confidence value={claim.confidence} />
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="mt-1 size-4 shrink-0 text-faint transition-[transform,color] duration-micro ease-out group-hover:translate-x-0.5 group-hover:text-muted"
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
