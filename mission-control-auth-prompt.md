# Add shared-secret auth to Tower Mission Control write routes

Context: Tower Mission Control (`/control`) is built with API routes under `/api/queue`, `/api/queue/[id]/decision`, and `/api/replay/[id]`. They currently have no auth: anyone with the URL can submit batches (spending the owner's Gemini grader credits) and approve/reject items. Read `/home/hatch/workspace/goals/build-the-end-to-end-gtm-ai-application/files/tower-design-spec.md` for the design law (no visual changes in this task).

## Change
Gate the write routes with a shared secret:
- New env var `TOWER_API_SECRET`. When set, `POST /api/queue`, `POST /api/queue/[id]/decision`, and `POST /api/replay/[id]` require the header `x-tower-secret` matching it; otherwise return 401 with a plain JSON error. GET routes stay open.
- When `TOWER_API_SECRET` is NOT set (local dev, preview), writes work without the header but the control page shows its existing quiet sample-data-style notice extended with one line: "API writes are unauthenticated." Keep it one quiet line, same mono style.
- The in-app UI (queue approve/reject/replay buttons) must send the header: read the secret from a public env var `NEXT_PUBLIC_TOWER_API_SECRET` at build time; if it is empty, send no header (dev behavior above). Document both vars in a short comment at the top of the auth helper.
- New `lib/api-auth.ts` helper: `requireWriteAuth(req: Request): { ok: true } | { ok: false; status: number; body: object }`. Use it in the three write routes.

## Acceptance
- `npm run build` passes clean, no TS/lint errors.
- Verify with curl against `next start`: with `TOWER_API_SECRET=test123`, POST without the header → 401; with the header → works. With the var unset → works without header.
- No visual or copy changes beyond the one quiet notice line. Report what was built.
