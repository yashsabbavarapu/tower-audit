"use client";

import { countOf, pad } from "@/lib/format";
import type { AuditReport } from "@/lib/grader/types";
import { GradeDial } from "./GradeDial";
import { Confidence, VerdictChip } from "./VerdictChip";

/** Static, un-carded render of a real graded report: it sits on the paper like an article figure. */
export function SamplePreview({ report }: { report: AuditReport }) {
  const { stats } = report;
  const claim = report.claims.find((c) => c.verdict === "flagged" && c.flag);
  const flag = claim?.flag;
  const ofTotal = (n: number) => (stats.claimsChecked ? `${pad(n)} of ${pad(stats.claimsChecked)}` : "no claims");
  const readouts = [
    { label: "Claims checked", value: `${stats.claimsChecked}`, detail: undefined },
    { label: "Verified", value: `${stats.verifiedPct}%`, detail: ofTotal(stats.verified) },
    { label: "Flags", value: `${stats.flagged}`, detail: stats.flagged ? `${pad(stats.flagged)} to fix` : "none raised" },
    { label: "Relevance", value: stats.relevance === null ? "—" : `${stats.relevance}`, detail: undefined },
  ];
  return (
    <figure className="m-0 flex flex-col">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
        <span className="eyebrow">Sample report</span>
        <span className="readout tabular-nums text-faint">
          {countOf(report.claims.length, "claim")} · {countOf(report.messages.length, "message")}
        </span>
      </figcaption>
      {/* Decorative: the real thing lives at /audit, so the preview stays out of the tab order and the a11y tree. */}
      <div aria-hidden="true" ref={(el) => el?.setAttribute("inert", "")} className="flex flex-col">
        <div className="flex flex-col gap-6 py-10 sm:py-14">
          <GradeDial grade={report.grade} />
          <p className="mx-auto max-w-2xl text-balance text-center font-display text-20 font-semibold tracking-display text-ink sm:text-24">
            {report.verdictLine}
          </p>
        </div>
        <dl className="m-0 grid grid-cols-2 border-y border-line sm:grid-cols-4">
          {readouts.map((r, i) => (
            <div
              key={r.label}
              className={`flex flex-col py-6 sm:px-6 sm:first:pl-0 ${i % 2 === 1 ? "pl-6 sm:pl-6" : ""} ${
                i > 0 ? "sm:border-l sm:border-line" : ""
              } ${i % 2 === 1 ? "border-l border-line" : ""} ${i > 1 ? "border-t border-line sm:border-t-0" : ""}`}
            >
              <dt className="eyebrow">{r.label}</dt>
              <dd className="m-0 mt-3 font-display text-48 font-semibold tabular-nums leading-none tracking-display text-ink">
                {r.value}
              </dd>
              {r.detail && <span className="readout mt-2 tabular-nums text-faint">{r.detail}</span>}
            </div>
          ))}
        </dl>
        {claim && flag && (
          <article className="flex flex-col gap-4 pt-10 sm:pt-14">
            <div className="flex items-baseline justify-between gap-3">
              <VerdictChip verdict="flagged" />
              <Confidence value={claim.confidence} />
            </div>
            <h3 className="m-0 max-w-2xl font-display text-24 font-semibold tracking-display text-ink sm:text-32">
              {flag.headline}
            </h3>
            <blockquote className="m-0 max-w-2xl border-l border-line pl-4 text-16 text-muted">
              &ldquo;{claim.text}&rdquo;
            </blockquote>
            <p className="m-0 max-w-2xl text-16 text-ink">{flag.explanation}</p>
          </article>
        )}
      </div>
    </figure>
  );
}
