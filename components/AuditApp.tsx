"use client";

import { useCallback, useRef, useState } from "react";
import { splitMessages } from "@/lib/grader/messages";
import type { AuditReport } from "@/lib/grader/types";
import { Header } from "./Header";
import { InputPanel } from "./InputPanel";
import { LoadingReport } from "./LoadingReport";
import { Report } from "./Report";

type Phase = { kind: "input" } | { kind: "grading"; messageCount: number } | { kind: "report"; report: AuditReport };

export function AuditApp() {
  const [phase, setPhase] = useState<Phase>({ kind: "input" });
  const [output, setOutput] = useState("");
  const [sources, setSources] = useState("");
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  const run = useCallback(async () => {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setError(null);
    setPhase({ kind: "grading", messageCount: splitMessages(output).length });
    window.scrollTo({ top: 0 });

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ output, sources: sources.trim() ? sources : undefined }),
        signal: abort.signal,
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          body && typeof body === "object" && "error" in body && typeof body.error === "string"
            ? body.error
            : `Audit failed (${response.status}).`;
        throw new Error(message);
      }
      setPhase({ kind: "report", report: body as AuditReport });
    } catch (err) {
      if (abort.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Audit failed.");
      setPhase({ kind: "input" });
    }
  }, [output, sources]);

  const cancel = useCallback(() => {
    controller.current?.abort();
    setPhase({ kind: "input" });
  }, []);

  const reset = useCallback(() => {
    setOutput("");
    setSources("");
    setError(null);
    setPhase({ kind: "input" });
  }, []);

  return (
    <>
      <Header />
      <main className="view-enter mx-auto w-full max-w-column px-5 pb-24 pt-10 sm:pt-16">
        {phase.kind === "input" && (
          <InputPanel
            output={output}
            sources={sources}
            error={error}
            onOutputChange={setOutput}
            onSourcesChange={setSources}
            onSubmit={run}
          />
        )}
        {phase.kind === "grading" && <LoadingReport messageCount={phase.messageCount} onCancel={cancel} />}
        {phase.kind === "report" && (
          <Report report={phase.report} sources={sources} onEdit={() => setPhase({ kind: "input" })} onReset={reset} />
        )}
      </main>
    </>
  );
}
