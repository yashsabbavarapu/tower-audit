# Tower Audit — Cycle 3 polish, final (refinement only)

The design spec at `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` is law. Polish only: NO new features, NO new pages. `npm run build` must pass clean when done.

Implement ONLY these refinements:

1. **Fix the Claims-checked sublabel.** The stat cell "CLAIMS CHECKED" shows numeral 9 with sublabel "3 of 9", but the 3 counts unverifiable claims — it misreads next to Verified's "4 of 9". Remove the sublabel from the Claims checked cell entirely: the numeral 9 is self-explanatory, and Verified's "4 of 9" already gives the fraction context. Keep the "no claims" zero-state fallback working. Do not change the other three cells.

2. **Final regression sweep (do this yourself in a headless browser at 390px and 1280px, then fix anything you find):**
   - Zero console errors on input screen, during audit, and on the report.
   - No horizontal overflow at 390px on any screen, including with the source drawer open.
   - The grade dial sweeps and settles; claim rows press to 0.98 scale; the drawer opens from a claim row and a flag card and closes on Esc and on scrim tap.
   - The collapsed "What the verdicts mean" row expands/collapses over 160ms ease-out.
   If anything fails, fix the cause; do not just report it.

Do not touch the grader, the scoring formula, the color tokens, or any other copy. Report what changed and confirm the build passes.
