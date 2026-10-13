import type { AuditStats, GradedClaim, Relevance, Verdict } from "./types";

/**
 * The grading rubric. Deliberately simple enough to explain on the page:
 * accuracy is the mean claim credit, relevance blends in when it exists,
 * and every flagged claim costs extra — one invented fact in a cold email
 * is worse than its share of the average suggests.
 */
export const RUBRIC = {
  credit: { verified: 1, unverifiable: 0.6, flagged: 0 } satisfies Record<Verdict, number>,
  relevanceWeight: 0.2,
  flagPenalty: 8,
  maxFlagPenalty: 40,
} as const;

export function computeStats(claims: GradedClaim[], relevance: Relevance): AuditStats {
  const count = (verdict: Verdict) => claims.filter((claim) => claim.verdict === verdict).length;
  const verified = count("verified");
  return {
    claimsChecked: claims.length,
    verified,
    unverifiable: count("unverifiable"),
    flagged: count("flagged"),
    verifiedPct: claims.length ? Math.round((verified / claims.length) * 100) : null,
    relevance: relevance.score === null ? null : Math.round(relevance.score),
  };
}

export function computeGrade(claims: GradedClaim[], stats: AuditStats): number | null {
  if (!claims.length) return null;
  const accuracy =
    (claims.reduce((sum, claim) => sum + RUBRIC.credit[claim.verdict], 0) / claims.length) * 100;
  const blended =
    stats.relevance === null
      ? accuracy
      : accuracy * (1 - RUBRIC.relevanceWeight) + stats.relevance * RUBRIC.relevanceWeight;
  const penalty = Math.min(stats.flagged * RUBRIC.flagPenalty, RUBRIC.maxFlagPenalty);
  return Math.max(0, Math.min(100, Math.round(blended - penalty)));
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function verdictLine(grade: number | null, stats: AuditStats, sourcesProvided: boolean): string {
  if (grade === null) {
    return "No checkable claims found. Nothing here asserts a fact Tower can test.";
  }
  if (stats.flagged > 0) {
    const flags = plural(stats.flagged, "claim");
    return grade < 50
      ? `Do not send. ${flags} would put invented facts in front of prospects.`
      : `Hold before sending. ${flags} look invented and need a fix.`;
  }
  if (!sourcesProvided && stats.unverifiable > 0) {
    return `Nothing flagged, but ${plural(stats.unverifiable, "claim")} can't be checked without sources.`;
  }
  if (grade >= 85) return "Clean. Every specific traces back to a source.";
  if (grade >= 70) return "Mostly sound. Review the unverified lines before sending.";
  return `Thin on proof. ${plural(stats.unverifiable, "claim")} rest on nothing Tower can see.`;
}
