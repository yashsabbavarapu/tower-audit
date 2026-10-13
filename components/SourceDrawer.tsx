"use client";

import { ExternalLink, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Basis, GradedClaim, Message } from "@/lib/grader/types";
import { Button } from "./Button";
import { messageLabel } from "./ClaimList";
import { Confidence, VerdictChip } from "./VerdictChip";

const BASIS_LABEL: Record<Basis, string> = {
  source: "Traced to your sources",
  "model-knowledge": "Model's general knowledge — not proof",
  none: "No supporting source",
};

interface Props {
  claim: GradedClaim | null;
  messages: Message[];
  onClose: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Bottom sheet with the source trace for one claim. Slides up over a scrim
 * (--dur-drawer, ease-out). Keeps the last claim rendered while sliding out.
 */
export function SourceDrawer({ claim, messages, onClose }: Props) {
  const open = claim !== null;
  const [shown, setShown] = useState<GradedClaim | null>(claim);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (claim) setShown(claim);
  }, [claim]);

  useEffect(() => {
    const panel = panelRef.current;
    if (panel) panel.inert = !open;
    if (!open) return;

    closeRef.current?.focus({ preventScroll: true });
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  const message = shown ? messages.find((m) => m.index === shown.messageIndex) : undefined;

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-scrim transition-opacity duration-drawer ease-out ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={`absolute inset-x-0 bottom-0 mx-auto flex max-h-drawer w-full max-w-column flex-col rounded-t-card border border-b-0 border-line bg-ink-900 duration-drawer ease-out ${
          // Visible immediately on open (so focus can land); hidden only after the slide-out.
          open ? "visible translate-y-0 transition-transform" : "invisible translate-y-full transition-[transform,visibility]"
        }`}
      >
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 id="drawer-title" className="eyebrow">
            Source trace
          </h2>
          <Button ref={closeRef} variant="icon" onClick={onClose} aria-label="Close source trace">
            <X aria-hidden="true" strokeWidth={1.5} className="size-4 shrink-0" />
          </Button>
        </header>

        {shown && (
          <div className="flex flex-col gap-6 overflow-y-auto overscroll-contain px-5 pb-8 pt-5">
            <div className="flex flex-col gap-3">
              <span className="truncate font-mono text-12 text-faint">{messageLabel(message, shown.messageIndex)}</span>
              <p className="font-display text-20 font-semibold tracking-display text-paper">{shown.text}</p>
              <div className="flex flex-wrap items-center gap-3">
                <VerdictChip verdict={shown.verdict} />
                <Confidence value={shown.confidence} />
              </div>
            </div>

            <p className="text-16 text-muted">{shown.explanation}</p>

            <div className="flex flex-col gap-3">
              <span className="eyebrow">{BASIS_LABEL[shown.basis]}</span>
              {shown.source ? (
                <figure className="flex flex-col gap-3 rounded-card border border-line bg-ink-950 p-4">
                  <blockquote className="border-l border-amber pl-3 text-16 text-paper">{shown.source.excerpt}</blockquote>
                  {(shown.source.label || shown.source.url) && (
                    <figcaption className="flex flex-col gap-2">
                      {shown.source.label && <span className="text-14 text-muted">{shown.source.label}</span>}
                      {shown.source.url && (
                        <a
                          href={shown.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pressable inline-flex w-fit items-center gap-2 rounded-control font-mono text-12 text-amber underline decoration-amber-dim underline-offset-4 hover:text-amber-hover hover:decoration-amber active:opacity-disabled"
                        >
                          <span className="break-all">{shown.source.url}</span>
                          <ExternalLink aria-hidden="true" strokeWidth={1.5} className="size-3 shrink-0" />
                        </a>
                      )}
                    </figcaption>
                  )}
                </figure>
              ) : (
                <p className="rounded-card border border-line bg-ink-950 p-4 text-14 text-muted">
                  No excerpt. Nothing in the provided sources supports this claim, so Tower shows no trace rather than inventing one.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
