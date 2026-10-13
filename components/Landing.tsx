import { HeuristicGrader } from "@/lib/grader/heuristic";
import { runAudit } from "@/lib/grader";
import { SAMPLE_OUTPUT, SAMPLE_SOURCES } from "@/lib/sample";
import { ArrowUpRight } from "lucide-react";
import { Header } from "./Header";
import { SamplePreview } from "./SamplePreview";
import { ProblemSection } from "./ProblemSection";
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

const WHY_US = [
  "Every grade prints its formula. No black box.",
  "It admits what it can't check. Unverifiable is a verdict, not a shrug.",
  "Every flag comes with a safer line. A flag without a fix is just anxiety.",
];

const CUSTOMERS = [
  "GTM engineers. You ship the agents. Tower is the pre-send check.",
  "RevOps leaders. You own the number. Tower shows what the machines said to get it.",
  "Founders. Your first SDR is software. Tower is its editor.",
];

const OFFER = [
  "Decomposes agent output into atomic, checkable claims.",
  "Traces every claim to its source.",
  "Flags invented facts with calibrated confidence.",
  "Scores relevance against your prospect data.",
  "Supplies the safer line for every flag.",
  "Prints the full grading formula on every report.",
];

const LINKEDIN_URL = "https://www.linkedin.com/in/akarsh-sabbavarapu/";
const EMAIL_URL = "mailto:yashwanthakarsh.sabbavarapu@gmail.com";
const CONTACT_LINK = "readout pressable text-muted hover:text-amber-ink focus-visible:text-amber-ink";

const VISION = [
  "The trust layer for revenue.",
  "Every AI system touching your pipeline: cited, measured, honest about its limits.",
  "Audit is the wedge. Approvals, replay, and drift monitoring are next.",
];

const ARTICLE_URL = "https://akarshsabbavarapu09.hashnode.dev/your-ai-sdr-is-inventing-facts-i-built-the-audit-layer-that-catches-them";

/** The tease before the tool. Server-rendered; the sample report is graded once, offline, by the demo grader. */
export async function Landing() {
  const report = await runAudit({ output: SAMPLE_OUTPUT, sources: SAMPLE_SOURCES }, new HeuristicGrader());

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-column px-5 pb-32">
        <section className="flex flex-col items-start gap-6 pb-20 pt-20 sm:gap-8 sm:pb-[7.5rem] sm:pt-36">
          <span className="eyebrow">Tower.audit</span>
          <h1 className="max-w-3xl text-balance font-display text-48 font-bold tracking-display text-ink sm:text-64">
            Know what your AI SDR sends. Before your prospects do.
          </h1>
          <p className="max-w-xl text-16 text-muted sm:text-20">
            The trust layer for autonomous outbound. Every claim your agent makes, checked against your research, graded, and traced. Before it sends.
          </p>
        </section>

        <ProblemSection questions={PROBLEMS} />

        <section id="gtm" className="scroll-mt-8 border-t border-line pb-[7.5rem] pt-20 sm:pb-[12.5rem] sm:pt-[7.5rem]">
          <span className="eyebrow">Tailored for GTM</span>
          <div className="mt-12 flex flex-col gap-20 sm:mt-16 sm:gap-32">
            {STANZA.map((line) => (
              <p key={line} className="max-w-3xl text-balance font-display text-32 font-semibold tracking-display text-ink sm:text-48">
                {line}
              </p>
            ))}
          </div>
        </section>

        <section id="why-us" className="scroll-mt-8 border-t border-line pb-[7.5rem] pt-20 sm:pb-40 sm:pt-[7.5rem]">
          <span className="eyebrow">Why Tower</span>
          <ul className="mt-10 flex flex-col sm:mt-12">
            {WHY_US.map((line) => (
              <li key={line} className="max-w-3xl border-t border-line py-6 font-display text-24 font-semibold tracking-display text-ink last:border-b sm:py-8 sm:text-32">
                <span className="text-balance">{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="customers" className="scroll-mt-8 border-t border-line pb-[7.5rem] pt-20 sm:pb-40 sm:pt-[7.5rem]">
          <span className="eyebrow">Who it&apos;s for</span>
          <ul className="mt-10 flex flex-col sm:mt-12">
            {CUSTOMERS.map((line) => (
              <li key={line} className="max-w-3xl border-t border-line py-6 font-display text-24 font-semibold tracking-display text-ink last:border-b sm:py-8 sm:text-32">
                <span className="text-balance">{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="what-it-does" className="scroll-mt-8 border-t border-line pb-[7.5rem] pt-20 sm:pb-40 sm:pt-[7.5rem]">
          <span className="eyebrow">Capabilities</span>
          <ul className="mt-10 flex max-w-2xl list-disc flex-col gap-4 pl-5 text-16 text-ink marker:text-faint sm:text-20">
            {OFFER.map((o) => (
              <li key={o} className="text-pretty">{o}</li>
            ))}
          </ul>
        </section>

        <section id="demo" className="scroll-mt-8 border-t border-line pt-20 sm:pt-[7.5rem]">
          <span className="eyebrow">Proof</span>
          <h2 className="mb-10 mt-6 font-display text-48 font-semibold tracking-display text-ink sm:text-64">Watch it catch one.</h2>
          <SamplePreview report={report} />
          <p className="mt-6 text-14 text-muted">Sample report. The $40M Series C never happened. Tower caught it before it sent.</p>
          <UseTowerButton label="Your turn." className="mt-10" />
        </section>

        <section id="ai-system" className="scroll-mt-8 mt-24 border-t border-line pb-[7.5rem] pt-20 sm:mt-32 sm:pb-40 sm:pt-[7.5rem]">
          <span className="eyebrow">The EVO system</span>
          <p className="mt-12 max-w-3xl text-balance font-display text-32 font-semibold tracking-display text-ink sm:mt-16 sm:text-48">
            Tower is one instrument in EVO.
          </p>
          <p className="mt-8 max-w-3xl text-16 text-muted sm:text-20">
            EVO is the AI system I built for revenue teams. Nine systems, one thesis: every AI touching your pipeline should be cited, measured, and honest about its limits.
          </p>
          <div className="mt-16 flex flex-col gap-4 border-t border-line pt-6 sm:mt-24">
            <p className="text-16 text-ink">Built by Akarsh Sabbavarapu, developer.</p>
            <div className="flex items-center gap-6">
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className={CONTACT_LINK}>
                LinkedIn
              </a>
              <a href={EMAIL_URL} className={CONTACT_LINK}>
                Email
              </a>
            </div>
          </div>
        </section>

        <section id="vision" className="scroll-mt-8 border-t border-line pb-[7.5rem] pt-20 sm:pb-[12.5rem] sm:pt-[7.5rem]">
          <span className="eyebrow">The vision</span>
          <div className="mt-12 flex flex-col gap-20 sm:mt-16 sm:gap-32">
            {VISION.map((line) => (
              <p key={line} className="max-w-3xl text-balance font-display text-32 font-semibold tracking-display text-ink sm:text-48">
                {line}
              </p>
            ))}
          </div>
        </section>

        <section id="writing" className="scroll-mt-8 border-t border-line pt-20 sm:pt-[7.5rem]">
          <span className="eyebrow">Writing</span>
          <a
            href={ARTICLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pressable mt-10 flex flex-col gap-6 rounded-card border border-line bg-surface p-6 hover:border-faint sm:p-10"
          >
            <h2 className="max-w-2xl text-balance font-display text-24 font-semibold tracking-display text-ink sm:text-32">
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
