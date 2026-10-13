# Build: Tower Audit v0 (the tease)

You are building the first product of a portfolio called "the trust layer for revenue." This build is **Tower Audit v0**: a single-page web app where a user pastes their GTM AI agent's output (emails, messages) and gets a beautiful graded report card — claim-level traceability, hallucination flags, a 0–100 grade.

## First: read the design spec. It is law.
Read `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` before writing any code. Every color, font, radius, motion rule, and anti-slop law in it is non-negotiable. If the spec and your instincts disagree, the spec wins.

## Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS.
- Fonts via `next/font`: Inter Tight (display), Inter (body), IBM Plex Mono (data).
- Lucide icons, 1.5px stroke, functional use only.
- Verify node >= 20 yourself; install dependencies yourself. Do not ask questions — decide and build.

## Scope — v0 is deliberately small. One page (`/`), three states.
1. **Input**: textarea for pasting agent output, a "load sample" link that fills realistic AI-SDR output (write a convincing sample: 3 short prospecting emails with some verifiable claims and 2 hallucinated specifics), and the amber "Run audit" button.
2. **Grading** (the system beneath): `lib/grader/` with a `Grader` interface. Ship `AnthropicGrader` that calls the Anthropic API (model: claude-sonnet-4-5 or newer available) using the `ANTHROPIC_API_KEY` env var. Pipeline: split pasted output into individual checkable claims → for each claim, determine verdict (verified / unverifiable / flagged-hallucination) with a confidence score and a plain-English explanation → compute overall grade 0–100, verified %, flag count, relevance score. If no API key is set, fall back to a clearly-labeled "demo mode" heuristic grader (keyword/source-citation checks) so the page still works end to end. Never fake certainty: confidences must be honest.
3. **Report card** (the feel): grade dial with needle-sweep animation, one-line verdict, stat row (claims checked, verified %, flags, relevance), claim list where each row shows the claim text + verdict chip (tap opens the bottom source drawer with excerpt), and flag cards explaining hallucinations in plain English. Loading state uses pulsing opacity, not gradient shimmer.

## Design tokens
All colors/spacing/radii live in one tokens file (CSS variables or Tailwind theme extension). Zero magic values in components. Zero gradients, zero purple, zero blue-primary anywhere.

## Acceptance criteria
- `npm run build` passes clean. No TypeScript errors.
- The page works end to end with the sample input (in demo mode if no key).
- Every interactive element has rest/hover/pressed/disabled/focus-visible states.
- Mobile-tactile: test the layout at 390px wide; cards press, drawers slide, dial sweeps.
- When done, report: what was built, how to run it (`npm run dev`), and what env var the real grader needs.

Keep the code clean and typed. This is the foundation of a business, not a demo.
