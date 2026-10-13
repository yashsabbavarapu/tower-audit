"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";
import { useCallback, useRef, useState } from "react";
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
      {detail && <span className="font-mono text-12 text-faint">{detail}</span>}
    </div>
  );
}

export function Report({ report, onEdit, onReset }: Props) {
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

  const time = new Date(report.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const isDemo = report.grader.mode === "demo";

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

      <section aria-labelledby="report-title" className="flex flex-col gap-6 rounded-card border border-line bg-ink-900 p-5 sm:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <h1 id="report-title" className="eyebrow">
            Report card
          </h1>
          <span className="font-mono text-12 text-faint">{time}</span>
        </div>
        <GradeDial grade={report.grade} />
        <p className="text-balance text-center font-display text-20 font-semibold tracking-display text-paper sm:text-24">
          {report.verdictLine}
        </p>
        {report.notes.length > 0 && (
          <ul className="flex flex-col gap-2 border-t border-line pt-4">
            {report.notes.map((note) => (
              <li key={note} className={`font-mono text-12 ${isDemo ? "text-amber" : "text-muted"}`}>
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      <StatRow stats={report.stats} />

      {flagged.length > 0 && (
        <section className="flex flex-col gap-4" aria-label="Flags">
          <SectionHeading index="01" title="Flags" detail={`${flagged.length} to fix before sending`} />
          <FlagCards claims={flagged} onOpen={open} />
        </section>
      )}

      <section className="flex flex-col gap-4" aria-label="Claims">
        <SectionHeading
          index={flagged.length ? "02" : "01"}
          title="Every claim"
          detail={`${report.claims.length} across ${report.messages.length} ${report.messages.length === 1 ? "message" : "messages"}`}
        />
        {report.claims.length ? (
          <ClaimList claims={report.claims} messages={report.messages} onOpen={open} />
        ) : (
          <p className="rounded-card border border-line bg-ink-900 p-5 text-14 text-muted">
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
