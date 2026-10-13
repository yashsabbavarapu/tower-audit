# Build: Vision + AI system sections, populated audit navbar

The Tower landing at `/` and the `/audit` page are complete per spec (the audit page just got its minimal header: wordmark + "← Overview"). Read `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` FIRST — it is law, including the new sections 5.5/6 and the updated "Header (route-aware)". No new colors or fonts. Copy below is final; do not embellish.

## Changes
1. **New section `#ai-system`** after the demo section, before vision: mono eyebrow "THE ENGINE". Four tight stacked rows with hairline separators:
   - "Split. Every message becomes atomic, checkable claims."
   - "Grade. A frontier model checks each claim against your sources."
   - "Trace. Every verdict links to the source that decided it."
   - "Score. The batch gets a grade, and the formula is printed on the report."
2. **New section `#vision`** after `#ai-system`, before the writing section: mono eyebrow "THE VISION". A stanza like the Tailored-for-GTM one: three lines set large in Inter Tight 700 with generous air between:
   - "The trust layer for revenue."
   - "Every AI system touching your pipeline: cited, measured, honest about its limits."
   - "Audit is the wedge. Approvals, replay, and drift monitoring are next."
   No button, no extra copy.
3. **Audit navbar** (`/audit` header variant): add center anchor links "Why us?", "Vision", "AI system" pointing to `/#why-us`, `/#vision`, `/#ai-system`. Keep the wordmark left (links to `/`) and the quiet "← Overview" link right. Same hairline border, height, and type. Hide the anchor links below 1024px (matching the landing header's rule); the wordmark and Overview link stay at all widths. Never let anything wrap.

## Acceptance
- `npm run build` passes clean, no TS/lint errors.
- Screenshots: both new sections at 390px and 1280px; the `/audit` header at 390/768/1280px (links visible at 1280, hidden below 1024, nothing wraps).
- Click each audit-navbar link: lands on `/` at the right section. Click "← Overview" returns to `/` top.
- Nothing else changes. Report what was built.
