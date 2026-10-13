# Tower Audit v0

Paste a GTM AI agent's output (emails, messages) and get a graded report card: claim-level traceability, hallucination flags, and a 0–100 grade.

Design authority: `../files/tower-design-spec.md`. All tokens live in `styles/tokens.css`. The Tailwind theme is *replaced* by those tokens, so off-spec colors, shadows and radii don't exist as classes.

## Run

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
npm run check:grader   # demo grader on the sample + Anthropic and Gemini graders against mocked APIs + grader selection
```

Requires Node ≥ 20.

## Environment

| Var | Purpose |
| --- | --- |
| `TOWER_GRADER` | `anthropic`, `gemini` or `demo`. Optional, see selection order below. |
| `ANTHROPIC_API_KEY` | Enables `AnthropicGrader`. |
| `TOWER_MODEL` | Anthropic model override. Default `claude-sonnet-5-5`. |
| `GEMINI_API_KEY` | Enables `GeminiGrader` (Google AI Studio free tier). |
| `TOWER_GEMINI_MODEL` | Gemini model override. Default `gemini-2.5-flash`. |

**Selection order.** An explicit `TOWER_GRADER` always wins. If it's unset, Tower uses Anthropic when `ANTHROPIC_API_KEY` is set, then Gemini when `GEMINI_API_KEY` is set, then the labeled **demo mode** heuristic grader. If `TOWER_GRADER` names a grader whose key is missing (or isn't a known value), Tower runs demo mode and says why in the header chip tooltip and on the report.

**Free Gemini key.** Go to [Google AI Studio](https://aistudio.google.com), sign in, click **Get API key**, create a key, and set `GEMINI_API_KEY=...` (plus `TOWER_GRADER=gemini` if you also have an Anthropic key). The header shows a `GEMINI · FREE TIER` chip while it's grading. Free-tier rate limits are low; a 429 is reported as a rate limit. If the model id doesn't exist, Tower shows Google's 404 message as-is rather than trying another model.

## How grading works (`lib/grader/`)

1. `messages.ts` splits the pasted output into messages (`---` separators or `Subject:` lines).
2. A `Grader` (`types.ts`) extracts checkable claims and gives each a verdict (verified / unverifiable / flagged), a confidence, a plain-English explanation and, where one exists, a verbatim source excerpt.
   - `AnthropicGrader` makes two forced tool-use calls (extract, then verify) and validates the output with zod. Traceability is enforced in code: an excerpt the model quotes must actually appear in the sources, or a "verified" verdict is downgraded. Verdicts that rest on the model's own knowledge are capped at 70% confidence.
   - `GeminiGrader` runs the same two calls against the Gemini REST API (`generateContent` with a JSON response schema, plain `fetch`, no SDK) and parses the output defensively. Both model graders share the prompts, schemas and honesty rules in `pipeline.ts`, so the quote check and the 70% cap apply identically.
   - `HeuristicGrader` (demo mode) uses number matching, keyword overlap and unsupported name-drop checks. Confidence is capped at 75%, and every report it produces is labeled as demo mode.
3. `score.ts` computes the stats, the grade and the verdict line the same way for every grader. The rubric is printed at the bottom of each report.

Source context is optional, but it's what makes verification real. Without it, most claims come back unverifiable, by design.
