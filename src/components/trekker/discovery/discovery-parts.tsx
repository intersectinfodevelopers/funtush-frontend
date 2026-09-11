"use client";

/**
 * Discovery building blocks — the ranked agency card and the side-by-side
 * compare table. Kept out of the page so it stays readable.
 */

import Link from "next/link";
import {
  Star,
  ShieldCheck,
  BadgeCheck,
  Heart,
  MapPin,
  Wallet,
  CheckSquare,
  Square,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { HubCard } from "@/components/trekker/trekker-kit";
import type { RankedAgency } from "@/lib/mock/agency-ranking";

const TIER_LABEL: Record<string, string> = { large: "Large operator", medium: "Growing operator", small: "Boutique operator" };

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-900">
      <Star className="h-4 w-4 fill-warning-400 text-warning-400" />
      {rating.toFixed(1)}
    </span>
  );
}

export function AgencyCard({
  ranked,
  saved,
  onToggleSave,
  inCompare,
  onToggleCompare,
  compareDisabled,
}: {
  ranked: RankedAgency;
  saved: boolean;
  onToggleSave: () => void;
  inCompare: boolean;
  onToggleCompare: () => void;
  compareDisabled: boolean;
}) {
  const { agency, reasons, history, priceRange, destinationNames } = ranked;

  return (
    <HubCard className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/discovery/${agency.slug}`}
              className="truncate text-base font-bold text-neutral-900 hover:text-primary-700"
            >
              {agency.name}
            </Link>
            {agency.kyc_verified && (
              <span title="KYC verified" className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-bold uppercase text-success-700">
                <BadgeCheck className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-neutral-500">
            {TIER_LABEL[agency.tier] ?? agency.tier} · since {agency.established_year ?? "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleSave}
          aria-label={saved ? "Remove from saved" : "Save agency"}
          className={cn(
            "shrink-0 rounded-lg p-1.5 transition",
            saved ? "text-danger-500" : "text-neutral-300 hover:text-neutral-500",
          )}
        >
          <Heart className={cn("h-5 w-5", saved && "fill-current")} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600">
        <Stars rating={agency.rating} />
        <span className="text-neutral-400">·</span>
        <span>{agency.review_count ?? 0} reviews</span>
        {agency.safety_certified && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Safety certified
          </span>
        )}
      </div>

      <p className="line-clamp-2 text-sm text-neutral-600">{agency.description}</p>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {destinationNames.slice(0, 3).join(", ")}
        </span>
        {priceRange && (
          <span className="inline-flex items-center gap-1">
            <Wallet className="h-3.5 w-3.5" />${priceRange.min.toLocaleString()}–${priceRange.max.toLocaleString()}
          </span>
        )}
      </div>

      {history && (
        <div className="rounded-xl bg-primary-50/60 px-3 py-2 text-xs text-primary-800">
          {history.completedCount > 0
            ? `You've completed ${history.completedCount} trek${history.completedCount === 1 ? "" : "s"} with them`
            : "You've booked with them before"}
          {history.lastTrek && (
            <> — last: {history.lastTrek.packageName} ({new Date(history.lastTrek.date).getFullYear()})</>
          )}
        </div>
      )}

      {reasons.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {reasons.map((r) => (
            <span key={r} className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
              {r}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-3">
        <button
          type="button"
          onClick={onToggleCompare}
          disabled={!inCompare && compareDisabled}
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-semibold transition",
            inCompare ? "text-primary-700" : "text-neutral-500 hover:text-neutral-800",
            !inCompare && compareDisabled && "cursor-not-allowed opacity-40",
          )}
        >
          {inCompare ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
          Compare
        </button>
        <div className="flex gap-2">
          <Link
            href={`/discovery/${agency.slug}`}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            View
          </Link>
          {history && history.completedCount > 0 && (
            <a
              href="https://funtush.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-primary-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-800"
            >
              Book again
            </a>
          )}
        </div>
      </div>
    </HubCard>
  );
}

/* ── Compare table ──────────────────────────────────────────────────────── */

export function CompareTable({
  items,
  onRemove,
  onClear,
}: {
  items: RankedAgency[];
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const rows: Array<{ label: string; render: (r: RankedAgency) => React.ReactNode }> = [
    { label: "Rating", render: (r) => <Stars rating={r.agency.rating} /> },
    { label: "Reviews", render: (r) => r.agency.review_count ?? 0 },
    { label: "Tier", render: (r) => TIER_LABEL[r.agency.tier] ?? r.agency.tier },
    {
      label: "KYC verified",
      render: (r) => (r.agency.kyc_verified ? <BadgeCheck className="h-4 w-4 text-success-600" /> : "—"),
    },
    {
      label: "Safety certified",
      render: (r) => (r.agency.safety_certified ? <ShieldCheck className="h-4 w-4 text-success-600" /> : "—"),
    },
    { label: "Operating since", render: (r) => r.agency.established_year ?? "—" },
    {
      label: "Price range",
      render: (r) =>
        r.priceRange ? `$${r.priceRange.min.toLocaleString()}–$${r.priceRange.max.toLocaleString()}` : "—",
    },
    { label: "Regions", render: (r) => r.destinationNames.slice(0, 4).join(", ") || "—" },
    {
      label: "Your history",
      render: (r) =>
        r.history
          ? r.history.completedCount > 0
            ? `${r.history.completedCount} completed`
            : `${r.history.bookingCount} booking${r.history.bookingCount === 1 ? "" : "s"}`
          : "None",
    },
  ];

  return (
    <HubCard className="overflow-x-auto p-0">
      <div className="flex items-center justify-between border-b border-neutral-200 p-4">
        <h2 className="text-base font-bold text-neutral-900">Compare {items.length} agencies</h2>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Clear
        </button>
      </div>
      <table className="w-full min-w-[32rem] text-sm">
        <thead>
          <tr>
            <th className="w-32 p-3" />
            {items.map((r) => (
              <th key={r.agency.id} className="p-3 text-left align-top">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/discovery/${r.agency.slug}`}
                    className="font-bold text-neutral-900 hover:text-primary-700"
                  >
                    {r.agency.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => onRemove(r.agency.id)}
                    aria-label={`Remove ${r.agency.name}`}
                    className="text-neutral-300 hover:text-neutral-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="p-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                {row.label}
              </td>
              {items.map((r) => (
                <td key={r.agency.id} className="p-3 text-neutral-800">
                  {row.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </HubCard>
  );
}
