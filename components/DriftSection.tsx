"use client";

import { useEffect, useRef, useState } from "react";
import { pad, shortDate } from "@/lib/format";
import type { DriftPoint } from "@/lib/control/types";
import { Stat } from "./StatRow";

const HEIGHT = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 32 };
const GRID = [0, 25, 50, 75, 100];
/** Below this much history a line would imply a trend we can't claim. */
const MIN_POINTS = 3;
const MIN_SPAN_DAYS = 6;

const DAY = 86_400_000;
const dayMs = (date: string) => Date.parse(`${date}T00:00:00Z`);

/** Custom SVG line chart, drawn at real pixel width so the mono labels stay legible on phones. */
function Chart({ points }: { points: DriftPoint[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const observer = new ResizeObserver(([entry]) => entry && setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const first = dayMs(points[0]!.date);
  const span = Math.max(DAY, dayMs(points[points.length - 1]!.date) - first);
  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (date: string) => PAD.left + ((dayMs(date) - first) / span) * innerW;
  const y = (grade: number) => PAD.top + (1 - grade / 100) * innerH;

  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p.date).toFixed(1)} ${y(p.avg_grade).toFixed(1)}`).join(" ");
  const tickCount = width < 520 ? 3 : 5;
  const ticks = Array.from({ length: tickCount }, (_, i) => new Date(first + (span * i) / (tickCount - 1)).toISOString().slice(0, 10));

  return (
    <div ref={ref} className="w-full">
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`Average grade per day, ${points.length} days, from ${points[0]!.avg_grade} to ${points[points.length - 1]!.avg_grade}.`}
          className="block overflow-visible font-mono text-12"
        >
          {GRID.map((g) => (
            <g key={g}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(g)} y2={y(g)} className="stroke-line" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(g)} textAnchor="end" dominantBaseline="middle" className="fill-faint">
                {g}
              </text>
            </g>
          ))}
          {ticks.map((date, i) => (
            <text
              key={date}
              x={PAD.left + (innerW * i) / (tickCount - 1)}
              y={HEIGHT - 6}
              textAnchor={i === 0 ? "start" : i === tickCount - 1 ? "end" : "middle"}
              className="fill-faint uppercase"
            >
              {shortDate(date)}
            </text>
          ))}
          <path d={path} fill="none" className="stroke-amber" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p) => (
            <circle key={p.date} cx={x(p.date)} cy={y(p.avg_grade)} r={3} className="fill-paper stroke-amber" strokeWidth={1.5}>
              <title>{`${shortDate(p.date)} · avg ${p.avg_grade} · ${p.batches} batch${p.batches === 1 ? "" : "es"}`}</title>
            </circle>
          ))}
        </svg>
      )}
    </div>
  );
}

export function DriftSection({ points, sample }: { points: DriftPoint[]; sample: "none" | "some" | "all" }) {
  const batches = points.reduce((n, p) => n + p.batches, 0);
  const flags = points.reduce((n, p) => n + p.flags, 0);
  const avg = batches ? Math.round(points.reduce((n, p) => n + p.avg_grade * p.batches, 0) / batches) : null;
  const days = points.length ? Math.round((dayMs(points[points.length - 1]!.date) - dayMs(points[0]!.date)) / DAY) + 1 : 0;
  const enough = points.length >= MIN_POINTS && days > MIN_SPAN_DAYS;

  return (
    <section id="drift" className="scroll-mt-8 border-t border-line pb-[7.5rem] pt-20 sm:pb-40 sm:pt-[7.5rem]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="eyebrow">Drift</span>
        {sample !== "none" && <span className="readout text-faint">{sample === "all" ? "Sample data" : "Includes sample data"}</span>}
      </div>
      <h2 className="mt-6 max-w-3xl text-balance font-display text-32 font-semibold tracking-display text-ink sm:text-48">Is the grade holding?</h2>

      <div className="mt-10 sm:mt-12">
        {enough ? (
          <Chart points={points} />
        ) : (
          <p className="max-w-xl border-y border-line py-8 text-16 text-muted">
            Not enough history to call a trend. The chart draws once there is about a week of graded batches; so far there {batches === 1 ? "is" : "are"} {pad(batches)}{" "}
            across {pad(days)} {days === 1 ? "day" : "days"}.
          </p>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3">
        <Stat label="Batches graded" value={batches} />
        <Stat label="Avg grade" value={avg} detail={batches ? undefined : "no batches"} />
        <Stat label="Flags caught" value={flags} detail={flags ? undefined : "none raised"} />
      </div>
    </section>
  );
}
