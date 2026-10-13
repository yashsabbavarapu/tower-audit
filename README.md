# Tower Audit v0

Paste a GTM AI agent's output (emails, messages) and get a graded report card: claim-level traceability, hallucination flags, and a 0–100 grade.

Design authority: `../files/tower-design-spec.md`. All tokens live in `styles/tokens.css`. The Tailwind theme is *replaced* by those tokens, so off-spec colors, shadows and radii don't exist as classes.

## Run

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
npm run check:grader   # demo grader on the sample + Anthropic grader post-processing against a mocked client
```

Requires Node ≥ 20.

## Environment

| Var | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Enables the real grader (`AnthropicGrader`). Without it, the app runs the labeled **demo mode** heuristic grader. |
| `TOWER_MODEL` | Optional model override. Default `claude-sonnet-5-5`. |

## How grading works (`lib/grader/`)

1. `messages.ts` splits the pasted output into messages (`---` separators or `Subject:` lines).
2. A `Grader` (`types.ts`) extracts checkable claims and gives each a verdict (verified / unverifiable / flagged), a confidence, a plain-English explanation and, where one exists, a verbatim source excerpt.
   - `AnthropicGrader` makes two forced tool-use calls (extract, then verify) and validates the output with zod. Traceability is enforced in code: an excerpt the model quotes must actually appear in the sources, or a "verified" verdict is downgraded. Verdicts that rest on the model's own knowledge are capped at 70% confidence.
   - `HeuristicGrader` (demo mode) uses number matching, keyword overlap and unsupported name-drop checks. Confidence is capped at 75%, and every report it produces is labeled as demo mode.
3. `score.ts` computes the stats, the grade and the verdict line the same way for every grader. The rubric is printed at the bottom of each report.

Source context is optional, but it's what makes verification real. Without it, most claims come back unverifiable, by design.
