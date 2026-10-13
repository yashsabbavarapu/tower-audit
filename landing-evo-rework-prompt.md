# Rework: #ai-system section becomes THE EVO SYSTEM + about/contact

The Tower landing at `/` is complete per the design spec at `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` — read it FIRST, it is law (v1 light theme, section 5.5 was rewritten). The `#ai-system` section currently renders the old "THE ENGINE" concept (split/grade/trace/score rows). Replace it entirely with the new concept. No new colors or fonts. Copy below is final.

## Change
Replace the `#ai-system` section content (keep the section id, placement, and spacing):
- Mono eyebrow: "THE EVO SYSTEM"
- Large line (Inter Tight 700, same scale as the other stanza lines): "Tower is one instrument in EVO."
- Supporting line (body size, muted, max-w-3xl): "EVO is the AI system I built for revenue teams. Nine systems, one thesis: every AI touching your pipeline should be cited, measured, and honest about its limits."
- About + contact block below, separated by a hairline: "Built by Akarsh Sabbavarapu, developer." followed by two links on the same row: "LinkedIn" → https://www.linkedin.com/in/akarsh-sabbavarapu/ and "Email" → mailto:yashwanthakarsh.sabbavarapu@gmail.com. Style the links as quiet mono readout links (amber-ink on hover), external link opens in a new tab, email as mailto. Keep it minimal: no photos, no bio paragraph.

The audit navbar ("AI system" → `/#ai-system`) already points here; no nav changes needed.

## Acceptance
- `npm run build` passes clean, no TS/lint errors.
- Screenshot the section at 390px and 1280px; it should read as one bold line, one quiet supporting line, and a minimal contact row.
- Nothing else on the page changes. Report what was built.
