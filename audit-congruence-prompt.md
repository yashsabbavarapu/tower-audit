# Make the /audit page congruent with the landing

The landing at `/` is finished per spec. The audit tool at `/audit` predates it and feels like a different product. Read `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` FIRST — it is law, including the new "Audit page" and "Header (route-aware)" sections. No new colors or fonts. Copy below is final; do not embellish.

## Changes
1. **Route-aware header**: make the header render per route (use `usePathname` or equivalent).
   - On `/`: unchanged (wordmark, five anchor links, ghost "Put it on trial" morphing to `/audit`).
   - On `/audit`: classy minimal variant. "Tower" wordmark left, linking to `/`. Right side: a quiet "← Overview" link back to `/`. No CTA button, no anchor links. Same hairline bottom border, same height, same type scale as the landing header. Determine where the header currently renders (layout vs page) and adapt accordingly.
2. **Audit input page copy** (confident, bold voice):
   - Eyebrow: "TOWER.AUDIT" (mono, uppercase, matching the landing)
   - H1 (Inter Tight 700, tight): "Every claim. Checked before it sends."
   - Sub: "Paste what your agent wrote. Tower breaks it into claims, traces each one to your research, and flags anything invented."
   - Primary button label: "Run audit" → "Run the audit" (keep the amber fill; this is the one place the solid amber CTA lives)
   - Keep: "AGENT OUTPUT" label, "LOAD SAMPLE", "SOURCE CONTEXT · OPTIONAL", character count, "WHAT THE VERDICTS MEAN", and the entire report experience (graders, dial, drawers, honesty rules, demo disclaimer) exactly as they are.
3. **Typography congruence**: the audit page headlines use Inter Tight 700 at the same tight tracking as the landing; microcopy/labels use the same Geist Mono uppercase readout style. If the audit page has any leftover v0-era type treatments (IBM Plex, semibold), eliminate them.

## Acceptance
- `npm run build` passes clean, no TS/lint errors.
- Screenshots: `/audit` input state at 390px and 1280px showing the new header variant and the confident hero copy; confirm the report view header also uses the minimal variant.
- Click "← Overview" returns to `/`; the landing header is unchanged.
- Nothing about grading or the report changes. Report what was built.
