# Build: Tower Mission Control (`/control`)

Tower Audit (`/audit`) is live and complete. This task builds the control plane inside the same app. Read `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` FIRST — it is law, including the new "Mission Control" section. Same stack (Next.js 14 App Router, TypeScript, Tailwind, existing tokens). No new colors or fonts. Copy in the spec is final; do not embellish.

## Data model
```ts
QueueItem { id: string; agent_name: string; submitted_at: string; messages: string[]; sources?: string; grade: number; counts: { claims: number; verified: number; unverifiable: number; flagged: number }; status: "pending" | "approved" | "rejected"; claims: GradedClaim[]; decided_at?: string; sample?: boolean }
AuditEntry { id: string; at: string; actor: string; action: "graded" | "approved" | "rejected" | "replayed"; item_id: string; detail: string }
```
Reuse the existing grader pipeline and GradedClaim types. Server-side grading uses the same `TOWER_GRADER` env behavior (gemini/anthropic/demo) with the same honesty rules: demo mode discloses itself and caps confidence at 75%.

## Storage
`lib/store.ts`: a small adapter. Backed by `@vercel/kv` when `KV_REST_API_URL` / `KV_REST_API_TOKEN` are set; otherwise an in-memory Map (dev/preview). The UI shows a quiet dismissible "SAMPLE DATA" note whenever the fallback or seed data is in play. `lib/seed.ts`: 3 pending queue items built from the existing sample outputs, ~10 graded batches spread over the last 14 days for drift, and matching audit entries; every seed row tagged `sample: true`.

## API routes
- `GET /api/queue?status=pending|approved|rejected|all` → items, newest first.
- `POST /api/queue` body `{agent_name, messages, sources?}` → grade via pipeline → store as pending → return the item. Validate: non-empty messages array, agent_name string; 400 otherwise.
- `POST /api/queue/[id]/decision` body `{decision: "approved"|"rejected", note?}` → update status, stamp decided_at, append audit entry.
- `POST /api/replay/[id]` body `{sources?}` → re-grade the item's messages against the given (or stored) sources → return `{old_grade, new_grade, rotted_claims: GradedClaim[]}` (claims whose verdict worsened), and append a "replayed" audit entry.
- `GET /api/drift` → `{points: [{date, avg_grade, batches}]}` aggregated from stored graded items.
- `GET /api/audit-log` → entries, newest first.

## Page: `/control`
Stacked sections with anchor nav, congruent with the landing:
1. Hero: eyebrow "TOWER CONTROL", H1 "Nothing sends without clearance.", sub per spec.
2. **Queue** (`#queue`): pending items as tappable rows — agent name, relative time, small grade numeral, "NN CLAIMS · NN FLAGS" readout. Tapping opens the existing bottom-drawer pattern showing the full graded claims; drawer carries Approve (sage-tinted ghost) and Reject (signal-tinted ghost) buttons. Rows also have inline quick approve/reject. "Approve all pending" bulk action with a confirm step. Empty state: "The queue is clear." + a "Connect your agent" curl snippet for POST /api/queue.
3. **Drift** (`#drift`): custom SVG line chart of avg grade over time (amber line, hairline grid, mono axis labels, no chart library), plus readout stats (batches graded, avg grade, flags caught). Honest empty state before meaningful data.
4. **Audit log** (`#audit-log`): mono readout rows — timestamp, actor, action, item, detail. Hairline separators.
5. Sample-data notice: dismissible, quiet, top of the page when seed/fallback data is shown.

## Header
Extend the route-aware header: on `/audit` and `/control`, center links become Why us? · Vision · AI system · Control (anchor links to `/#...`, plain link to `/control`). Same minimal styling, same 1024px hide rule, nothing wraps.

## Acceptance
- `npm run build` passes clean, no TS/lint errors.
- Screenshots: `/control` at 390px and 1280px (queue with drawer open on one item, drift chart, audit log), and the API exercised end-to-end: POST a batch → appears pending → approve it → appears in audit log → replay it.
- Seed data is visually tagged sample; no seed content pretends to be real.
- Report what was built and the exact Vercel KV setup steps the user must click (Storage tab → Create → KV → connect to tower-audit → redeploy), since persistence needs it.
