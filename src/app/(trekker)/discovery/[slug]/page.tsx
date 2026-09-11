"use client";

/**
 * Agency profile (discovery) — the "look closely before you choose" page:
 * badges, rating, your history with them, their packages and recent reviews.
 */

import { use, useMemo } from "react";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  BadgeCheck,
  MapPin,
  CalendarClock,
  Clock,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { rankAgencies } from "@/lib/mock/agency-ranking";
import { HubHeader, HubCard, HubSection, StatCard } from "@/components/trekker/trekker-kit";
import type { RawAgency, RawBooking, RawPackage } from "@/types/trek";

import agenciesData from "../../../../../data/agencies.json";
import bookingsData from "../../../../../data/bookings.json";
import packagesData from "../../../../../data/packages.json";
import reviewsData from "../../../../../data/reviews.json";

const agencies = agenciesData as RawAgency[];
const bookings = bookingsData as RawBooking[];
const packages = packagesData as unknown as RawPackage[];
const reviews = reviewsData as Array<{
  id: string;
  agency_id: string;
  trekker_name: string;
  rating: number;
  title: string;
  text: string;
  created_at: string;
}>;

export default function AgencyProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user } = useAuth();

  const agency = useMemo(() => agencies.find((a) => a.slug === slug), [slug]);

  const ranked = useMemo(() => {
    if (!agency) return null;
    const { trekkedWith, recommended } = rankAgencies({
      agencies,
      bookings,
      packages,
      trekkerId: user?.id,
      filters: { verifiedOnly: false },
    });
    return [...trekkedWith, ...recommended].find((r) => r.agency.id === agency.id) ?? null;
  }, [agency, user]);

  if (!agency) {
    return (
      <HubCard className="mx-auto max-w-2xl text-center">
        <p className="text-lg font-semibold text-neutral-900">Agency not found</p>
        <Link href="/discovery" className="mt-4 inline-block text-sm font-medium text-primary-600 hover:underline">
          ← Back to Discover
        </Link>
      </HubCard>
    );
  }

  const agencyPackages = packages.filter((p) => p.agency_id === agency.id);
  const agencyReviews = reviews.filter((r) => r.agency_id === agency.id).slice(0, 6);
  const history = ranked?.history ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <HubHeader title={agency.name} description={agency.description} back="/discovery" />

      <HubCard className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-lg font-bold text-neutral-900">
          <Star className="h-5 w-5 fill-warning-400 text-warning-400" />
          {agency.rating.toFixed(1)}
          <span className="text-sm font-normal text-neutral-500">({agency.review_count ?? 0} reviews)</span>
        </span>
        {agency.kyc_verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-bold text-success-700">
            <BadgeCheck className="h-3.5 w-3.5" /> KYC verified
          </span>
        )}
        {agency.safety_certified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-bold text-success-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Safety certified
          </span>
        )}
      </HubCard>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={<CalendarClock className="h-4 w-4" />} label="Operating since" value={agency.established_year ?? "—"} tone="primary" />
        <StatCard icon={<MapPin className="h-4 w-4" />} label="Regions" value={(agency.regions ?? []).length} hint={(agency.regions ?? []).join(", ")} tone="accent" />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Your history"
          value={history ? (history.completedCount > 0 ? `${history.completedCount} completed` : `${history.bookingCount} booking${history.bookingCount === 1 ? "" : "s"}`) : "New to you"}
          tone={history?.completedCount ? "success" : "neutral"}
        />
      </div>

      {history && (
        <HubCard className="border-primary-200 bg-primary-50/50">
          <p className="text-sm text-primary-800">
            {history.completedCount > 0
              ? `You've completed ${history.completedCount} trek${history.completedCount === 1 ? "" : "s"} with ${agency.name}.`
              : `You've booked with ${agency.name} before.`}
            {history.lastTrek && (
              <>
                {" "}
                Most recent: <span className="font-semibold">{history.lastTrek.packageName}</span> (
                {new Date(history.lastTrek.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}).
              </>
            )}
          </p>
        </HubCard>
      )}

      <HubSection title={`Packages (${agencyPackages.length})`}>
        {agencyPackages.length > 0 ? (
          <ul className="divide-y divide-neutral-100">
            {agencyPackages.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-900">{p.title}</p>
                  <p className="text-xs text-neutral-500">
                    {p.duration_days} days · {p.difficulty ?? "moderate"}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-neutral-700">
                  {(p.price_usd ?? p.price_per_person)
                    ? `$${(p.price_usd ?? p.price_per_person)!.toLocaleString()}`
                    : "—"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">No published packages right now.</p>
        )}
      </HubSection>

      <HubSection title="Recent reviews">
        {agencyReviews.length > 0 ? (
          <ul className="space-y-4">
            {agencyReviews.map((r) => (
              <li key={r.id} className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-900">
                    <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" />
                    {r.rating}
                  </span>
                  <span className="text-sm font-medium text-neutral-700">{r.title}</span>
                </div>
                <p className="mt-1 text-sm text-neutral-600">{r.text}</p>
                <p className="mt-1 text-xs text-neutral-400">
                  {r.trekker_name} · {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">No reviews yet.</p>
        )}
      </HubSection>

      <HubCard className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600">Ready to trek with {agency.name}?</p>
        <a
          href={`https://funtush.com/agencies/${agency.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
        >
          View packages & book
        </a>
      </HubCard>
    </div>
  );
}
