// Exercises AnthropicGrader's post-processing with a mocked client: `npx tsx scripts/mock-anthropic.ts`
import assert from "node:assert/strict";
import { AnthropicGrader } from "../lib/grader/anthropic";
import { splitMessages } from "../lib/grader/messages";
import { SAMPLE_OUTPUT, SAMPLE_SOURCES } from "../lib/sample";

const replies = [
  { name: "record_claims", input: { claims: [
    { message_index: 0, text: "Halden raised a $40M Series C" },
    { message_index: 0, text: "Halden is opening a Rotterdam hub" },
    { message_index: 1, text: "Brightwater has 31 clinics" },
    { message_index: 2, text: "Corvane is a public company" },
    { message_index: 9, text: "out-of-range message" },
  ] } },
  { name: "record_verdicts", input: {
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
  } },
];

const grader = new AnthropicGrader("test-key");
let call = 0;
(grader as unknown as { client: unknown }).client = {
  messages: { create: async () => { const r = replies[call++]!; return { content: [{ type: "tool_use", id: "t", name: r.name, input: r.input }], stop_reason: "tool_use" }; } },
};

const input = { output: SAMPLE_OUTPUT, sources: SAMPLE_SOURCES };
grader.grade(input, splitMessages(input.output)).then((result) => {
  const [c1, c2, c3, c4] = result.claims;
  assert.equal(result.claims.length, 4, "out-of-range message index dropped");
  assert.equal(c1!.verdict, "flagged");
  assert.equal(c1!.source?.url, "https://halden.example/newsroom/series-b");
  assert.equal(c2!.verdict, "verified");
  assert.equal(c3!.verdict, "unverifiable", "fabricated excerpt must downgrade verified");
  assert.ok(c3!.confidence <= 0.5);
  assert.equal(c3!.source, null);
  assert.ok(c4!.confidence <= 0.7, "model-knowledge confidence capped");
  assert.equal(result.relevance.score, 82);
  console.log("AnthropicGrader post-processing: all assertions passed");
});
