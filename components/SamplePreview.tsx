"use client";

import { countOf } from "@/lib/format";
import type { AuditReport } from "@/lib/grader/types";
import { FlagCards } from "./FlagCards";
import { GradeDial } from "./GradeDial";
import { StatRow } from "./StatRow";

/** A static, non-interactive render of a real report card: the landing's "this is what you get". */
export function SamplePreview({ report }: { report: AuditReport }) {
  const topFlag = report.claims.filter((c) => c.verdict === "flagged").slice(0, 1);
  return (
    <figure className="m-0 overflow-hidden rounded-card border border-line">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-3 sm:px-8">
        <span className="eyebrow">Sample report</span>
        <span className="readout tabular-nums text-faint">
          {countOf(report.claims.length, "claim")} · {countOf(report.messages.length, "message")}
        </span>
      </figcaption>
      {/* Decorative: the real thing lives at /audit, so the preview stays out of the tab order and the a11y tree. */}
      <div aria-hidden="true" ref={(el) => el?.setAttribute("inert", "")} className="flex flex-col gap-6 p-5 sm:p-8">
        <section className="flex flex-col gap-6 rounded-card border border-line bg-surface p-5 sm:p-8">
          <GradeDial grade={report.grade} />
          <p className="text-balance text-center font-display text-20 font-bold tracking-display text-ink sm:text-24">
            {report.verdictLine}
          </p>
        </section>
        <StatRow stats={report.stats} />
        <FlagCards claims={topFlag} onOpen={() => {}} />
      </div>
    </figure>
  );
}
