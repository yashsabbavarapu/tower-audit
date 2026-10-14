# Finish the polish: interaction QA and visual nits

Context: Tower (`/`, `/audit`, `/control`) per `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` (law). The control-plane landing section, Vision line, "Send to queue" bridge, and amber ghost-button hover are already in, uncommitted. `npm run build` and `lint` pass; no overflow or console errors at 390/1280. What remains is the interaction QA and any visual nits. Same stack, no new colors or fonts.

## Do, with Playwright against `next start`
1. **Interactive states** — click/hover/keyboard through: every ghost button (hover must go amber per spec, pressed and focus-visible must be visible and quiet), the queue tabs (Pending/Approved/Rejected switch the list), the sample-data notice dismiss (stays dismissed), the queue drawer (open, close via X/backdrop/Escape, Approve/Reject/Replay inside at 390px), "Approve all pending" confirm step, "Send to queue" on a report, anchor nav on `/control`. Fix anything dead, invisible, or janky.
2. **Visual nits at 390 and 1280** — section padding rhythm consistent across all three pages; headline orphans fixed with text-balance/pretty; drawer title, claim rows, and safer lines clean at 390; drift chart axis labels not clipped (the stat numerals render in the display cut, no faux bold); audit-log mono rows aligned; tabs' active underline aligned. Fix what is off.
3. **Reduced motion** — the typewriter and any transitions must respect `prefers-reduced-motion` (show final state).

## Acceptance
- `npm run build` passes clean, no TS/lint errors.
- Commit the result with a clear message (do NOT push).
- Screenshots proving each fixed item (before/after where a visual changed) in `shots/polish2/`.
- Report what was tested, what was fixed, and anything you checked that was already fine.
