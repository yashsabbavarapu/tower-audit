# Build: "Writing" card section at the end of the Tower landing

The landing at `/` is complete per spec (header, hero, problem, GTM stanza, offer, demo). Read `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` first (law; v1 light theme, no new colors or fonts).

## What to build
A final section after the demo, before the footer. Amplemarket-style resource card. Mono eyebrow "WRITING". One card, hairline-bordered, quiet surface:
- Title (Inter Tight 700): "Your AI SDR is inventing facts. I built the audit layer that catches them."
- One-line description (plain): "The story behind Tower: why agents invent claims, and the trust layer I am building for revenue teams."
- Link: "Read on Hashnode" with an arrow, pointing to https://akarshsabbavarapu09.hashnode.dev/your-ai-sdr-is-inventing-facts-i-built-the-audit-layer-that-catches-them (external link, opens in a new tab).
The whole card is tappable to the article. Keep it minimal: one card, generous padding, no thumbnail image.

Also add "Writing" to the header anchor links if there is room without crowding (if it crowds, skip it; the section is reachable by scroll).

## Acceptance
- `npm run build` passes clean, no TS/lint errors.
- Screenshot the section at 390px and 1280px; it should read as one quiet card closing the page.
- Nothing else on the page changes. Report what was built.
