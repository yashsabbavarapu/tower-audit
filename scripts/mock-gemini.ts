// Exercises GeminiGrader against a mocked fetch, plus grader selection: `npx tsx scripts/mock-gemini.ts`
import assert from "node:assert/strict";
import { getGrader } from "../lib/grader";
import { GeminiApiError, GeminiGrader } from "../lib/grader/gemini";
import { splitMessages } from "../lib/grader/messages";
import { SAMPLE_OUTPUT, SAMPLE_SOURCES } from "../lib/sample";

const extraction = { claims: [
  { message_index: 0, text: "Halden raised a $40M Series C" },
  { message_index: 0, text: "Halden is opening a Rotterdam hub" },
  { message_index: 1, text: "Brightwater has 31 clinics" },
  { message_index: 2, text: "Corvane is a public company" },
  { message_index: 9, text: "out-of-range message" },
] };
const verification = {
  verdicts: [
    { claim_id: "c1", verdict: "flagged", confidence: 0.93, basis: "source", explanation: "Sources say $28M Series B.",
      source_excerpt: "Halden Freight announced a $28M Series B led by Northgate Partners.", flag: { headline: "Wrong round", explanation: "x", fix: null } },
    { claim_id: "c2", verdict: "verified", confidence: 0.95, basis: "source", explanation: "ok",
      source_excerpt: "open a European hub in Rotterdam" },
    { claim_id: "c3", verdict: "verified", confidence: 0.97, basis: "source", explanation: "ok",
      source_excerpt: "Brightwater has thirty-one clinics nationwide" }, // fabricated quote
    { claim_id: "c4", verdict: "unverifiable", confidence: 0.9, basis: "model-knowledge", explanation: "Not known." },
  ],
  relevance: { score: 82.4, rationale: "Specific." },
};

const ok = (text: string) =>
  new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] }, finishReason: "STOP" }] }), { status: 200 });

function withFetch(grader: GeminiGrader, replies: (() => Response)[], seen: { url: string; init: RequestInit }[] = []) {
  let call = 0;
  (grader as unknown as { fetchImpl: typeof fetch }).fetchImpl = async (url, init) => {
    seen.push({ url: String(url), init: init ?? {} });
    return replies[call++]!();
  };
  return grader;
}

const input = { output: SAMPLE_OUTPUT, sources: SAMPLE_SOURCES };
const messages = splitMessages(input.output);

async function main() {
  // Happy path: plain JSON for extraction, fenced JSON for verification (defensive parsing).
  const seen: { url: string; init: RequestInit }[] = [];
  const grader = withFetch(
    new GeminiGrader("test-key"),
    [() => ok(JSON.stringify(extraction)), () => ok("```json\n" + JSON.stringify(verification) + "\n```")],
    seen,
  );
  const result = await grader.grade(input, messages);
  const [c1, c2, c3, c4] = result.claims;
  assert.equal(seen.length, 2, "two-call pipeline");
  assert.equal(seen[0]!.url, "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent");
  assert.equal((seen[0]!.init.headers as Record<string, string>)["x-goog-api-key"], "test-key");
  const body = JSON.parse(String(seen[1]!.init.body));
  assert.equal(body.generationConfig.responseMimeType, "application/json");
  assert.match(body.contents[0].parts[0].text, /<claim id="c4"/);
  assert.equal(result.claims.length, 4, "out-of-range message index dropped");
  assert.equal(c1!.verdict, "flagged");
  assert.equal(c1!.source?.url, "https://halden.example/newsroom/series-b");
  assert.equal(c2!.verdict, "verified");
  assert.equal(c3!.verdict, "unverifiable", "fabricated excerpt must downgrade verified");
  assert.ok(c3!.confidence <= 0.5);
  assert.equal(c3!.source, null);
  assert.ok(c4!.confidence <= 0.7, "model-knowledge confidence capped");
  assert.equal(result.relevance.score, 82);
  assert.equal(grader.info.provider, "gemini");

  // A missing model surfaces Google's message instead of guessing another id.
  const notFound = withFetch(new GeminiGrader("k", "gemini-nope"), [
    () => new Response(JSON.stringify({ error: { code: 404, message: "models/gemini-nope is not found for API version v1beta", status: "NOT_FOUND" } }), { status: 404 }),
  ]);
  await assert.rejects(notFound.grade(input, messages), (e: unknown) =>
    e instanceof GeminiApiError && e.status === 404 && e.apiMessage.includes("gemini-nope"));

  // Malformed output is an error, not a silent pass.
  const garbage = withFetch(new GeminiGrader("k"), [() => ok("I can't do that.")]);
  await assert.rejects(garbage.grade(input, messages), /unparseable claim extraction/);
  const wrongShape = withFetch(new GeminiGrader("k"), [() => ok(JSON.stringify({ claims: [{ text: 3 }] }))]);
  await assert.rejects(wrongShape.grade(input, messages), /malformed claim extraction/);

  // Selection order.
  assert.equal(getGrader({ ANTHROPIC_API_KEY: "a", GEMINI_API_KEY: "g" }).info.provider, "anthropic");
  assert.equal(getGrader({ GEMINI_API_KEY: "g" }).info.provider, "gemini");
  assert.equal(getGrader({}).info.mode, "demo");
  assert.equal(getGrader({ TOWER_GRADER: "gemini", ANTHROPIC_API_KEY: "a", GEMINI_API_KEY: "g" }).info.provider, "gemini");
  assert.equal(getGrader({ TOWER_GRADER: "demo", ANTHROPIC_API_KEY: "a" }).info.mode, "demo");
  assert.equal(getGrader({ GEMINI_API_KEY: "g", TOWER_GEMINI_MODEL: "gemini-2.5-pro" }).info.model, "gemini-2.5-pro");
  const fallback = getGrader({ TOWER_GRADER: "gemini", ANTHROPIC_API_KEY: "a" });
  assert.equal(fallback.info.mode, "demo", "explicit choice wins, falls back to demo when its key is missing");
  assert.match(fallback.info.reason ?? "", /GEMINI_API_KEY isn't set/);
  const fallbackReport = await fallback.grade(input, messages);
  assert.match(fallbackReport.notes[0] ?? "", /GEMINI_API_KEY isn't set/, "fallback reason shown on the report");
  assert.match(getGrader({ TOWER_GRADER: "gpt" }).info.reason ?? "", /isn't a known grader/);

  console.log("GeminiGrader post-processing + grader selection: all assertions passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
