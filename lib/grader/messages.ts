import type { Message } from "./types";

const SEPARATOR = /^\s*(?:-{3,}|={3,}|\*{3,}|_{3,})\s*$/m;
const SUBJECT = /^\s*subject\s*:\s*(.+)$/i;

/**
 * Split pasted output into individual messages. Explicit separators (---)
 * win; otherwise a new "Subject:" line starts a new message.
 */
export function splitMessages(output: string): Message[] {
  const normalized = output.replace(/\r\n?/g, "\n").trim();
  if (!normalized) return [];

  let chunks = normalized.split(SEPARATOR);
  if (chunks.length === 1) {
    chunks = normalized.split(/\n(?=\s*subject\s*:)/i);
  }

  return chunks
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk, index) => {
      const lines = chunk.split("\n");
      const subjectMatch = lines[0]?.match(SUBJECT);
      const subject = subjectMatch?.[1]?.trim() ?? null;
      const body = (subjectMatch ? lines.slice(1) : lines).join("\n").trim();
      return { index, subject, body };
    });
}
