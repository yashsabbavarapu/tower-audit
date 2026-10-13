"use client";

import { useEffect, useState } from "react";

/** Read a duration token (e.g. --dur-dial) from styles/tokens.css, in ms. */
export function readDuration(token: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return fallback;
  return raw.endsWith("ms") ? value : value * 1000;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Odometer count-up, timed to the dial (--dur-dial) so numbers and needle settle together. */
export function useCountUp(target: number | null): number | null {
  const [value, setValue] = useState<number | null>(target === null ? null : 0);

  useEffect(() => {
    if (target === null) {
      setValue(null);
      return;
    }
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }
    const duration = readDuration("--dur-dial", 600);
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * easeOut(t)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}
