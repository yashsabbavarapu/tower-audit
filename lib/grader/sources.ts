import type { SourceTrace } from "./types";

const URL_PATTERN = /https?:\/\/[^\s)>\]]+/;

export interface SourceBlock {
  label: string | null;
  url: string | null;
  text: string;
}

/** Sources are free text; blank lines separate blocks (one per document). */
export function parseSourceBlocks(sources: string): SourceBlock[] {
  return sources
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((text) => {
      const firstLine = text.split("\n")[0]?.trim() ?? "";
      const url = text.match(URL_PATTERN)?.[0] ?? null;
      const label = firstLine && !URL_PATTERN.test(firstLine) ? firstLine : null;
      return { label, url, text };
    });
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Locate an excerpt in the provided sources. Returns null unless the excerpt
 * genuinely appears there — a trace that cannot be found is not a trace.
 */
export function locateExcerpt(sources: string, excerpt: string): SourceTrace | null {
  const needle = normalize(excerpt);
  if (needle.length < 8) return null;
  for (const block of parseSourceBlocks(sources)) {
    if (normalize(block.text).includes(needle)) {
      return { excerpt: excerpt.trim(), label: block.label, url: block.url };
    }
  }
  return null;
}
