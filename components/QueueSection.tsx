"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { pad } from "@/lib/format";
import type { QueueItem, QueueStatus } from "@/lib/control/types";
import { Button } from "./Button";
import { APPROVE_CLASS, REJECT_CLASS } from "./QueueDrawer";
import { RelTime } from "./RelTime";

const TABS: QueueStatus[] = ["pending", "approved", "rejected"];

interface Props {
  items: QueueItem[];
  busy: boolean;
  error: string | null;
  onOpen: (item: QueueItem) => void;
  onDecide: (id: string, decision: "approved" | "rejected") => void;
  onApproveAll: (ids: string[]) => void;
}

function ConnectSnippet() {
  const [origin, setOrigin] = useState("https://your-tower-host");
  const [copied, setCopied] = useState(false);
  useEffect(() => setOrigin(window.location.origin), []);

  const snippet = `curl -X POST ${origin}/api/queue \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_name": "outbound-sdr",
    "messages": ["Subject: Quick question\\n\\nHi Maya, ..."],
    "sources": "Paste the research your agent worked from."
  }'`;

  const copy = async () => {
    await navigator.clipboard?.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="mt-16 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <span className="eyebrow">Connect your agent</span>
        <Button variant="link" onClick={copy} aria-label="Copy curl snippet" className="inline-flex items-center gap-2">
          {copied ? <Check aria-hidden="true" strokeWidth={1.5} className="size-3" /> : <Copy aria-hidden="true" strokeWidth={1.5} className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-card border border-line bg-surface p-4 font-mono text-12 text-ink">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}

export function QueueSection({ items, busy, error, onOpen, onDecide, onApproveAll }: Props) {
  const [tab, setTab] = useState<QueueStatus>("pending");
  const [confirming, setConfirming] = useState(false);
  const pending = items.filter((i) => i.status === "pending");
  const rows = items.filter((i) => i.status === tab);
  const pendingFlags = pending.reduce((n, i) => n + i.counts.flagged, 0);
  const flaggedItems = pending.filter((i) => i.counts.flagged > 0).length;

  useEffect(() => {
    if (!pending.length) setConfirming(false);
  }, [pending.length]);

  return (
    <section id="queue" className="scroll-mt-8 border-t border-line pb-[7.5rem] pt-20 sm:pb-40 sm:pt-[7.5rem]">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <span className="eyebrow">Queue · {pad(pending.length)} pending</span>
        {confirming ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-14 text-muted">
              Approve {pending.length}
              {flaggedItems ? `, including ${flaggedItems} with ${pendingFlags} ${pendingFlags === 1 ? "flag" : "flags"}` : ""}?
            </span>
            <Button
              className={APPROVE_CLASS}
              disabled={busy}
              onClick={() => {
                onApproveAll(pending.map((i) => i.id));
                setConfirming(false);
              }}
            >
              Confirm
            </Button>
            <Button onClick={() => setConfirming(false)}>Cancel</Button>
          </div>
        ) : (
          <Button className={APPROVE_CLASS} disabled={busy || pending.length === 0} onClick={() => setConfirming(true)}>
            Approve all pending
          </Button>
        )}
      </div>

      <div className="mt-8 flex items-center gap-6" role="tablist" aria-label="Queue status">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`readout rounded-control border-b border-transparent pb-1 transition-colors duration-press ease-out ${
              tab === t ? "border-amber text-ink" : "text-faint hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-6 text-14 text-signal">
          {error}
        </p>
      )}

      {rows.length === 0 ? (
        tab === "pending" ? (
          <>
            <p className="mt-12 text-balance font-display text-32 font-semibold tracking-display text-ink sm:text-48">The queue is clear.</p>
            <ConnectSnippet />
          </>
        ) : (
          <p className="mt-10 border-y border-line py-8 text-16 text-muted">Nothing {tab} yet.</p>
        )
      ) : (
        <ul className="mt-10">
          {rows.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 border-t border-line py-5 last:border-b sm:flex-row sm:items-center sm:gap-6">
              <button
                type="button"
                onClick={() => onOpen(item)}
                aria-label={`Open ${item.agent_name}, grade ${item.grade ?? "none"}, ${item.counts.claims} claims, ${item.counts.flagged} flags`}
                className="pressable flex min-w-0 flex-1 items-center justify-between gap-6 rounded-card text-left"
              >
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="truncate font-display text-20 font-semibold tracking-display text-ink">{item.agent_name}</span>
                  <span className="readout flex flex-wrap gap-x-3 text-muted">
                    <RelTime iso={item.submitted_at} />
                    <span>{pad(item.counts.claims)} claims</span>
                    <span className={item.counts.flagged ? "text-signal" : ""}>{pad(item.counts.flagged)} flags</span>
                    {item.sample && <span className="text-faint">Sample</span>}
                  </span>
                </span>
                <span className="font-display text-32 font-semibold tabular-nums tracking-display text-ink">{item.grade ?? "—"}</span>
              </button>
              {item.status === "pending" && (
                <div className="flex gap-2">
                  <Button className={`${APPROVE_CLASS} h-9`} disabled={busy} onClick={() => onDecide(item.id, "approved")} aria-label={`Approve ${item.agent_name}`}>
                    Approve
                  </Button>
                  <Button className={`${REJECT_CLASS} h-9`} disabled={busy} onClick={() => onDecide(item.id, "rejected")} aria-label={`Reject ${item.agent_name}`}>
                    Reject
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
