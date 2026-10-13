# Un-card the Proof section: blend the sample report into the page like an article

Read `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` FIRST (law; v1 light theme). The demo section (`#demo`, eyebrow "PROOF") currently renders the sample report inside a bordered card (`components/SamplePreview.tsx`) with surface fill and rounded corners. It reads as generic AI UI. The user wants it blended into the background like an article.

## Change (landing demo ONLY — the real report on /audit is untouched)
Restyle `components/SamplePreview.tsx`:
- Remove the outer card completely: no border, no surface fill, no rounded corners, no shadow. The content sits directly on the paper background.
- Separation comes from hairlines and whitespace only, like the rest of the landing: the grade dial as the opening figure, the stats as a hairline-ruled row (readout labels over big numerals, no boxes), the top flag as an editorial block (headline + left-hairline quote + plain verdict line).
- Keep all content: the dial, the grade numeral, the stat readouts, the flag headline/quote/verdict, the "Sample report" framing. Nothing gets cut, only the container dies.
- It should read as a printed article that happens to contain a graded report, not a widget embedded in a page.

Keep the demo section around it unchanged: eyebrow "PROOF", headline "Watch it catch one.", the caption, and the "Your turn." button.

## Acceptance
- `npm run build` passes clean, no TS/lint errors.
- Screenshot the demo section at 390px and 1280px; it should feel like editorial content on paper, with no boxed-card residue.
- The /audit report is untouched. Report what was built.
