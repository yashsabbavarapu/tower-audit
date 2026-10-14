"use client";

import { ArrowLeft, Check, RotateCcw, Send } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { countOf } from "@/lib/format";
import { RUBRIC } from "@/lib/grader/score";
import type { AuditReport, GradedClaim } from "@/lib/grader/types";
import { Button } from "./Button";
import { ClaimList } from "./ClaimList";
import { FlagCards } from "./FlagCards";
import { GradeDial } from "./GradeDial";
import { SourceDrawer } from "./SourceDrawer";
import { StatRow } from "./StatRow";

interface Props {
  report: AuditReport;
  sources: string;
  onEdit: () => void;
  onReset: () => void;
}

function SectionHeading({ index, title, detail }: { index: string; title: string; detail?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
      <h2 className="eyebrow">
        <span className="text-faint">{index} — </span>
        {title}
      </h2>
      {detail && <span className="readout tabular-nums text-faint">{detail}</span>}
    </div>
  );
}

const WRITE_SECRET = process.env.NEXT_PUBLIC_TOWER_API_SECRET ?? "";

type Sent = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

export function Report({ report, sources, onEdit, onReset }: Props) {
  const [sent, setSent] = useState<Sent>({ kind: "idle" });
  const [active, setActive] = useState<GradedClaim | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const flagged = report.claims.filter((c) => c.verdict === "flagged");

  const open = useCallback((claim: GradedClaim, el: HTMLElement) => {
    trigger.current = el;
    setActive(claim);
  }, []);
  const close = useCallback(() => {
    setActive(null);
    trigger.current?.focus({ preventScroll: true });
  }, []);

  const sendToQueue = useCallback(async () => {
    setSent({ kind: "sending" });
    try {
      const messages = report.messages.map((m) => (m.subject ? `Subject: ${m.subject}\n${m.body}` : m.body));
      const response = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(WRITE_SECRET ? { "x-tower-secret": WRITE_SECRET } : {}) },
        body: JSON.stringify({ agent_name: "Manual audit", messages, sources: sources.trim() ? sources : undefined }),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = body && typeof body === "object" && "error" in body && typeof body.error === "string" ? body.error : `Couldn't reach the queue (${response.status}).`;
        throw new Error(message);
      }
      setSent({ kind: "sent" });
    } catch (err) {
      setSent({ kind: "error", message: err instanceof Error ? err.message : "Couldn't reach the queue." });
    }
  }, [report.messages, sources]);

  const time = new Date(report.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const isDemo = report.grader.mode === "demo";
  // Demo reports already carry their disclaimer in the notes above.
  const attribution = isDemo
    ? null
    : report.grader.provider === "gemini"
      ? `graded by ${report.grader.model} · free tier`
      : "graded by claude";

  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center justify-between gap-3">
        <Button onClick={onEdit}>
          <ArrowLeft aria-hidden="true" strokeWidth={1.5} className="size-4" />
          Edit input
        </Button>
        <Button onClick={onReset}>
          <RotateCcw aria-hidden="true" strokeWidth={1.5} className="size-4" />
          New audit
        </Button>
      </div>
      <div className="-mt-6 flex flex-wrap items-center gap-x-4 gap-y-2" aria-live="polite">
        {sent.kind === "sent" ? (
          <p className="readout flex items-center gap-2 text-muted">
            <Check aria-hidden="true" strokeWidth={1.5} className="size-4 text-sage" />
            In the queue.
            <Link href="/control" className="rounded-control text-amber-ink underline decoration-line underline-offset-4 hover:decoration-amber-ink">
              Open mission control
            </Link>
          </p>
        ) : (
          <>
            <Button onClick={sendToQueue} disabled={sent.kind === "sending"}>
              <Send aria-hidden="true" strokeWidth={1.5} className="size-4" />
              {sent.kind === "sending" ? "Sending…" : "Send to queue"}
            </Button>
            {sent.kind === "error" && <p className="readout text-signal">{sent.message}</p>}
          </>
        )}
      </div>

      <section aria-labelledby="report-title" className="flex flex-col gap-6 rounded-card border border-line bg-surface p-5 sm:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <h1 id="report-title" className="eyebrow">
            Report card
          </h1>
          <span className="readout tabular-nums text-faint">{time}</span>
        </div>
        <GradeDial grade={report.grade} />
        <p className="text-balance text-center font-display text-20 font-semibold tracking-display text-ink sm:text-24">
          {report.verdictLine}
        </p>
        {report.notes.length > 0 && (
          <ul className="flex flex-col gap-2 border-t border-line pt-4">
            {report.notes.map((note) => (
              <li key={note} className={`font-mono text-12 ${isDemo ? "text-amber-ink" : "text-muted"}`}>
                {note}
              </li>
            ))}
          </ul>
        )}
        {attribution && <p className="readout text-faint">{attribution}</p>}
      </section>

      <StatRow stats={report.stats} />

      {flagged.length > 0 && (
        <section className="flex flex-col gap-4" aria-label="Flags">
          <SectionHeading index="01" title="Flags" detail={`${countOf(flagged.length, "flag")} · fix before sending`} />
          <FlagCards claims={flagged} onOpen={open} />
        </section>
      )}

      <section className="flex flex-col gap-4" aria-label="Claims">
        <SectionHeading
          index={flagged.length ? "02" : "01"}
          title="Every claim"
          detail={`${countOf(report.claims.length, "claim")} · ${countOf(report.messages.length, "message")}`}
        />
        {report.claims.length ? (
          <ClaimList claims={report.claims} messages={report.messages} onOpen={open} />
        ) : (
          <p className="rounded-card border border-line bg-surface p-5 text-14 text-muted">
            Tower found no factual claims: no figures, names, events or product promises. Paste output that asserts
            something about a prospect and run it again.
          </p>
        )}
      </section>

      <footer className="flex flex-col gap-2 border-t border-line pt-6 font-mono text-12 text-faint">
        <span className="eyebrow text-faint">How the grade is computed</span>
        <span>
          Verified {RUBRIC.credit.verified} · unverifiable {RUBRIC.credit.unverifiable} · flagged {RUBRIC.credit.flagged},
          averaged out of 100. Relevance {RUBRIC.relevanceWeight * 100}% if scored. Each flag costs {RUBRIC.flagPenalty},
          max {RUBRIC.maxFlagPenalty}.
        </span>
        {report.relevance.rationale && <span>Relevance: {report.relevance.rationale}</span>}
        <span>
          Graded by {report.grader.name}
          {report.grader.model ? ` · ${report.grader.model}` : " · demo mode"}.
        </span>
      </footer>

      <SourceDrawer claim={active} messages={report.messages} onClose={close} />
    </div>
  );
}
