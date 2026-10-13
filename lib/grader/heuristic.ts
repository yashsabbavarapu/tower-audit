import { parseSourceBlocks, type SourceBlock } from "./sources";
import type { AuditInput, GradedClaim, Grader, GraderResult, Message, Relevance } from "./types";

/**
 * Demo-mode grader. No model, no network: keyword overlap, number matching
 * and source-citation checks. It is useful for catching wrong figures and
 * unsupported name-drops, and it is honest about being shallow — confidences
 * are capped well below certainty and every report is labeled demo mode.
 */

const MAX_CONFIDENCE = 0.75;

const STOPWORDS = new Set(
  (
    "a an the and or but if so of to in on at by for with from into over about as is are was were be been " +
    "being it its this that these those your you yours our we us i i'd i'm me my their they them he she his her " +
    "has have had do does did will would can could should may might just very really more most lot lots like " +
    "than then there here what which who whom when where why how all any each every some such no not only own " +
    "same too also now new next last per via up down out off again once across"
  ).split(" "),
);

const EVENT_WORDS =
  /\b(talk|talks|keynote|panel|podcast|webinar|interview|article|post|award|awards|named|ranked|spoke|presentation|episode|op-ed)\b/i;
const GREETING = /^(hi|hello|hey|dear|good (morning|afternoon))\b[^.!?]{0,40}[,!]?$/i;
const SIGNOFF = /^(best|thanks|thank you|cheers|regards|warmly|talk soon|all the best)\b[^.!?]{0,30}$/i;
const CITATION = /(https?:\/\/\S+|\baccording to\b|\bper (?:the|their|your)\b|\breported\b)/i;

const clampConfidence = (value: number) => Math.max(0, Math.min(MAX_CONFIDENCE, Number(value.toFixed(2))));

function stem(word: string): string {
  let w = word.replace(/'s$/, "");
  if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith("ed")) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
  return w;
}

