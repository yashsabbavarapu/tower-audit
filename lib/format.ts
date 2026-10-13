/** Two-digit instrument readout: 3 → "03". Larger counts pass through unchanged. */
export const pad = (n: number) => String(n).padStart(2, "0");

/** "03 MESSAGES"-style count; the caller's readout class uppercases it. */
export const countOf = (n: number, noun: string) => `${pad(n)} ${noun}${n === 1 ? "" : "s"}`;

/** "12 min ago" / "3 h ago" / "5 d ago". Callers render it client-side only (it depends on the clock). */
export function relativeTime(iso: string, now = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

/** Deterministic UTC stamp for log rows: "2026-10-13 14:02Z". Identical on server and client. */
export const stamp = (iso: string) => `${iso.slice(0, 10)} ${iso.slice(11, 16)}Z`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-10-13" → "Oct 13". */
export const shortDate = (date: string) => `${MONTHS[Number(date.slice(5, 7)) - 1] ?? ""} ${Number(date.slice(8, 10))}`;
