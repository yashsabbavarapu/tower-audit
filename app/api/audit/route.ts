import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getGrader, runAudit } from "@/lib/grader";
import { GeminiApiError } from "@/lib/grader/gemini";
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

function describeFailure(error: unknown): string {
  if (error instanceof GeminiApiError) return describeGeminiFailure(error);
  if (error instanceof DOMException && error.name === "TimeoutError") return "The grader timed out. Try a shorter input.";
  if (error instanceof Anthropic.AuthenticationError) {
    return "The Anthropic API key was rejected. Check ANTHROPIC_API_KEY, or unset it to use demo mode.";
  }
  if (error instanceof Anthropic.RateLimitError) return "The grader is rate-limited right now. Try again in a minute.";
  if (error instanceof Anthropic.NotFoundError) return "The configured model isn't available to this API key. Check TOWER_MODEL.";
  if (error instanceof Anthropic.APIConnectionTimeoutError) return "The grader timed out. Try a shorter input.";
  if (error instanceof Anthropic.APIError) return `The grader failed (${error.status ?? "network"}). Try again.`;
  return `Grading failed: ${error instanceof Error ? error.message : "unknown error"}`;
}

// Surface Google's own message: a 404 names the model id that doesn't exist, and we don't guess another.
function describeGeminiFailure(error: GeminiApiError): string {
  const api = error.apiMessage;
  switch (error.status) {
    case 400:
      if (/api key/i.test(api)) return `The Gemini API key was rejected: ${api} Check GEMINI_API_KEY.`;
      return `Gemini rejected the request: ${api}`;
    case 401:
    case 403:
      return `The Gemini API key was rejected: ${api} Check GEMINI_API_KEY.`;
    case 404:
      return `Gemini couldn't find the configured model: ${api} Check TOWER_GEMINI_MODEL.`;
    case 429:
      return `Gemini's free-tier rate limit was hit: ${api} Try again in a minute.`;
    default:
      return `The Gemini grader failed (${error.status}): ${api}`;
  }
}
