"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type KeyboardEvent } from "react";
import { LIMITS } from "@/lib/limits";
import { SAMPLE_OUTPUT, SAMPLE_SOURCES } from "@/lib/sample";
import { Button } from "./Button";
import { VerdictChip } from "./VerdictChip";

interface Props {
  output: string;
  sources: string;
  error: string | null;
  onOutputChange: (value: string) => void;
  onSourcesChange: (value: string) => void;
  onSubmit: () => void;
}

const FIELD =
  "w-full resize-y rounded-control border border-line bg-ink-900 p-4 text-16 text-paper placeholder:text-faint transition-[border-color,background-color] duration-micro ease-out hover:border-faint focus:border-amber focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-disabled";

const count = (n: number) => n.toLocaleString("en-US");

export function InputPanel({ output, sources, error, onOutputChange, onSourcesChange, onSubmit }: Props) {
  const [sourcesOpen, setSourcesOpen] = useState(sources.length > 0);
  const outputId = useId();
  const sourcesId = useId();
  const [legendOpen, setLegendOpen] = useState(false);
  const legendId = useId();
  const canSubmit = output.trim().length > 0 && output.length <= LIMITS.output && sources.length <= LIMITS.sources;

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && canSubmit) {
      event.preventDefault();
      onSubmit();
    }
  };

  const loadSample = () => {
    onOutputChange(SAMPLE_OUTPUT);
    onSourcesChange(SAMPLE_SOURCES);
    setSourcesOpen(true);
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <span className="eyebrow">Tower Audit</span>
        <h1 className="font-display text-32 font-bold tracking-display text-paper sm:text-48">
          Grade what your AI SDR is about to send.
        </h1>
        <p className="max-w-xl text-16 text-muted">
          Paste emails or messages your agent wrote. Tower breaks them into checkable claims, traces each one to your
          research, and flags anything it made up.
        </p>
      </div>

      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit();
        }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor={outputId} className="eyebrow">
              Agent output
            </label>
            <Button variant="link" onClick={loadSample}>
              Load sample
            </Button>
          </div>
          <textarea
            id={outputId}
            value={output}
            onChange={(e) => onOutputChange(e.target.value)}
            onKeyDown={onKeyDown}
            rows={12}
            spellCheck={false}
            placeholder={"Subject: …\n\nHi Maya,\n\n…\n\n---\n\nSeparate messages with --- or start each with a Subject: line."}
            className={FIELD}
          />
          <span className={`self-end font-mono text-12 ${output.length > LIMITS.output ? "text-amber" : "text-faint"}`}>
            {count(output.length)} / {count(LIMITS.output)}
          </span>
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-6">
          <button
            type="button"
            onClick={() => setSourcesOpen((v) => !v)}
            aria-expanded={sourcesOpen}
            aria-controls={sourcesId}
            className="pressable group flex items-center justify-between gap-4 rounded-control py-2 text-left hover:text-paper"
          >
            <span className="flex flex-col gap-1">
              <span className="eyebrow group-hover:text-paper">Source context · optional</span>
              <span className="text-14 text-muted">The research the agent worked from. Claims are verified against it.</span>
            </span>
            <ChevronDown
              aria-hidden="true"
              strokeWidth={1.5}
              className={`size-5 shrink-0 text-muted transition-transform duration-micro ease-out group-hover:text-paper ${sourcesOpen ? "rotate-180" : ""}`}
            />
          </button>
          {sourcesOpen && (
            <div id={sourcesId} className="flex flex-col gap-2">
              <textarea
                value={sources}
                onChange={(e) => onSourcesChange(e.target.value)}
                onKeyDown={onKeyDown}
                rows={8}
                spellCheck={false}
                aria-label="Source context"
                placeholder={"Press releases, LinkedIn notes, job posts, CRM fields.\nSeparate documents with a blank line; put the URL on its own line."}
                className={FIELD}
              />
              <p className="text-14 text-faint">
                Without sources, most claims come back unverifiable. That&apos;s honest, not a bug.
              </p>
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-control border border-line bg-ink-900 p-4 text-14 text-paper">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" disabled={!canSubmit} className="w-full sm:w-auto sm:self-start">
          Run audit
        </Button>
      </form>

      <section className="border-t border-line pt-4">
        <h2>
          <button
            type="button"
            onClick={() => setLegendOpen((v) => !v)}
            aria-expanded={legendOpen}
            aria-controls={legendId}
            className="pressable group flex w-full items-center justify-between gap-4 rounded-control py-2 text-left"
          >
            <span className="eyebrow group-hover:text-paper">What the verdicts mean</span>
            <ChevronDown
              aria-hidden="true"
              strokeWidth={1.5}
              className={`size-5 shrink-0 text-faint transition-transform duration-press ease-out group-hover:text-paper ${legendOpen ? "rotate-180" : ""}`}
            />
          </button>
        </h2>
        {/* Animates 0fr → 1fr; visibility flips with it so collapsed content leaves the tab order. */}
        <div
          id={legendId}
          className={`grid transition-[grid-template-rows,visibility] duration-press ease-out ${legendOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"}`}
        >
          <dl className="flex min-h-0 flex-col gap-3 overflow-hidden">
            {(
              [
                ["verified", "A source you provided says this."],
                ["unverifiable", "Nothing confirms or contradicts it."],
                ["flagged", "Contradicts your sources, or names something they never mention."],
              ] as const
            ).map(([verdict, meaning], i) => (
              <div
                key={verdict}
                className={`flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4 ${i === 0 ? "pt-3" : ""}`}
              >
                <dt className="sm:w-36">
                  <VerdictChip verdict={verdict} />
                </dt>
                <dd className="text-14 text-muted">{meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
