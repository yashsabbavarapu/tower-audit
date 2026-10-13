"use client";

import { useState } from "react";
import { stamp } from "@/lib/format";
import type { AuditEntry } from "@/lib/control/types";
import { Button } from "./Button";

const PAGE = 20;

export function AuditLogSection({ entries }: { entries: AuditEntry[] }) {
  const [shown, setShown] = useState(PAGE);
  const visible = entries.slice(0, shown);

  return (
    <section id="audit-log" className="scroll-mt-8 border-t border-line pb-24 pt-20 sm:pb-32 sm:pt-[7.5rem]">
      <span className="eyebrow">Audit log</span>
      <h2 className="mt-6 max-w-3xl text-balance font-display text-32 font-semibold tracking-display text-ink sm:text-48">Everything it did. In order.</h2>

      {entries.length === 0 ? (
        <p className="mt-10 border-y border-line py-8 text-16 text-muted">Nothing logged yet. Grades, approvals and rejections land here.</p>
      ) : (
        <ol className="mt-10 sm:mt-12">
          {visible.map((e) => (
            <li
              key={e.id}
              className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-t border-line py-4 last:border-b md:grid-cols-[10.5rem_9rem_5.5rem_6.5rem_1fr] md:items-baseline md:gap-x-6"
            >
              <time dateTime={e.at} className="readout col-start-1 row-start-1 tabular-nums text-faint md:col-start-1">
                {stamp(e.at)}
              </time>
              <span className="readout col-span-2 row-start-2 truncate text-muted md:col-span-1 md:col-start-2 md:row-start-1">{e.actor}</span>
              <span className="readout col-start-2 row-start-1 text-right text-ink md:col-start-3 md:text-left">{e.action}</span>
              <span className="readout hidden text-faint md:col-start-4 md:row-start-1 md:block">{e.item_id}</span>
              <span className="col-span-2 row-start-3 text-14 text-muted md:col-span-1 md:col-start-5 md:row-start-1">
                {e.detail}
                {e.sample && <span className="readout ml-3 text-faint">Sample</span>}
              </span>
            </li>
          ))}
        </ol>
      )}

      {entries.length > shown && (
        <Button variant="link" className="mt-6" onClick={() => setShown((n) => n + PAGE)}>
          Show more · {entries.length - shown} older
        </Button>
      )}
    </section>
  );
}
