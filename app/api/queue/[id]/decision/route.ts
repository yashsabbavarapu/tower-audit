import { NextResponse } from "next/server";
import { z } from "zod";
import { requireWriteAuth } from "@/lib/api-auth";
import { auditEntry } from "@/lib/control/grading";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  decision: z.enum(["approved", "rejected"], { error: 'decision must be "approved" or "rejected".' }),
  note: z.string().max(500, "note is over 500 characters.").optional(),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = requireWriteAuth(request);
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const store = getStore();
  const item = await store.getItem(params.id);
  if (!item) return NextResponse.json({ error: "No queue item with that id." }, { status: 404 });
  if (item.status !== "pending") {
    return NextResponse.json({ error: `This item was already ${item.status}.` }, { status: 409 });
  }

  const { decision, note } = parsed.data;
  const decided: typeof item = { ...item, status: decision, decided_at: new Date().toISOString() };
  await store.putItem(decided);
  await store.appendAudit(
    auditEntry({
      at: decided.decided_at,
      actor: "operator",
      action: decision,
      item_id: item.id,
      detail: note?.trim() || `${item.agent_name} · ${item.counts.flagged} flagged`,
      ...(item.sample ? { sample: true } : {}),
    }),
  );
  return NextResponse.json(decided);
}
