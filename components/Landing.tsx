import { HeuristicGrader } from "@/lib/grader/heuristic";
import { runAudit } from "@/lib/grader";
import { SAMPLE_OUTPUT, SAMPLE_SOURCES } from "@/lib/sample";
import { ArrowUpRight } from "lucide-react";
import { Header } from "./Header";
import { SamplePreview } from "./SamplePreview";
import { UseTowerButton } from "./UseTowerButton";

const PROBLEMS = [
  "Your agent sent 500 emails last night. Can you name a single claim it made?",
  "What happens when it invents a funding round that never happened?",
  "Your research lives in six tools. Which one did the email actually cite?",
  "The stat it quoted was true in March. Is it still true?",
  "Your dashboard says the campaign worked. Did anyone read the words?",
  "How many hours a week does your team spend re-reading AI output by hand?",
];

const STANZA = [
  "It doesn't check writing. It checks revenue.",
  "Every claim traced to your research. Every flag one click from the send button.",
  "Built for the team living between the CRM and the outbox.",
];

const OFFER = [
  "Splits agent output into checkable claims",
  "Traces each claim to your research",
  "Flags anything invented, with a confidence score",
  "Scores relevance: did it use the prospect's real details",
  "Suggests a safer line wherever it flags one",
  "Prints the math: the full grade formula on every report",
];

const ARTICLE_URL = "https://akarshsabbavarapu09.hashnode.dev/your-ai-sdr-is-inventing-facts-i-built-the-audit-layer-that-catches-them";

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
            Tower is the trust layer for your outbound. It reads what your agent wrote and checks every claim against your research.
          </p>
        </section>

        <section id="problem" className="scroll-mt-8 border-t border-line pb-24 pt-16 sm:pb-32 sm:pt-24">
          <span className="eyebrow">The problem</span>
          <ul className="mt-12 flex flex-col gap-14 sm:mt-16 sm:gap-20">
            {PROBLEMS.map((q) => (
              <li key={q} className="max-w-2xl text-balance font-display text-24 font-bold tracking-display text-ink sm:text-32">
                {q}
              </li>
            ))}
          </ul>
          <p className="mt-28 max-w-3xl text-balance font-display text-48 font-bold tracking-display text-ink sm:mt-40 sm:text-64">
            For all of these, Tower is the solution.
          </p>
          <UseTowerButton className="mt-12" />
        </section>

        <section id="gtm" className="scroll-mt-8 border-t border-line pb-24 pt-16 sm:pb-40 sm:pt-24">
          <span className="eyebrow">Tailored for GTM</span>
          <div className="mt-12 flex flex-col gap-20 sm:mt-16 sm:gap-32">
            {STANZA.map((line) => (
              <p key={line} className="max-w-3xl text-balance font-display text-32 font-bold tracking-display text-ink sm:text-48">
                {line}
              </p>
            ))}
          </div>
        </section>

        <section id="what-it-does"className="scroll-mt-8 border-t border-line pb-24 pt-16 sm:pb-32 sm:pt-24">
          <span className="eyebrow">What Tower does</span>
          <ul className="mt-10 flex max-w-2xl list-disc flex-col gap-4 pl-5 text-16 text-ink marker:text-faint sm:text-20">
            {OFFER.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>

        <section id="demo" className="scroll-mt-8 border-t border-line pt-16 sm:pt-24">
          <span className="eyebrow">See it work</span>
          <h2 className="mb-10 mt-6 font-display text-48 font-bold tracking-display text-ink sm:text-64">Watch it catch one.</h2>
          <SamplePreview report={report} />
          <p className="mt-6 text-14 text-muted">Sample report. The $40M Series C never happened. Tower caught it before it sent.</p>
          <UseTowerButton className="mt-10" />
        </section>

        <section id="writing" className="scroll-mt-8 mt-24 border-t border-line pt-16 sm:mt-32 sm:pt-24">
          <span className="eyebrow">Writing</span>
          <a
            href={ARTICLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pressable mt-10 flex flex-col gap-6 rounded-card border border-line bg-surface p-6 hover:border-faint sm:p-10"
          >
            <h2 className="max-w-2xl text-balance font-display text-24 font-bold tracking-display text-ink sm:text-32">
              Your AI SDR is inventing facts. I built the audit layer that catches them.
            </h2>
            <p className="max-w-xl text-16 text-muted">
              The story behind Tower: why agents invent claims, and the trust layer I am building for revenue teams.
            </p>
            <span className="readout inline-flex items-center gap-2 text-amber-ink">
              Read on Hashnode
              <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} />
            </span>
          </a>
        </section>
      </main>
    </>
  );
}
