// Prints the demo-mode report for the built-in sample: `npx tsx scripts/grade-sample.ts`
import { HeuristicGrader } from "../lib/grader/heuristic";
import { runAudit } from "../lib/grader";
import { SAMPLE_OUTPUT, SAMPLE_SOURCES } from "../lib/sample";

runAudit({ output: SAMPLE_OUTPUT, sources: SAMPLE_SOURCES }, new HeuristicGrader()).then((r) => {
  for (const c of r.claims) console.log(`[${c.verdict.padEnd(12)} ${c.confidence}] m${c.messageIndex} ${c.text}`);
  console.log({ grade: r.grade, verdict: r.verdictLine, stats: r.stats });
});
