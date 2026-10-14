# Polish pass: control plane on the landing, audit→queue bridge, front-end QA

Tower (`/`, `/audit`, `/control`) is live and complete per spec. Read `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` FIRST — it is law; the Landing gained section 5.6 (control plane), Vision line 3 changed, and the Audit page gained the queue bridge. No new colors or fonts. Copy in the spec is final.

## 1. Landing reflects mission control
- New section `#control-plane` after the Proof/demo section, before Vision: mono eyebrow "THE CONTROL PLANE", three tight hairline rows —
  "The queue. Every agent output waits for clearance."
  "Drift. Know the week accuracy slides, not the quarter."
  "The audit log. Everything it did, in order."
  Then a ghost button "Enter mission control" → `/control`. Same row style as the Why Tower section.
- Vision stanza line 3 becomes: "Audit was the wedge. The control plane is live."
- Do NOT add "Control" to the landing header (5 links already); the section CTA is enough.

## 2. Audit → Control bridge (feature)
On the `/audit` graded report, add a quiet ghost action "Send to queue" (near the report actions, same ghost style). Clicking POSTs the graded batch to `/api/queue` with `agent_name: "Manual audit"`, the messages, and sources; sends the `x-tower-secret` header from `NEXT_PUBLIC_TOWER_API_SECRET` when set (same pattern as ControlApp). On success, confirm inline: "In the queue." with a link to `/control`. On failure, show the error quietly and keep the report intact. Do not resubmit if already sent (disable after success).

## 3. Front-end polish QA (all three pages, 390px and 1280px)
Walk every page and fix what is off, staying inside the spec:
- Spacing rhythm: section padding consistent, no cramped or gaping sections.
- Type: no orphans on headlines, `text-balance`/`text-pretty` where needed; check the typewriter questions, stanza lines, and drawer titles.
- Interactive states: every button/link has hover, pressed, focus-visible; the ghost buttons' amber hover; drawer open/close; tabs on the queue; the sample-data notice dismiss.
- The queue drawer: claim rows, safer lines, replay result layout at 390px.
- Drift chart: legible at 390px, axis labels not clipped.
- Audit log: mono rows aligned, timestamps consistent.
- No console errors, no horizontal overflow at 390px.

## Acceptance
- `npm run build` passes clean, no TS/lint errors.
- Screenshots: the new control-plane section (390/1280), the Vision update, the "Send to queue" action on a report (before + after), plus full-page passes of `/`, `/audit`, `/control` at 390 and 1280.
- Exercise: run an audit → Send to queue → item appears in `/control` pending → approve it → audit log records it.
- Report what changed, fixed, and added.
