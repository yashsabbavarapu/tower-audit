import Anthropic from "@anthropic-ai/sdk";
import { GeminiApiError } from "./gemini";

/** Plain-English reason a grader call failed, shared by every route that grades. */
export function describeFailure(error: unknown): string {
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
