# Refinement: declutter the Tower Audit header (minimal, Linear-grade)

The design spec at `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` is still law. This task is a header simplification only.

## The problem
The header is cluttered: wordmark + "audit v0" suffix + engine/mode chip ("DEMO MODE" / "GEMINI · FREE TIER"). Study the minimal-header pattern of the most stylish simple sites (Linear, Vercel, Arc): one wordmark, generous air, no badges in the chrome. Status lives in context, not in the header.

## Changes
1. **Header**: the single word "Tower" (Inter Tight 600), left-aligned, and nothing else. Remove the "audit v0" suffix text. Remove the engine/mode chip from the header entirely.
2. **Engine attribution moves to the report card**: add a quiet footnote at the bottom of the report card, 12px IBM Plex Mono, `--faint` color:
   - Gemini: "graded by gemini-2.5-flash · free tier"
   - Anthropic: "graded by claude"
   - Demo mode: keep the existing honest demo disclaimer exactly where it already is on the report — it must remain visible on the results, just not in the header.
3. **Page `<title>`**: "Tower Audit" (drop any v0/chip wording there too). Nothing else changes.

## Acceptance
- `npm run build` passes clean.
- Screenshot the header at 390px and confirm: one word, air, no badges.
- No other visual or behavioral changes. Report what changed.
