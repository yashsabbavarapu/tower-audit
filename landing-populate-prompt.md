# Build: populate the Tower landing like an advertisement

The landing skeleton exists at `/` (components/Landing.tsx etc.) with the v1 light theme. Read `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` FIRST — it is law, including the rewritten "Landing" section with the full page structure and copy direction. Build exactly that structure. Do not restyle the theme; no new colors, no new fonts.

## Page structure (top to bottom)
1. **Header** (Amplemarket-style): "Tower" wordmark left; center anchor links "The problem", "What it does", "Demo" (scroll to sections); right side a transparent ghost "Use Tower" button — transparent fill, 1px hairline border, ink text, amber on hover. Hairline bottom border. The header button triggers the same morph transition to `/audit` as the main CTA.
2. **Hero** (keep what exists): mono eyebrow "TOWER AUDIT", H1 "Know what your AI SDR sends before your prospects do.", subcopy "Tower is the trust layer for your outbound. It reads what your agent wrote and checks every claim against your research."
3. **The problem** (new section, id="problem"): mono eyebrow "THE PROBLEM". Then these six questions, each its own line/block, generous space between, each ending with "?":
   - "Your agent sent 500 emails last night. Can you name a single claim it made?"
   - "What happens when it invents a funding round that never happened?"
   - "Your research lives in six tools. Which one did the email actually cite?"
   - "The stat it quoted was true in March. Is it still true?"
   - "Your dashboard says the campaign worked. Did anyone read the words?"
   - "How many hours a week does your team spend re-reading AI output by hand?"
   Then space, then the turn set large in Inter Tight 700: "For all of these, Tower is the solution." Then the transparent "Use Tower" button (same ghost style, morphs to /audit).
4. **The offer** (new section, id="what-it-does"): mono eyebrow "WHAT TOWER DOES". Plain bullet list, one line each:
   - Splits agent output into checkable claims
   - Traces each claim to your research
   - Flags anything invented, with a confidence score
   - Scores relevance: did it use the prospect's real details
   - Suggests a safer line wherever it flags one
   - Prints the math: the full grade formula on every report
5. **Demo** (section, id="demo"): mono eyebrow "SEE IT WORK". Headline "Watch it catch one." Reuse the existing SamplePreview (hairline-framed sample report). Caption under it, plain: "Sample report. The $40M Series C never happened. Tower caught it before it sent." Then a final transparent "Use Tower" button.
6. **Footer**: keep the existing quiet footnote.

## Notes
- Copy is final as written above. Do not embellish, do not add adjectives, do not write additional marketing lines.
- Editorial rhythm matters: the problems section should breathe (space between questions, space before the turn). This is an ad, not a doc.
- All "Use Tower" buttons share the morph: View Transitions API with the shared view-transition-name, growing into the audit textarea at `/audit`, focus landing in the textarea. Keep the existing lib/morph.ts mechanism; extend it to the new buttons.
- Anchor links smooth-scroll to sections.

## Acceptance
- `npm run build` passes clean, no TS/lint errors.
- Screenshot the full landing at 390px and 1280px; review yourself against the spec (light paper, grotesque-vs-mono contrast, the problems section breathing, ghost buttons transparent).
- Verify every "Use Tower" button morphs to /audit with focus in the textarea.
- Report what was built.
