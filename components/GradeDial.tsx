"use client";

import { useEffect, useState } from "react";
import { useCountUp } from "@/lib/motion";

// Dial geometry, in SVG viewBox units.
const W = 240;
const CX = 120;
const CY = 124;
const R = 100;
const TRACK = 8;
const NEEDLE = R - 22;
const TICKS = Array.from({ length: 11 }, (_, i) => i * 10);

function polar(value: number, radius: number) {
  const angle = Math.PI * (1 - value / 100);
  return { x: CX + radius * Math.cos(angle), y: CY - radius * Math.sin(angle) };
}

const ARC = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

/**
 * Instrument-style grade dial. The needle starts at zero and sweeps to the
 * grade once (--dur-dial, ease-out) while the numeral counts up beside it.
 */
export function GradeDial({ grade }: { grade: number | null }) {
  const [armed, setArmed] = useState(false);
  const shown = useCountUp(grade);
  const target = armed && grade !== null ? grade : 0;

  useEffect(() => {
    // Two frames: paint at zero first, so the sweep is actually visible.
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setArmed(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col items-center" role="img" aria-label={grade === null ? "No grade" : `Grade ${grade} out of 100`}>
      <svg viewBox={`0 0 ${W} ${CY + 16}`} className="block w-full overflow-visible" aria-hidden="true">
        <path d={ARC} fill="none" strokeWidth={TRACK} strokeLinecap="round" className="stroke-line" />
        <path
          d={ARC}
          fill="none"
          strokeWidth={TRACK}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100 100"
          strokeDashoffset={100 - target}
          className="stroke-amber transition-[stroke-dashoffset] duration-dial ease-out"
          opacity={grade === null ? 0 : 1}
        />
        {TICKS.map((t) => {
          const major = t % 50 === 0;
          const a = polar(t, R - TRACK - 4);
          const b = polar(t, R - TRACK - (major ? 14 : 9));
          return (
            <line key={t} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={1.5} className={major ? "stroke-muted" : "stroke-faint"} />
          );
        })}
        <g
          style={{ transform: `rotate(${-90 + (target / 100) * 180}deg)`, transformOrigin: `${CX}px ${CY}px` }}
          className="transition-transform duration-dial ease-out"
        >
          <line x1={CX} y1={CY} x2={CX} y2={CY - NEEDLE} strokeWidth={2} strokeLinecap="round" className="stroke-paper" />
        </g>
        <circle cx={CX} cy={CY} r={6} className="fill-ink-950 stroke-paper" strokeWidth={2} />
        <text x={CX - R} y={CY + 16} textAnchor="middle" className="fill-faint font-mono text-12">
          0
        </text>
        <text x={CX + R} y={CY + 16} textAnchor="middle" className="fill-faint font-mono text-12">
          100
        </text>
      </svg>
      <div className="-mt-2 flex items-baseline gap-2">
        <span className="font-display text-64 font-bold tabular-nums tracking-display text-amber">
          {shown === null ? "—" : shown}
        </span>
        <span className="font-mono text-14 text-faint">/100</span>
      </div>
    </div>
  );
}
