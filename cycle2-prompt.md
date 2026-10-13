# Tower Audit — Cycle 2 polish (refinement only)

The design spec at `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` is law. Polish only: NO new features, NO new pages. `npm run build` must pass clean when done.

Implement ONLY these refinements:

1. **Unify stat-grid sublabels.** The four stat cells currently mix formats ("3 unverifiable", "4 of 9", "likely invented", relevance has none). Make them instrument-consistent: Claims checked → "3 of 9"; Verified → "4 of 9"; Flags → "2 to fix"; Relevance → no sublabel. Keep the eyebrow labels and the signal-dim tint on the Flags cell exactly as they are.

2. **Tighten the grade formula footer.** "HOW THE GRADE IS COMPUTED" is honest but wordy. Cut it by roughly a third while keeping every fact: verified claims score full marks, unverifiable ones get partial credit scaled by confidence, flagged ones score zero, and the grade is the weighted mean on a 0–100 scale. Plain English, no jargon, no AI tells.

3. **Live regression verification (do this yourself in a headless browser at 390px, then fix anything you find):**
   - Search the rendered DOM for the text "Tap for the source trace" — it must appear zero times anywhere in the app.
   - Confirm each flag card renders the chevron affordance (matching the claim rows) and that tapping a flag card opens the source drawer.
   - Confirm zero console errors and no horizontal overflow at 390px.
   If any of these fail, fix the cause; do not just report it.

Do not touch the grader, the dial, the drawer behavior, the color tokens, or any other copy. Report what changed and confirm the build passes.