function terms(text: string): Set<string> {
  const words = text.toLowerCase().match(/[a-z][a-z'-]*/g) ?? [];
  return new Set(words.filter((w) => w.length > 1 && !STOPWORDS.has(w)).map(stem));
}

/** Map matched stems back to the words as written in the claim, for display. */
function surfaceWords(text: string, stems: string[], limit = 4): string[] {
  const wanted = new Set(stems);
  const words = (text.match(/[A-Za-z][A-Za-z'-]*/g) ?? []).filter((w) => wanted.has(stem(w.toLowerCase())));
  return Array.from(new Set(words.map((w) => w.replace(/'s$/, "")))).slice(0, limit);
}

function numbers(text: string): string[] {
  return (text.match(/\d+(?:\.\d+)?/g) ?? []).map((n) => String(Number(n)));
}

/** Capitalized words that are not sentence-initial: names, places, products. */
function properNouns(sentence: string): string[] {
  const words = sentence.split(/\s+/).slice(1);
  return words
    .map((w) => w.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "").replace(/'s$/, ""))
    .filter((w) => w.length > 1 && /^[A-Z]/.test(w));
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=["'$\dA-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

interface Candidate {
  messageIndex: number;
  text: string;
}

function extractClaims(messages: Message[]): Candidate[] {
  const candidates: Candidate[] = [];
  for (const message of messages) {
    const lines = message.body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !GREETING.test(line) && !SIGNOFF.test(line))
      // A lone short line after the body is a signature, not a claim.
      .filter((line) => line.split(/\s+/).length > 2);
    for (const sentence of lines.flatMap(sentences)) {
      if (sentence.endsWith("?")) continue; // questions and CTAs assert nothing
      if (sentence.split(/\s+/).length < 5) continue;
      const checkable = /\d/.test(sentence) || properNouns(sentence).length > 0 || CITATION.test(sentence);
      if (checkable) candidates.push({ messageIndex: message.index, text: sentence });
    }
  }
  return candidates;
}

/** Capitalized terms that recur across messages but not in sources: the seller's own name and product. */
function sellerTerms(messages: Message[], sourcesLower: string): Set<string> {
  const seen = new Map<string, Set<number>>();
  for (const message of messages) {
    for (const noun of message.body.match(/\b[A-Z][a-zA-Z]+\b/g) ?? []) {
      const key = noun.toLowerCase();
      if (!seen.has(key)) seen.set(key, new Set());
      seen.get(key)?.add(message.index);
    }
  }
  const result = new Set<string>();
  seen.forEach((indices, key) => {
    if (indices.size > 1 && !sourcesLower.includes(key) && !STOPWORDS.has(key)) result.add(key);
  });
  return result;
}

function isSelfClaim(text: string, seller: Set<string>): boolean {
  const lead = text.split(/\s+/).slice(0, 2).map((w) => w.toLowerCase().replace(/[^a-z]/g, ""));
  return lead[0] === "we" || lead[0] === "our" || lead.some((w) => seller.has(w));
}

interface Match {
  block: SourceBlock;
  matched: string[];
  coverage: number;
  excerpt: string;
}

function bestMatch(claimTerms: Set<string>, blocks: SourceBlock[]): Match | null {
  let best: Match | null = null;
  for (const block of blocks) {
    const blockTerms = terms(block.text);
    const matched = Array.from(claimTerms).filter((t) => blockTerms.has(t));
    const coverage = claimTerms.size ? matched.length / claimTerms.size : 0;
    if (!best || coverage > best.coverage) {
      // Quote body text only: never the title line or the URL.
      const bodyLines = block.text
        .split("\n")
        .filter((line, i) => !(i === 0 && block.label) && !/^https?:\/\//.test(line.trim()));
      const bodySentences = sentences(bodyLines.join(" "));
      const excerpt =
        bodySentences
          .map((s) => ({ s, hits: Array.from(terms(s)).filter((t) => claimTerms.has(t)).length }))
          .sort((a, b) => b.hits - a.hits)[0]?.s ?? block.text;
      best = { block, matched, coverage, excerpt };
    }
  }
  return best;
}

function trace(match: Match) {
  return { excerpt: match.excerpt, label: match.block.label, url: match.block.url };
}

function gradeAgainstSources(
  candidate: Candidate,
  id: string,
  blocks: SourceBlock[],
  sourcesLower: string,
  sourceNumbers: Set<string>,
  seller: Set<string>,
): GradedClaim {
  const base = { id, messageIndex: candidate.messageIndex, text: candidate.text, flag: null };
  const claimTerms = terms(candidate.text);
  const match = bestMatch(claimTerms, blocks);
  const nums = numbers(candidate.text);
  const missing = nums.filter((n) => !sourceNumbers.has(n));
  const nouns = properNouns(candidate.text);
  const matchedNouns = nouns.filter((n) => sourcesLower.includes(n.toLowerCase()));
  const unknownNouns = nouns.filter((n) => !sourcesLower.includes(n.toLowerCase()) && !seller.has(n.toLowerCase()));
  const coverage = match?.coverage ?? 0;

  if (isSelfClaim(candidate.text, seller)) {
    return {
      ...base,
      verdict: "unverifiable",
      confidence: clampConfidence(0.7),
      basis: "none",
      source: null,
      explanation:
        nums.length > 0
          ? `This is a claim about your own product, and the ${nums.join(", ")} figure needs a citable case study. Tower can't check it from the sources provided.`
          : "This is a claim about your own product. Tower can't check it without your product docs or case studies.",
    };
  }

  if (missing.length > 0 && match && coverage >= 0.3) {
    const figures = missing.map((n) => `"${n}"`).join(", ");
    return {
      ...base,
      verdict: "flagged",
      confidence: clampConfidence(0.5 + 0.3 * coverage),
      basis: "source",
      source: trace(match),
      explanation: `The sources cover this topic, but the figure ${figures} appears nowhere in them. The nearest source line says something different.`,
      flag: {
        headline: `The number ${figures} doesn't match your sources`,
        explanation: `Your sources discuss the same thing but never mention ${figures}. If the prospect knows their own numbers — and they do — a wrong figure tells them the email wasn't written for them.`,
        fix: "Use the figure from the source, or drop the number entirely.",
      },
    };
  }

  if (/\byour?\b/i.test(candidate.text) && EVENT_WORDS.test(candidate.text) && unknownNouns.length > 0) {
    const named = unknownNouns.join(" ");
    return {
      ...base,
      verdict: "flagged",
      confidence: clampConfidence(0.55),
      basis: "none",
      source: null,
      explanation: `This references a specific event (${named}) that appears nowhere in your sources. It may be real, but nothing you provided backs it.`,
      flag: {
        headline: `Mentions ${named}, and nothing backs it up`,
        explanation: `The email credits the prospect with something specific that none of your sources mention. If it never happened, the first line of the email is made up, and the prospect will know immediately.`,
        fix: "Cut the reference, or open with a detail that's actually in your research.",
      },
    };
  }

  if (match && missing.length === 0 && (coverage >= 0.4 || (match.matched.length >= 3 && matchedNouns.length > 0))) {
    return {
      ...base,
      verdict: "verified",
      confidence: clampConfidence(0.45 + 0.4 * coverage + (nums.length ? 0.05 : 0)),
      basis: "source",
      source: trace(match),
      explanation: `Key details (${surfaceWords(candidate.text, match.matched).join(", ")}) match a source. Demo mode checks word overlap, not meaning, so read the excerpt.`,
    };
  }

  return {
    ...base,
    verdict: "unverifiable",
    confidence: clampConfidence(0.5),
    basis: "none",
    source: null,
    explanation: "Nothing in your sources clearly supports or contradicts this.",
  };
}

function gradeWithoutSources(candidate: Candidate, id: string): GradedClaim {
  const cited = candidate.text.match(CITATION)?.[0];
  return {
    id,
    messageIndex: candidate.messageIndex,
    text: candidate.text,
    verdict: "unverifiable",
    confidence: clampConfidence(0.6),
    basis: "none",
    source: null,
    flag: null,
    explanation: cited
      ? `It cites a source (${cited}), but demo mode doesn't fetch links. Paste the source text to check it.`
      : "No sources were provided, so there is nothing to check this against.",
  };
}

function relevanceFrom(messages: Message[], sourcesLower: string, hasSources: boolean): Relevance {
  if (!hasSources) {
    return { score: null, rationale: "Relevance needs source context: there is nothing to compare the messages against." };
  }
  const perMessage = messages.map((message) => {
    const text = [message.subject ?? "", message.body].join(" ");
    const anchors = new Set(
      (text.match(/\b[A-Z][a-zA-Z]+\b|\d+/g) ?? [])
        .slice(1)
        .filter((token) => token.length > 1 && sourcesLower.includes(token.toLowerCase())),
    );
    return Math.min(1, anchors.size / 3);
  });
  const score = perMessage.length ? (perMessage.reduce((a, b) => a + b, 0) / perMessage.length) * 100 : 0;
  return {
    score: Math.round(score),
    rationale: "Share of messages that use at least three prospect-specific details from your sources. A keyword count, not a reading.",
  };
}

export class HeuristicGrader implements Grader {
  readonly info = { name: "Heuristic grader", mode: "demo", model: null } as const;

  async grade(input: AuditInput, messages: Message[]): Promise<GraderResult> {
    const sources = input.sources?.trim() ?? "";
    const hasSources = sources.length > 0;
    const sourcesLower = sources.toLowerCase();
    const blocks = parseSourceBlocks(sources);
    const sourceNumbers = new Set(numbers(sources));
    const seller = sellerTerms(messages, sourcesLower);

    const claims = extractClaims(messages).map((candidate, i) => {
      const id = `c${i + 1}`;
      return hasSources
        ? gradeAgainstSources(candidate, id, blocks, sourcesLower, sourceNumbers, seller)
        : gradeWithoutSources(candidate, id);
    });

    const notes = [
      "Demo mode: claims were checked by keyword and number matching, not by a model. Confidences are capped at 75%.",
    ];
    if (!hasSources) notes.push("No source context was provided, so no claim could be verified or flagged.");

    return { claims, relevance: relevanceFrom(messages, sourcesLower, hasSources), notes };
  }
}
