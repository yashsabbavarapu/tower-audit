"use client";

import { useEffect, useState } from "react";
import { relativeTime, stamp } from "@/lib/format";

/** Relative time depends on the clock, so the server renders the UTC stamp and the client swaps in "12 min ago". */
export function RelTime({ iso }: { iso: string }) {
  const [text, setText] = useState(() => stamp(iso));
  useEffect(() => {
    setText(relativeTime(iso));
    const id = setInterval(() => setText(relativeTime(iso)), 30_000);
    return () => clearInterval(id);
  }, [iso]);
  return (
    <time dateTime={iso} title={stamp(iso)}>
      {text}
    </time>
  );
}
