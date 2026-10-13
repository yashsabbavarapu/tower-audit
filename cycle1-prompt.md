# Tower Audit — Cycle 1 polish (refinement only)

The design spec at `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` is law. This is polish only: NO new features, NO new pages, NO scope changes. `npm run build` must pass clean when done.

Implement ONLY these refinements:

1. **Collapse "What the verdicts mean."** On the input page it is currently a text wall of three chip + paragraph blocks. Convert it into a collapsed-by-default disclosure (native-feeling, tappable row with chevron, 160ms ease-out expand). Keep the exact same copy, but tighten each definition to one line: VERIFIED — "A source you provided says this." UNVERIFIABLE — "Nothing confirms or contradicts it." FLAGGED — "Contradicts your sources, or names something they never mention." When collapsed it should occupy one quiet row.

2. **Stat grid: more air and hierarchy.** On the report card the 2x2 stat grid (Claims checked / Verified / Flags / Relevance) is cramped. Increase cell padding (at least 20px), enlarge the numerals one step on the type scale, and sharpen sublabel hierarchy (sublabel in `--faint`, smaller). When flags > 0, give the Flags cell a `--signal-dim` tint background so it reads as the warning. Fix the Relevance cell: "100" with sublabel "of 100" is redundant — drop the sublabel, keep just the numeral and the eyebrow label.

3. **Report card header timestamp.** Currently reads "07:43 PM · <0.1s". Drop the "<0.1s" fragment; keep the time only, in `--faint`.

4. **Flag card affordance.** Each flag card currently repeats the hint text "Tap for the source trace". Remove that repeated hint from every flag card and instead add the same chevron affordance the claim rows already have (right-aligned, `--faint`, 1.5px Lucide chevron), so tappability is consistent across the report.

5. **Baseline alignment.** Make sure each claim row's verdict chip and "NN% conf" text sit on a consistent baseline across all rows (they drift slightly now).

Do not touch the grader, the dial, the drawer, the color tokens, or any copy not named above. Report what changed and confirm the build passes.
