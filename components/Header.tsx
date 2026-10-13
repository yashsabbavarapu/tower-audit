import type { GraderInfo } from "@/lib/grader/types";

export function Header({ grader }: { grader: GraderInfo }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-14 w-full max-w-column items-center justify-between gap-4 px-5">
        <span className="flex items-baseline gap-3">
          <span className="font-display text-20 font-bold tracking-display text-paper">Tower</span>
          <span className="font-mono text-12 text-faint">audit v0</span>
        </span>
        {grader.mode === "demo" ? (
          <span
            className="inline-flex h-6 items-center rounded-chip bg-amber-dim px-3 font-mono text-12 font-medium uppercase tracking-eyebrow text-amber"
            title={grader.reason ?? "No grader API key set: grading uses keyword and number matching"}
          >
            Demo mode
          </span>
        ) : grader.provider === "gemini" ? (
          <span className="flex min-w-0 items-center gap-3">
            <span className="hidden truncate font-mono text-12 text-muted sm:inline">{grader.model}</span>
            <span
              className="inline-flex h-6 shrink-0 items-center rounded-chip border border-line px-3 font-mono text-12 font-medium uppercase tracking-eyebrow text-muted"
              title="Graded by Google Gemini on the AI Studio free tier"
            >
              Gemini · free tier
            </span>
          </span>
        ) : (
          <span className="truncate font-mono text-12 text-muted">{grader.model}</span>
        )}
      </div>
    </header>
  );
}
