/** Two-digit instrument readout: 3 → "03". Larger counts pass through unchanged. */
export const pad = (n: number) => String(n).padStart(2, "0");

/** "03 MESSAGES"-style count; the caller's readout class uppercases it. */
export const countOf = (n: number, noun: string) => `${pad(n)} ${noun}${n === 1 ? "" : "s"}`;
