# Build: header rework, Why us? + Customers sections, typewriter problems

The Tower landing at `/` is complete per the existing spec. Read `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` FIRST — it is law (v1 light theme; the Landing section was just updated with the new header, sections 3.6/3.7, and the typewriter behavior). No new colors or fonts. Copy below is final; do not embellish.

## Changes
1. **Header** (`components/Header.tsx`): remove the "Use Tower" button. Anchor links become: The problem · Why us? · Customers · Demo · Writing. Far right: a ghost button reading "Try it free" (same ghost style as the existing outline buttons: transparent fill, 1px hairline border, ink text, amber on hover). It morphs to `/audit` via the existing `UseTowerButton` mechanism. Keep the header uncrowded: if links crowd at any width, hide the anchor links below 1024px as before, never let the button wrap.
2. **New section `#why-us`** after the Tailored-for-GTM stanza, before `#what-it-does`: mono eyebrow "WHY TOWER". Three tight stacked rows with hairline separators:
   - "Every grade prints its formula. No black box."
   - "It admits what it can't check. Unverifiable is a verdict, not a shrug."
   - "Every flag comes with a safer line. A flag without a fix is just anxiety."
3. **New section `#customers`** after `#why-us`: mono eyebrow "WHO IT'S FOR". Three quiet rows (no logos, no testimonials, nothing fabricated):
   - "GTM engineers. You ship the agents. Tower is the pre-send check."
   - "RevOps leaders. You own the number. Tower shows what the machines said to get it."
   - "Founders. Your first SDR is software. Tower is its editor."
4. **Typewriter problems**: the six "?" questions in `#problem` type out sequentially when the section scrolls into view. IntersectionObserver trigger; ~28ms per character; a mono block cursor (amber-ink) at the typing point; ~400ms pause between questions; the turn ("For all of these, Tower is the solution.") and its button appear after the last question finishes. `prefers-reduced-motion`: show all text immediately, no animation. Keep the full question text in the DOM for screen readers (visually-hidden full text or aria-labels). Typing runs once; scrolling away and back does not restart it.

## Acceptance
- `npm run build` passes clean, no TS/lint errors.
- Screenshots: header at 390/768/1280px (button never wraps, links never crowd), the two new sections at 390/1280px, and a mid-typing frame of the problems section.
- Verify in headless Chromium: the typewriter completes and the turn appears; "Try it free" morphs to `/audit` with focus in the textarea.
- Nothing else on the page changes. Report what was built.
