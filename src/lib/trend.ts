/** Real period-over-period growth only — undefined (never fabricated) when there's no base to compare against. */
export function growthPct(curr: number, prev: number): string | undefined {
  if (prev === 0) return undefined;
  const pct = ((curr - prev) / Math.abs(prev)) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

/** Splits a day/month-bucketed series in half and sums each half — an honest trend comparison when there's no reliable "same period last month" data available (e.g. a free-tier period window). */
export function splitCompare<T extends { v: number }>(series: T[]): { recent: number; prior: number } {
  const half = Math.ceil(series.length / 2);
  return {
    prior: series.slice(0, half).reduce((s, p) => s + p.v, 0),
    recent: series.slice(half).reduce((s, p) => s + p.v, 0),
  };
}
