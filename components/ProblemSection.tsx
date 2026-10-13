"use client";

import { useEffect, useRef, useState } from "react";
import { UseTowerButton } from "./UseTowerButton";

const CHAR_MS = 28;
const PAUSE_MS = 400;

/** The problem section: questions type out once, in order, when the section scrolls into view. */
export function ProblemSection({ questions }: { questions: string[] }) {
  const root = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [q, setQ] = useState(0);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setQ(questions.length);
      setDone(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setStarted(true);
        io.disconnect();
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [questions.length]);

  useEffect(() => {
    if (!started || q >= questions.length) return;
    const full = (questions[q] ?? "").length;
    const t = setTimeout(
      () => {
        if (n < full) setN(n + 1);
        else {
          setQ(q + 1);
          setN(0);
        }
      },
      n < full ? CHAR_MS : PAUSE_MS,
    );
    return () => clearTimeout(t);
  }, [started, q, n, questions]);

  useEffect(() => {
    if (started && q >= questions.length) setDone(true);
  }, [started, q, questions.length]);

  return (
    <section ref={root} id="problem" className="scroll-mt-8 border-t border-line pb-24 pt-16 sm:pb-32 sm:pt-24">
      <span className="eyebrow">The problem</span>
      <ul className="mt-12 flex flex-col gap-14 sm:mt-16 sm:gap-20">
        {questions.map((text, i) => {
          const typed = i < q ? text : i === q ? text.slice(0, n) : "";
          return (
            <li key={text} className="grid max-w-2xl font-display text-24 font-bold tracking-display text-ink sm:text-32">
              <span className="sr-only">{text}</span>
              {/* Ghost text reserves the final height so nothing reflows while typing. */}
              <span aria-hidden="true" className="invisible col-start-1 row-start-1 text-balance">
                {text}
              </span>
              <span aria-hidden="true" className="col-start-1 row-start-1 text-balance">
                {typed}
                {started && i === q && <span className="type-cursor" />}
              </span>
            </li>
          );
        })}
      </ul>
      <div className={`transition-opacity duration-[480ms] ease-out ${done ? "visible opacity-100" : "invisible opacity-0"}`}>
        <p className="mt-28 max-w-3xl text-balance font-display text-48 font-bold tracking-display text-ink sm:mt-40 sm:text-64">
          For all of these, Tower is the solution.
        </p>
        <UseTowerButton label="Cross-examine my agent" className="mt-12" />
      </div>
    </section>
  );
}
