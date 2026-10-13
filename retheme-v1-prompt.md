# Retheme: Tower Audit v0 → v1 light, futuristic yet minimal

The app exists and builds clean. This task rethemes it from dark to light per the new design spec. Read `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` FIRST — it is law and supersedes the old dark theme. Also skim `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/design-references.md` for the Heron/Amplemarket direction (light editorial minimalism, grotesque display vs precise mono microcopy).

## What to do
1. **Tokens**: rewrite `styles/tokens.css` to the v1 palette (paper #F4F1E8 bg, ink #191B1D text, amber accent kept, deepened sage/signal for light backgrounds, hairline #E3DFD2). The Tailwind theme maps 1:1 — update it too. Scan the whole codebase afterward for any remaining dark-theme values (old ink backgrounds, light-text colors) and eliminate them.
2. **Fonts**: install the `geist` npm package and wire Geist Mono for all eyebrow/label/microcopy/data-label text (uppercase, tracking .08em). Display stays Inter Tight but move to 700 with -0.02em tracking. Body stays Inter.
3. **Components**: retheme every surface — input panel, report card, dial (light track, amber arc), stat grid, claim rows, verdict chips, flag cards, source drawer, scrim, skeleton loader, demo disclaimer, footer footnote. Keep all behavior identical: graders, honesty rules, drawer physics, dial sweep, count-ups.
4. **Futuristic-minimal details**: where labels already exist, give them the coordinate-readout flavor the spec describes (e.g. counts as "09 CLAIMS · 03 MESSAGES" style microcopy). Do not invent new UI or move things around — this is a retheme, not a redesign.
5. **Anti-slop check**: no gradients, no shadows (hairlines only), no purple/blue. Light theme must not become "gray boxes on white" — surfaces stay quiet, data is the decoration.

## Acceptance
- `npm run build` passes clean, no TS/lint errors.
- Screenshot at 390px and 1280px (input state + report card). Review them yourself against the v1 spec before finishing: light warm paper, one amber accent, grotesque-vs-mono contrast, airy but dense where it counts.
- Report: what changed, and attach/point to the screenshots.
