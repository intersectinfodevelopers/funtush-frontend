"use client";

/**
 * Discover agencies — a ranked, KYC-verified list personalised to the trekker's
 * history, with a compare tray and saved agencies. Mirrors the backend
 * `marketplaceRanking` composite score (mock-backed here).
 */

import { useMemo, useState } from "react";
import { Compass, SlidersHorizontal, Heart, BarChart3 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";
import { rankAgencies } from "@/lib/mock/agency-ranking";
import {
  HubHeader,
  HubCard,
  EmptyState,
  Field,
  SelectInput,
  ToggleRow,
} from "@/components/trekker/trekker-kit";
import { AgencyCard, CompareTable } from "@/components/trekker/discovery/discovery-parts";
import type { RawAgency, RawBooking, RawPackage } from "@/types/trek";

import agenciesData from "../../../../data/agencies.json";
import bookingsData from "../../../../data/bookings.json";
import packagesData from "../../../../data/packages.json";

const agencies = agenciesData as RawAgency[];
const bookings = bookingsData as RawBooking[];
const packages = packagesData as unknown as RawPackage[];

const SAVED_KEY = "trekkerSavedAgencies";
const MAX_COMPARE = 3;

function readSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

const ALL_REGIONS = [...new Set(agencies.flatMap((a) => a.regions ?? []))].sort();

export default function DiscoveryPage() {
  const { user } = useAuth();

  const [savedIds, setSavedIds] = useState<string[]>(readSaved);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [filters, setFilters] = useState({
    verifiedOnly: true,
    safetyCertifiedOnly: false,
    minRating: 0,
    tier: "",
    region: "",
  });

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };
  const toggleCompare = (id: string) =>
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < MAX_COMPARE ? [...prev, id] : prev,
    );

  const { trekkedWith, recommended } = useMemo(
    () =>
      rankAgencies({
        agencies,
        bookings,
        packages,
        trekkerId: user?.id,
        filters: {
          ...filters,
          minRating: filters.minRating || undefined,
          tier: filters.tier || undefined,
          region: filters.region || undefined,
          savedIds: savedOnly ? savedIds : undefined,
        },
      }),
    [user, filters, savedOnly, savedIds],
  );

  const all = [...trekkedWith, ...recommended];
  const compareItems = all.filter((r) => compareIds.includes(r.agency.id));

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      <HubHeader
        title="Discover agencies"
        description="Ranked, KYC-verified agencies — the ones you've trekked with come first."
        action={
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-semibold",
              showFilters
                ? "border-primary-300 bg-primary-50 text-primary-700"
                : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          </button>
        }
      />

      {showFilters && (
        <HubCard className="grid gap-4 sm:grid-cols-2">
          <Field label="Region">
            <SelectInput value={filters.region} onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))}>
              <option value="">Any region</option>
              {ALL_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Minimum rating">
            <SelectInput
              value={String(filters.minRating)}
              onChange={(e) => setFilters((f) => ({ ...f, minRating: Number(e.target.value) }))}
            >
              <option value="0">Any</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
              <option value="4.8">4.8+</option>
            </SelectInput>
          </Field>
          <Field label="Operator size">
            <SelectInput value={filters.tier} onChange={(e) => setFilters((f) => ({ ...f, tier: e.target.value }))}>
              <option value="">Any</option>
              <option value="large">Large</option>
              <option value="medium">Growing</option>
              <option value="small">Boutique</option>
            </SelectInput>
          </Field>
          <div className="space-y-3">
            <ToggleRow
              label="KYC-verified only"
              description="Recommended. Unverified agencies are hidden by default."
              checked={filters.verifiedOnly}
              onChange={(v) => setFilters((f) => ({ ...f, verifiedOnly: v }))}
            />
            <ToggleRow
              label="Safety-certified only"
              checked={filters.safetyCertifiedOnly}
              onChange={(v) => setFilters((f) => ({ ...f, safetyCertifiedOnly: v }))}
            />
          </div>
        </HubCard>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSavedOnly((s) => !s)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            savedOnly
              ? "bg-primary-900 text-white"
              : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
          )}
        >
          <Heart className={cn("h-3.5 w-3.5", savedOnly && "fill-current")} /> Saved ({savedIds.length})
        </button>
      </div>

      {compareItems.length >= 2 && (
        <CompareTable
          items={compareItems}
          onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
          onClear={() => setCompareIds([])}
        />
      )}

      {trekkedWith.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
            Agencies you&apos;ve trekked with
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {trekkedWith.map((r) => (
              <AgencyCard
                key={r.agency.id}
                ranked={r}
                saved={savedIds.includes(r.agency.id)}
                onToggleSave={() => toggleSave(r.agency.id)}
                inCompare={compareIds.includes(r.agency.id)}
                onToggleCompare={() => toggleCompare(r.agency.id)}
                compareDisabled={compareIds.length >= MAX_COMPARE}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
          {trekkedWith.length > 0 ? "Recommended for you" : "Agencies"}
        </h2>
        {recommended.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {recommended.map((r) => (
              <AgencyCard
                key={r.agency.id}
                ranked={r}
                saved={savedIds.includes(r.agency.id)}
                onToggleSave={() => toggleSave(r.agency.id)}
                inCompare={compareIds.includes(r.agency.id)}
                onToggleCompare={() => toggleCompare(r.agency.id)}
                compareDisabled={compareIds.length >= MAX_COMPARE}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Compass className="h-7 w-7" />}
            title="No agencies match those filters"
            description="Try widening the region or lowering the minimum rating."
          />
        )}
      </section>

      {compareIds.length > 0 && compareItems.length < 2 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between text-sm">
            <span className="font-medium text-neutral-600">
              <BarChart3 className="mr-1.5 inline h-4 w-4" />
              {compareIds.length} selected — pick at least 2 to compare
            </span>
            <button
              onClick={() => setCompareIds([])}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-800"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
