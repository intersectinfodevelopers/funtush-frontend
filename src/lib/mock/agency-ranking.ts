/**
 * Marketplace agency ranking (mock).
 *
 * Mirrors the backend `marketplaceRanking.service` composite score so the
 * Trekker Hub's Discover page ranks the same way the API will once wired:
 *
 *   hard filter — status ACTIVE + paid tier + KYC verified
 *   base score  — tier, rating (smooth + volume-weighted), demand, freshness
 *   personal    — completed a trek here → "trekked with"; any booking → boost;
 *                 operates a region you've trekked → small boost
 */

import type { RawAgency, RawBooking, RawPackage } from "@/types/trek";

const PAID_TIERS = new Set(["small", "medium", "large"]);
const TIER_WEIGHT: Record<string, number> = { large: 1, medium: 0.6, small: 0.3 };

export interface AgencyHistory {
  bookingCount: number;
  completedCount: number;
  lastTrek: { packageName: string; date: string; status: string } | null;
}

export interface RankedAgency {
  agency: RawAgency;
  score: number;
  /** "trekked-with" (>=1 completed trek) or "recommended". */
  relationship: "trekked-with" | "contacted" | "recommended";
  reasons: string[];
  history: AgencyHistory | null;
  priceRange: { min: number; max: number } | null;
  destinationNames: string[];
}

export interface RankInput {
  agencies: RawAgency[];
  bookings: RawBooking[];
  packages: RawPackage[];
  trekkerId: string | undefined;
  filters?: {
    region?: string;
    minRating?: number;
    tier?: string;
    verifiedOnly?: boolean; // default true
    safetyCertifiedOnly?: boolean;
    savedIds?: string[]; // when set, restrict to these
  };
}

/** Smooth 0..1: 3.0★ → 0, 5.0★ → 1, damped by review volume (confidence). */
function ratingScore(rating: number, reviewCount: number): number {
  const raw = Math.max(0, Math.min(1, (rating - 3) / 2));
  const confidence = Math.min(1, Math.log10(reviewCount + 1) / 2); // ~0 at 0 reviews, 1 at ~99
  return raw * (0.4 + 0.6 * confidence);
}

/** Log-scaled recent demand from bookings in the last 30 days. */
function demandScore(agencyId: string, bookings: RawBooking[]): number {
  const cutoff = Date.now() - 30 * 86_400_000;
  const recent = bookings.filter(
    (b) => b.agency_id === agencyId && new Date(b.created_at).getTime() >= cutoff,
  ).length;
  return Math.min(1, Math.log10(recent + 1) / 1.2);
}

function priceRangeFor(agencyId: string, packages: RawPackage[]): { min: number; max: number } | null {
  const prices = packages
    .filter((p) => p.agency_id === agencyId)
    .map((p) => p.price_usd ?? p.price_per_person ?? 0)
    .filter((n) => n > 0);
  if (prices.length === 0) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

function historyFor(agencyId: string, trekkerId: string | undefined, bookings: RawBooking[], packages: RawPackage[]): AgencyHistory | null {
  if (!trekkerId) return null;
  const mine = bookings
    .filter((b) => b.agency_id === agencyId && b.trekker_id === trekkerId)
    .sort((a, b) => (a.departure_date < b.departure_date ? 1 : -1));
  if (mine.length === 0) return null;
  const last = mine[0];
  const pkg = packages.find((p) => p.id === last.package_id);
  return {
    bookingCount: mine.length,
    completedCount: mine.filter((b) => b.status === "completed").length,
    lastTrek: {
      packageName: pkg?.title ?? "a trek",
      date: last.departure_date,
      status: last.status,
    },
  };
}

export function rankAgencies(input: RankInput): { trekkedWith: RankedAgency[]; recommended: RankedAgency[] } {
  const { agencies, bookings, packages, trekkerId, filters = {} } = input;
  const verifiedOnly = filters.verifiedOnly ?? true;

  // Regions the trekker has actually trekked (for the affinity boost).
  const myRegions = new Set<string>();
  if (trekkerId) {
    for (const b of bookings) {
      if (b.trekker_id !== trekkerId) continue;
      const a = agencies.find((x) => x.id === b.agency_id);
      a?.destinations?.forEach((d) => myRegions.add(d));
    }
  }

  const ranked: RankedAgency[] = [];

  for (const agency of agencies) {
    // ── Hard filter ────────────────────────────────────────────────────────
    if (agency.status !== "active") continue;
    if (!PAID_TIERS.has(agency.tier)) continue;
    if (verifiedOnly && !agency.kyc_verified) continue;
    if (filters.safetyCertifiedOnly && !agency.safety_certified) continue;
    if (filters.tier && agency.tier !== filters.tier) continue;
    if (typeof filters.minRating === "number" && agency.rating < filters.minRating) continue;
    if (filters.region && !(agency.regions ?? []).some((r) => r.toLowerCase() === filters.region!.toLowerCase())) continue;
    if (filters.savedIds && !filters.savedIds.includes(agency.id)) continue;

    // ── Base score ─────────────────────────────────────────────────────────
    const tierW = TIER_WEIGHT[agency.tier] ?? 0.3;
    const rScore = ratingScore(agency.rating, agency.review_count ?? 0);
    const dScore = demandScore(agency.id, bookings);
    const freshness = (packages.filter((p) => p.agency_id === agency.id).length > 0 ? 1 : 0.3);

    let score =
      0.35 * tierW * 100 +
      0.3 * rScore * 100 +
      0.15 * dScore * 100 +
      0.1 * freshness * 100 +
      0.1 * (agency.safety_certified ? 100 : 40);

    const reasons: string[] = [];
    if (agency.rating >= 4.7 && (agency.review_count ?? 0) >= 20) reasons.push("Top rated");
    if (agency.tier === "large") reasons.push("Established operator");
    if (agency.safety_certified) reasons.push("Safety certified");

    // ── Personalisation ────────────────────────────────────────────────────
    const history = historyFor(agency.id, trekkerId, bookings, packages);
    let relationship: RankedAgency["relationship"] = "recommended";

    if (history) {
      if (history.completedCount > 0) {
        relationship = "trekked-with";
        score += 1000; // always floats into the "trekked with" group
        reasons.unshift(
          `You've completed ${history.completedCount} trek${history.completedCount === 1 ? "" : "s"} with them`,
        );
      } else {
        relationship = "contacted";
        score += 25;
        reasons.unshift("You've booked with them before");
      }
    } else if (trekkerId && (agency.regions ?? agency.destinations ?? []).some((r) => myRegions.has(r) || [...myRegions].some((m) => r.toLowerCase().includes(m.split("-")[0])))) {
      score += 12;
      reasons.push("Operates in a region you've trekked");
    }

    ranked.push({
      agency,
      score: Math.round(score),
      relationship,
      reasons: reasons.slice(0, 3),
      history,
      priceRange: priceRangeFor(agency.id, packages),
      destinationNames: agency.regions ?? agency.destinations ?? [],
    });
  }

  ranked.sort((a, b) => b.score - a.score);
  return {
    trekkedWith: ranked.filter((r) => r.relationship === "trekked-with"),
    recommended: ranked.filter((r) => r.relationship !== "trekked-with"),
  };
}
