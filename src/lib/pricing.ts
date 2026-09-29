/** The per-person price after the best volume-discount tier the group qualifies for (mirrors the API's rule). */
export function discountedPerPerson(base: number, tiers: { minPeople: number; percentOff: number }[] | undefined, groupSize: number): number {
  const hit = (tiers ?? []).filter((t) => groupSize >= t.minPeople).sort((a, b) => b.percentOff - a.percentOff)[0];
  return hit ? Math.round(base * (1 - hit.percentOff / 100) * 100) / 100 : base;
}
