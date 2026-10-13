"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { pad } from "@/lib/format";
import type { QueueItem, ReplayResult } from "@/lib/control/types";
import type { GradedClaim } from "@/lib/grader/types";
import { Button } from "./Button";
import { RelTime } from "./RelTime";
import { Confidence, VerdictChip } from "./VerdictChip";

export const APPROVE_CLASS = "h-10 border-line text-sage hover:border-sage hover:bg-sage-dim";
export const REJECT_CLASS = "h-10 border-line text-signal hover:border-signal hover:bg-signal-dim";

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

interface Props {
  item: QueueItem | null;
  busy: boolean;
  onClose: () => void;
  onDecide: (id: string, decision: "approved" | "rejected") => void;
  onReplay: (id: string, sources?: string) => Promise<ReplayResult>;
}

function ClaimRow({ claim }: { claim: GradedClaim }) {
  return (
    <li className="flex flex-col gap-3 border-t border-line py-5 first:border-t-0 first:pt-0">
      <p className="text-16 text-ink">{claim.text}</p>
      <div className="flex flex-wrap items-center gap-3">
        <VerdictChip verdict={claim.verdict} />
        <Confidence value={claim.confidence} />
      </div>
      <p className="text-14 text-muted">{claim.explanation}</p>
      {claim.source && <blockquote className="border-l border-amber pl-3 text-14 text-ink">{claim.source.excerpt}</blockquote>}
      {claim.flag?.fix && (
        <p className="text-14 text-muted">
          <span className="readout mr-2 text-faint">Safer line</span>
          {claim.flag.fix}
        </p>
      )}
    </li>
  );
}

/** Bottom sheet (same pattern as the source drawer) with the full graded claims for one queue item. */
export function QueueDrawer({ item, busy, onClose, onDecide, onReplay }: Props) {
  const open = item !== null;
  const [shown, setShown] = useState<QueueItem | null>(item);
  const [replayOpen, setReplayOpen] = useState(false);
  const [replaySources, setReplaySources] = useState("");
  const [replaying, setReplaying] = useState(false);
  const [replay, setReplay] = useState<ReplayResult | { error: string } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (item) {
      setShown(item);
    }
  }, [item]);

  // A different item starts with a clean replay panel.
  const shownId = item?.id;
  useEffect(() => {
    setReplayOpen(false);
    setReplaySources("");
    setReplay(null);
  }, [shownId]);

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

  const runReplay = async () => {
    if (!shown) return;
    setReplaying(true);
    setReplay(null);
    try {
      setReplay(await onReplay(shown.id, replaySources.trim() ? replaySources : undefined));
    } catch (err) {
      setReplay({ error: err instanceof Error ? err.message : "Replay failed." });
    } finally {
      setReplaying(false);
    }
  };

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
        aria-labelledby="queue-drawer-title"
        className={`absolute inset-x-0 bottom-0 mx-auto flex max-h-drawer w-full max-w-column flex-col rounded-t-card border border-b-0 border-line bg-surface duration-drawer ease-out ${
          open ? "visible translate-y-0 transition-transform" : "invisible translate-y-full transition-[transform,visibility]"
        }`}
      >
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 id="queue-drawer-title" className="eyebrow">
            {shown?.status === "pending" || !shown ? "Awaiting clearance" : shown.status}
          </h2>
          <Button ref={closeRef} variant="icon" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" strokeWidth={1.5} className="size-4 shrink-0" />
          </Button>
        </header>

        {shown && (
          <>
            <div className="flex flex-col gap-8 overflow-y-auto overscroll-contain px-5 pb-6 pt-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-display text-24 font-semibold tracking-display text-ink">{shown.agent_name}</p>
                  <span className="font-display text-32 font-semibold tabular-nums tracking-display text-ink">{shown.grade ?? "—"}</span>
                </div>
                <p className="readout flex flex-wrap gap-x-3 text-muted">
                  <RelTime iso={shown.submitted_at} />
                  <span>{pad(shown.counts.claims)} claims</span>
                  <span className={shown.counts.flagged ? "text-signal" : ""}>{pad(shown.counts.flagged)} flags</span>
                  {shown.sample && <span className="text-faint">Sample</span>}
                </p>
                {shown.demo && (
                  <p className="text-14 text-muted">Graded in demo mode: shallow checks, confidence capped at 75%. Not a substitute for a model grade.</p>
                )}
              </div>

              <details className="group">
                <summary className="readout cursor-pointer list-none rounded-control text-muted hover:text-ink">
                  Messages · {pad(shown.messages.length)}
                  <span className="ml-2 text-faint group-open:hidden">show</span>
                </summary>
                <div className="mt-4 flex flex-col gap-4">
                  {shown.messages.map((m, i) => (
                    <pre key={i} className="whitespace-pre-wrap border-l border-line pl-3 font-body text-14 text-ink">
                      {m}
                    </pre>
                  ))}
                </div>
              </details>

              {shown.claims.length ? (
                <ul>
                  {shown.claims.map((c) => (
                    <ClaimRow key={c.id} claim={c} />
                  ))}
                </ul>
              ) : (
                <p className="text-14 text-muted">No checkable claims found in this batch.</p>
              )}

              {replayOpen && (
                <div className="flex flex-col gap-4 border-t border-line pt-6">
                  <label htmlFor="replay-sources" className="eyebrow">
                    Current sources · optional
                  </label>
                  <textarea
                    id="replay-sources"
                    value={replaySources}
                    onChange={(e) => setReplaySources(e.target.value)}
                    rows={4}
                    placeholder="Leave empty to replay against the sources stored with this item."
                    className="w-full resize-y rounded-control border border-line bg-paper p-3 text-14 text-ink placeholder:text-faint hover:border-faint"
                  />
                  <Button variant="outline" className="h-10 self-start text-14" disabled={replaying} onClick={runReplay}>
                    {replaying ? "Replaying…" : "Run replay"}
                  </Button>
                  {replay && "error" in replay && (
                    <p role="alert" className="text-14 text-signal">
                      {replay.error}
                    </p>
                  )}
                  {replay && !("error" in replay) && (
                    <div className="flex flex-col gap-4" aria-live="polite">
                      <p className="readout tabular-nums text-ink">
                        Grade {replay.old_grade ?? "—"} → {replay.new_grade ?? "—"}
                      </p>
                      {replay.rotted_claims.length ? (
                        <ul>
                          {replay.rotted_claims.map((c) => (
                            <ClaimRow key={c.id} claim={c} />
                          ))}
                        </ul>
                      ) : (
                        <p className="text-14 text-muted">No claim got worse. Everything that held still holds.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <footer className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4">
              {shown.status === "pending" && (
                <>
                  <Button className={APPROVE_CLASS} disabled={busy} onClick={() => onDecide(shown.id, "approved")}>
                    Approve
                  </Button>
                  <Button className={REJECT_CLASS} disabled={busy} onClick={() => onDecide(shown.id, "rejected")}>
                    Reject
                  </Button>
                </>
              )}
              <Button variant="link" className="ml-auto" aria-expanded={replayOpen} onClick={() => setReplayOpen((v) => !v)}>
                Replay
              </Button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
