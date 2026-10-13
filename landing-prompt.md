# Build: Tower landing view + "Use Tower" morph transition

The app is freshly rethemed to the v1 light spec. Read `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` FIRST — it is law, including the new "Landing" section. This task adds the landing view; the retheme work is done, do not restyle what exists.

## What to build
1. **Landing view at `/`**: the tease before the tool, in the editorial style of the spec (Heron/Amplemarket direction):
   - Mono eyebrow ("TOWER AUDIT" or similar readout-style label)
   - Display headline, Inter Tight 700, tight, poster-like. The product promise in one line — direction: "Know what your AI SDR sends before your prospects do." Keep it plain-English, confident, no jargon.
   - One line of subcopy explaining the audit in plain words.
   - Amber "Use Tower" CTA button.
   - Product visual below: a static render of a sample report card (reuse the report components with the existing sample data), hairline-framed. It should read as "this is what you get."
   - Generous whitespace, hairline rules, quiet surfaces. No new colors, no new fonts.
2. **Move the audit tool to `/audit`**: the existing input → report experience, unchanged.
3. **The morph**: clicking "Use Tower" expands the button into the audit textarea on the tool view. Implement with the View Transitions API using a shared `view-transition-name` on the button and the textarea, ~400–500ms ease-out; graceful fade fallback where unsupported. The button should feel like it grows into the tool, not like a page change. After the transition, focus lands in the textarea.

## Acceptance
- `npm run build` passes clean, no TS/lint errors.
- Screenshot the landing at 390px and 1280px; review against the v1 spec yourself (light paper, grotesque-vs-mono contrast, restraint).
- Verify the transition in Chromium via Playwright: click "Use Tower", confirm arrival at `/audit` with the textarea focused; screenshot mid-transition if capturable.
- No behavior changes to grading, honesty rules, or the report. Report what was built.
