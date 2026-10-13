import { NextResponse } from "next/server";
import { z } from "zod";
import { auditEntry, gradeReport, replayResult } from "@/lib/control/grading";
import { describeFailure } from "@/lib/grader/failure";
import { LIMITS } from "@/lib/limits";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const BodySchema = z.object({
  sources: z.string().max(LIMITS.sources, "Source context is over 40,000 characters.").optional(),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  // An empty body is fine: replay against the stored sources.
  const json: unknown = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(json ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const store = getStore();
  const item = await store.getItem(params.id);
  if (!item) return NextResponse.json({ error: "No queue item with that id." }, { status: 404 });

  try {
    const sources = parsed.data.sources?.trim() ? parsed.data.sources : item.sources;
    const report = await gradeReport(item.messages, sources, request.signal);
    const result = replayResult(item, report);
    const grades = `grade ${result.old_grade ?? "none"} → ${result.new_grade ?? "none"}`;
    await store.appendAudit(
      auditEntry({
        actor: "operator",
        action: "replayed",
        item_id: item.id,
        detail: `${grades} · ${result.rotted_claims.length} rotted${report.grader.mode === "demo" ? " · demo grader" : ""}`,
        ...(item.sample ? { sample: true } : {}),
      }),
    );
    return NextResponse.json(result);
  } catch (error) {
    if (request.signal.aborted) return new NextResponse(null, { status: 499 });
    console.error("[replay] grading failed", error);
    return NextResponse.json({ error: describeFailure(error) }, { status: 502 });
  }
}
