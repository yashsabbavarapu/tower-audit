# Build: "Tailored for GTM" poetic section on the Tower landing

The landing at `/` is populated per spec. Read `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` first (law; v1 light theme, no new colors or fonts).

## What to build
A new section between "For all of these, Tower is the solution." (+ its Use Tower button) and "WHAT TOWER DOES". Anchor id `gtm`, and add it to the header anchor links ("Tailored for GTM" or "For GTM" — keep it short).

Design: poetic, bold, minimal. Mono eyebrow "TAILORED FOR GTM". Then three short lines, set large in Inter Tight 700, each on its own with generous air between — a stanza, not a paragraph:
1. "It doesn't check writing. It checks revenue."
2. "Every claim traced to your research. Every flag one click from the send button."
3. "Built for the team living between the CRM and the outbox."

No button in this section; the sections around it already carry the CTAs. No extra copy, no embellishment. The section should feel like a breath between the turn and the offer.

## Acceptance
- `npm run build` passes clean, no TS/lint errors.
- Screenshot the section at 390px and 1280px; it should read as three bold quiet lines with space around them.
- Nothing else on the page changes. Report what was built.
