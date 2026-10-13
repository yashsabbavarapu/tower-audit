# Relabel the Tower landing CTAs (copy change only)

Read `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` for context (law). This is a label-only change: no styling, no layout, no behavior changes.

## Changes
The CTA buttons currently read "Use Tower" / "Try it free". Replace with sharper, more surprising labels that keep the courtroom/audit metaphor:
1. `components/Header.tsx` — the far-right ghost button: "Try it free" → "Put it on trial"
2. `components/ProblemSection.tsx` — the button after "For all of these, Tower is the solution.": "Use Tower" → "Cross-examine my agent"
3. The demo section's button (in `components/Landing.tsx`, after "Watch it catch one."): "Use Tower" → "Your turn."
4. Update the default `label` in `components/UseTowerButton.tsx` to "Put it on trial" so any future instance gets a good default.

Keep `whitespace-nowrap` on the header button; verify at 1280px the longer label doesn't crowd the nav.

## Acceptance
- `npm run build` passes clean.
- Screenshot the header at 1280px and the demo section at 390px showing the new labels.
- The morph to `/audit` still works from each button (labels don't affect the mechanism, but confirm one click-through).
- Report the change.
