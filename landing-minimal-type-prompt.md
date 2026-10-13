# Typography pass: minimal and futuristic, weight down, air up

Read `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` FIRST — it is law, including the rewritten "Typography (minimal, futuristic)" section. This is a type-and-spacing change only: no copy changes, no layout restructuring, no new sections.

## Change
Across the landing (`/`) and the audit page (`/audit`):
- Display weight 700 is now reserved for the hero H1 on `/` only. Every other display line drops to 600: section headlines, the GTM/Vision stanza lines, the six problem questions, the turn ("Tower is the answer."), the EVO line, the audit page H1 ("Every claim. Checked before it sends."), and the demo headline.
- Big numerals (grade dial numeral on the report, stat numerals) keep their current weight; this pass is about the words, not the numbers.
- Open up the vertical rhythm: increase section padding so the page breathes more (roughly +25% on section top/bottom padding, desktop and mobile). The confidence should come from spacing and precision, not density.
- Keep: Inter Tight with -0.02em tracking, Geist Mono eyebrows/labels, all copy, all colors, the typewriter, the morph, all behavior.

## Acceptance
- `npm run build` passes clean, no TS/lint errors.
- Screenshots: full landing at 390px and 1280px, `/audit` input at 390px. The page should feel quieter and airier: one bold statement (hero), everything else confident but restrained.
- Report what was built.
