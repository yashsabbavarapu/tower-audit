# Build: add a free Gemini grader option to Tower Audit v0

Tower Audit v0 already exists in this directory and `npm run build` passes. The design spec at `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` is still law — this task adds backend capability only; do not restyle anything except the one chip noted below.

## What to add
A second real grader alongside the existing `AnthropicGrader`, using Google's Gemini API free tier (Google AI Studio).

1. **`lib/grader/gemini.ts`** — `GeminiGrader` implementing the existing `Grader` interface, mirroring `AnthropicGrader`'s structure:
   - Same two-call pipeline: (1) split pasted output into checkable claims, (2) verdict + confidence + plain-English explanation per claim.
   - Same honesty rules already in the codebase: quotes checked in code against the sources (a "verified" verdict with a fabricated quote drops to unverifiable), verdicts resting only on the model's own knowledge capped at 70% confidence.
   - Auth via `GEMINI_API_KEY` env var. Model via `TOWER_GEMINI_MODEL`, default `gemini-2.5-flash` (free-tier). If that model id 404s, surface the API's error plainly rather than guessing another.
   - Call the REST endpoint directly (`https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`) with fetch — no SDK needed. Keep the JSON parsing defensive.

2. **Grader selection** in the audit route: `TOWER_GRADER` env (`anthropic` | `gemini` | `demo`). Default behavior when unset: use Anthropic if `ANTHROPIC_API_KEY` is set, else Gemini if `GEMINI_API_KEY` is set, else the labeled heuristic demo grader. An explicit `TOWER_GRADER` always wins; if it names a grader whose key is missing, fall back to demo mode and say so honestly in the UI.

3. **UI chip**: extend the existing engine chip logic. Demo mode keeps its "DEMO MODE" chip. Gemini shows a small mono chip "GEMINI · FREE TIER". Anthropic keeps whatever it does today (no new chip needed).

4. **Docs**: update `README.md` and `.env.example` — the three env vars, how to get a free key (Google AI Studio: https://aistudio.google.com → "Get API key"), and the selection order.

## Acceptance
- `npm run build` passes clean, no TypeScript/lint errors.
- Extend the grader check script (or add one) so `npm run check:grader` covers the Gemini grader with a mocked fetch, same as the Anthropic one.
- No visual changes except the chip. Run the existing Playwright e2e if quick; at minimum verify the page still renders and the chip logic paths don't break the build.
- Report: what was added, env vars, and how to choose the grader.
