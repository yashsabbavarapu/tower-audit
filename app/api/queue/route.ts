import { NextResponse } from "next/server";
import { z } from "zod";
import { requireWriteAuth } from "@/lib/api-auth";
import { auditEntry, gradedDetail, gradeReport, itemFromReport } from "@/lib/control/grading";
import type { QueueStatus } from "@/lib/control/types";
import { describeFailure } from "@/lib/grader/failure";
import { LIMITS } from "@/lib/limits";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const BodySchema = z.object({
  agent_name: z.string().trim().min(1, "agent_name must be a non-empty string.").max(80, "agent_name is over 80 characters."),
  messages: z
    .array(z.string().trim().min(1, "messages can't contain empty strings."), { error: "messages must be a non-empty array of strings." })
    .min(1, "messages must be a non-empty array of strings."),
  sources: z.string().max(LIMITS.sources, "Source context is over 40,000 characters.").optional(),
});

const STATUSES = ["pending", "approved", "rejected", "all"] as const;

export async function GET(request: Request) {
  const status = new URL(request.url).searchParams.get("status") ?? "pending";
  if (!(STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: "status must be pending, approved, rejected or all." }, { status: 400 });
  }
  const items = await getStore().listItems();
  return NextResponse.json({ items: status === "all" ? items : items.filter((i) => i.status === (status as QueueStatus)) });
}

export async function POST(request: Request) {
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
  const input = parsed.data;
  if (input.messages.join("").length > LIMITS.output) {
    return NextResponse.json({ error: "Messages are over 20,000 characters combined." }, { status: 400 });
  }

  try {
    const report = await gradeReport(input.messages, input.sources, request.signal);
    const item = itemFromReport(report, input);
    const store = getStore();
    await store.putItem(item);
    await store.appendAudit(auditEntry({ at: item.submitted_at, actor: item.agent_name, action: "graded", item_id: item.id, detail: gradedDetail(item) }));
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (request.signal.aborted) return new NextResponse(null, { status: 499 });
    console.error("[queue] grading failed", error);
    return NextResponse.json({ error: describeFailure(error) }, { status: 502 });
  }
}
