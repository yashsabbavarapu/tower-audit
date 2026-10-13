import { HeuristicGrader } from "@/lib/grader/heuristic";
import { runAudit } from "@/lib/grader";
import { SAMPLE_OUTPUT, SAMPLE_SOURCES } from "@/lib/sample";
import { Header } from "./Header";
import { SamplePreview } from "./SamplePreview";
import { UseTowerButton } from "./UseTowerButton";

/** The tease before the tool. Server-rendered; the sample report is graded once, offline, by the demo grader. */
export async function Landing() {
  const report = await runAudit({ output: SAMPLE_OUTPUT, sources: SAMPLE_SOURCES }, new HeuristicGrader());

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-column px-5 pb-24">
        <section className="flex flex-col items-start gap-6 pb-16 pt-16 sm:gap-8 sm:pb-24 sm:pt-28">
          <span className="eyebrow">Tower Audit</span>
          <h1 className="max-w-3xl text-balance font-display text-48 font-bold tracking-display text-ink sm:text-64">
            Know what your AI SDR sends before your prospects do.
          </h1>
          <p className="max-w-xl text-16 text-muted sm:text-20">
            Paste the emails your agent wrote. Tower checks every claim against your research and flags anything it made up.
          </p>
          <UseTowerButton className="mt-2 w-full sm:w-auto" />
        </section>

        <div className="border-t border-line pt-8 sm:pt-12">
          <SamplePreview report={report} />
        </div>
      </main>
    </>
  );
}
