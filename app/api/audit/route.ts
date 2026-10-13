import { NextResponse } from "next/server";
import { z } from "zod";
import { getGrader, runAudit } from "@/lib/grader";
import { describeFailure } from "@/lib/grader/failure";
import { LIMITS } from "@/lib/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const BodySchema = z.object({
  output: z.string().trim().min(1, "Paste some agent output to audit.").max(LIMITS.output, "Agent output is over 20,000 characters."),
  sources: z.string().max(LIMITS.sources, "Source context is over 40,000 characters.").optional(),
});

export async function POST(request: Request) {
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

  try {
    const report = await runAudit(parsed.data, getGrader(), request.signal);
    return NextResponse.json(report);
  } catch (error) {
    if (request.signal.aborted) return new NextResponse(null, { status: 499 });
    console.error("[audit] grading failed", error);
    return NextResponse.json({ error: describeFailure(error) }, { status: 502 });
  }
}
