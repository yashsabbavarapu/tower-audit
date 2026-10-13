import { NextResponse } from "next/server";
import { driftPoints } from "@/lib/control/grading";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ points: driftPoints(await getStore().listItems()) });
}
