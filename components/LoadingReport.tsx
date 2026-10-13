"use client";

import { useEffect, useState } from "react";
import { Button } from "./Button";

const Block = ({ className }: { className: string }) => <div className={`animate-pulse bg-ink-800 ${className}`} />;

/** Pulsing-opacity skeleton in the report's shape. Elapsed time is real, not a fake progress bar. */
export function LoadingReport({ messageCount, onCancel }: { messageCount: number; onCancel: () => void }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-12 text-muted">
          Auditing {messageCount} {messageCount === 1 ? "message" : "messages"} · splitting claims, tracing sources ·{" "}
          <span className="tabular-nums text-paper">{seconds}s</span>
        </p>
        <Button onClick={onCancel}>Cancel</Button>
      </div>

      <div className="flex flex-col items-center gap-6 rounded-card border border-line bg-ink-900 p-6">
        <Block className="h-32 w-full max-w-xs rounded-t-chip" />
        <Block className="h-6 w-3/4 rounded-control" />
        <div className="grid w-full grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2 bg-ink-900 p-4">
              <Block className="h-3 w-16 rounded-control" />
              <Block className="h-8 w-12 rounded-control" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-card border border-line bg-ink-900 p-4">
            <Block className="h-4 w-full rounded-control" />
            <Block className="h-4 w-2/3 rounded-control" />
            <Block className="h-6 w-24 rounded-chip" />
          </div>
        ))}
      </div>
    </div>
  );
}
