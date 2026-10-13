// Shared-secret auth for the write routes (POST /api/queue, /api/queue/[id]/decision, /api/replay/[id]).
//
// TOWER_API_SECRET (server): when set, writes must send a matching `x-tower-secret` header or get a 401.
//   When unset (local dev, preview), writes are open and /control shows "API writes are unauthenticated."
// NEXT_PUBLIC_TOWER_API_SECRET (client, inlined at build time): the secret the in-app UI sends.
//   When empty, the UI sends no header. Set both to the same value in production.
// GET routes stay open.
import { timingSafeEqual } from "node:crypto";

export const AUTH_HEADER = "x-tower-secret";

export type WriteAuth = { ok: true } | { ok: false; status: number; body: object };

export function writesAuthenticated(): boolean {
  return Boolean(process.env.TOWER_API_SECRET);
}

export function requireWriteAuth(req: Request): WriteAuth {
  const secret = process.env.TOWER_API_SECRET;
  if (!secret) return { ok: true };
  const given = Buffer.from(req.headers.get(AUTH_HEADER) ?? "");
  const wanted = Buffer.from(secret);
  if (given.length === wanted.length && timingSafeEqual(given, wanted)) return { ok: true };
  return { ok: false, status: 401, body: { error: "Unauthorized." } };
}
