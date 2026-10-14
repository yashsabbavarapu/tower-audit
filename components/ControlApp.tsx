"use client";

import { X } from "lucide-react";
import { useCallback, useState } from "react";
import type { AuditEntry, DriftPoint, QueueItem, ReplayResult } from "@/lib/control/types";
import { AuditLogSection } from "./AuditLogSection";
import { Button } from "./Button";
import { DriftSection } from "./DriftSection";
import { Header } from "./Header";
import { QueueDrawer } from "./QueueDrawer";
import { QueueSection } from "./QueueSection";

interface Initial {
  items: QueueItem[];
  entries: AuditEntry[];
  points: DriftPoint[];
  storage: "kv" | "memory";
  authed: boolean;
}

const NAV = [
  { href: "#queue", label: "Queue" },
  { href: "#drift", label: "Drift" },
  { href: "#audit-log", label: "Audit log" },
];

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === "object" && "error" in body && typeof body.error === "string" ? body.error : `Request failed (${response.status}).`;
    throw new Error(message);
  }
  return body as T;
}

const WRITE_SECRET = process.env.NEXT_PUBLIC_TOWER_API_SECRET ?? "";

const post = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json", ...(WRITE_SECRET ? { "x-tower-secret": WRITE_SECRET } : {}) },
  body: JSON.stringify(body),
});

export function ControlApp({ initial }: { initial: Initial }) {
  const [items, setItems] = useState(initial.items);
  const [entries, setEntries] = useState(initial.entries);
  const [points, setPoints] = useState(initial.points);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  const refresh = useCallback(async () => {
    const [q, a, d] = await Promise.all([
      api<{ items: QueueItem[] }>("/api/queue?status=all"),
      api<{ entries: AuditEntry[] }>("/api/audit-log"),
      api<{ points: DriftPoint[] }>("/api/drift"),
    ]);
    setItems(q.items);
    setEntries(a.entries);
    setPoints(d.points);
  }, []);

  const run = useCallback(
    async (work: () => Promise<unknown>) => {
      setBusy(true);
      setError(null);
      try {
        await work();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
      await refresh().catch(() => undefined);
      setBusy(false);
    },
    [refresh],
  );

  const decide = useCallback(
    (id: string, decision: "approved" | "rejected") => {
      setOpenId(null);
      return run(() => api(`/api/queue/${id}/decision`, post({ decision })));
    },
    [run],
  );

  const approveAll = useCallback(
    (ids: string[]) => run(() => Promise.all(ids.map((id) => api(`/api/queue/${id}/decision`, post({ decision: "approved" }))))),
    [run],
  );

  const replay = useCallback(
    async (id: string, sources?: string) => {
      const result = await api<ReplayResult>(`/api/replay/${id}`, post({ sources }));
      refresh().catch(() => undefined);
      return result;
    },
    [refresh],
  );

  const sampleCount = items.filter((i) => i.sample).length;
  const sample = sampleCount === 0 ? "none" : sampleCount === items.length ? "all" : "some";
  const showSample = initial.storage === "memory" || sampleCount > 0;
  const showNotice = !noticeDismissed && (showSample || !initial.authed);
  const openItem = items.find((i) => i.id === openId) ?? null;

  return (
    <>
      <Header />
      {showNotice && (
        <div className="border-b border-line">
          <div className="mx-auto flex w-full max-w-column items-start justify-between gap-4 px-5 py-3">
            <p className="readout text-muted">
              {showSample && (
                <>
                  <span className="text-ink">Sample data</span>
                  <span className="mx-2 text-faint">·</span>
                  Rows tagged SAMPLE are seeded examples, not real agent runs.
                  {initial.storage === "memory" && " Storage is in-memory and resets on restart."}
                </>
              )}
              {!initial.authed && (
                <>
                  {showSample && <span className="mx-2 text-faint">·</span>}
                  API writes are unauthenticated.
                </>
              )}
            </p>
            <Button variant="icon" className="size-6 border-0" aria-label="Dismiss sample data notice" onClick={() => setNoticeDismissed(true)}>
              <X aria-hidden="true" strokeWidth={1.5} className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
      <main className="mx-auto w-full max-w-column px-5 pb-32">
        <section className="flex flex-col items-start gap-6 pb-16 pt-16 sm:gap-8 sm:pb-24 sm:pt-28">
          <span className="eyebrow">Tower control</span>
          <h1 className="max-w-3xl text-balance font-display text-48 font-bold tracking-display text-ink sm:text-64">Nothing sends without clearance.</h1>
          <p className="max-w-xl text-pretty text-16 text-muted sm:text-20">Every agent output waits in the queue. You approve, it sends. Tower grades, traces, and remembers.</p>
          <nav aria-label="On this page" className="flex items-center gap-6 pt-2">
            {NAV.map((l) => (
              <a key={l.href} href={l.href} className="readout rounded-control text-muted transition-colors duration-press ease-out hover:text-ink">
                {l.label}
              </a>
            ))}
          </nav>
        </section>

        <QueueSection items={items} busy={busy} error={error} onOpen={(i) => setOpenId(i.id)} onDecide={decide} onApproveAll={approveAll} />
        <DriftSection points={points} sample={sample} />
        <AuditLogSection entries={entries} />
      </main>
      <QueueDrawer item={openItem} busy={busy} onClose={() => setOpenId(null)} onDecide={decide} onReplay={replay} />
    </>
  );
}
