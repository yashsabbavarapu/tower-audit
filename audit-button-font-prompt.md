# Two fixes: ghost the audit button, swap display font to Space Grotesk

Read `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` FIRST — it is law (Typography and Audit page sections were just updated). No copy changes, no layout restructuring.

## Changes
1. **"Run the audit" button** (`/audit`): it is currently a solid pale-amber slab and looks out of place next to the minimal ghost CTAs. Restyle it to the same ghost treatment as the landing's outline buttons: transparent fill, 1px hairline border, ink text, amber border + amber-ink text on hover. Disabled state (empty textarea): transparent with faint border and faint text. Full width on mobile as now. No solid amber fill remains on the page.
2. **Display font swap**: replace Inter Tight with **Space Grotesk** (via `next/font/google`, weights 500/600/700 — load the real cuts, never browser-faked) everywhere the display font is used: hero H1, section headlines, stanza lines, problem questions, the turn, EVO line, demo headline, audit H1, wordmark, big numerals (grade dial, stat numerals), buttons. Keep the weight rule: 700 for the hero H1 only, 600 everywhere else display. Body stays Inter, microcopy stays Geist Mono.

## Acceptance
- `npm run build` passes clean, no TS/lint errors.
- Screenshots: `/audit` input at 390px (ghost button in rest and disabled states), landing hero at 390px and 1280px in the new font. The font should read futuristic-minimal, and the button should feel like it belongs with the landing CTAs.
- The morph, typewriter, and all behavior unchanged. Report what was built.
