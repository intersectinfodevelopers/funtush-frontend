"use client";

/**
 * One trek on the My Treks list. Tokenised, one status vocabulary (StatusPill),
 * a payment-due hint for unpaid bookings, and a live indicator for active treks.
 */

import Link from "next/link";
import { Calendar, Users, Clock, Wallet, MapPin, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { StatusPill } from "@/components/trekker/trekker-kit";
import type { TrekViewModel } from "@/types/trek";

const CATEGORY_ACCENT: Record<string, string> = {
  active: "border-l-primary-500",
  upcoming: "border-l-accent-400",
  completed: "border-l-neutral-300",
  cancelled: "border-l-danger-400",
};

function formatDateRange(startStr: string, endStr: string): string {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const s = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const e = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${s} – ${e}`;
}

export function TrekCard({ trek }: { trek: TrekViewModel }) {
  const accent = CATEGORY_ACCENT[trek.category] ?? CATEGORY_ACCENT.upcoming;
  const pillStatus = trek.category === "active" ? "active" : trek.status;
  const unpaid = trek.status === "pending" && !trek.paymentReceivedAt;

  return (
    <Link
      href={`/my-treks/${trek.bookingId}`}
      className={cn(
        "group block rounded-2xl border border-neutral-200 border-l-4 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        accent,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-neutral-900">{trek.packageName}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-500">
            <MapPin className="h-3.5 w-3.5" />
            {trek.agencyName} · {trek.destination}
          </p>
        </div>
        <StatusPill status={pillStatus} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600">
        {trek.category === "active" ? (
          <span className="flex items-center gap-1.5 font-medium text-primary-700">
            <Calendar className="h-4 w-4" />
            Day {Math.min(trek.currentDay, trek.durationDays)} of {trek.durationDays}
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDateRange(trek.departureDate, trek.endDate)}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {trek.durationDays} days
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {trek.groupSize} {trek.groupSize === 1 ? "person" : "people"}
        </span>
        {trek.guideName && trek.guideId && (
          <span className="flex items-center gap-1.5">
            Guide: <span className="font-medium text-neutral-900">{trek.guideName}</span>
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
        {unpaid ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-50 px-3 py-1 text-xs font-semibold text-warning-700">
            <Wallet className="h-3.5 w-3.5" />
            {trek.totalPrice > 0 ? `$${trek.totalPrice.toLocaleString()} due` : "Payment due"}
          </span>
        ) : trek.category === "active" ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
            </span>
            Live tracking on
          </span>
        ) : trek.category === "upcoming" && trek.daysUntilDeparture >= 0 ? (
          <span className="text-xs font-medium text-neutral-500">
            {trek.daysUntilDeparture === 0
              ? "Departing today"
              : `Departs in ${trek.daysUntilDeparture} days`}
          </span>
        ) : (
          <span className="text-xs font-medium text-neutral-400">
            {trek.totalPrice > 0 ? `$${trek.totalPrice.toLocaleString()}` : ""}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-neutral-300 transition group-hover:text-primary-600" />
      </div>
    </Link>
  );
}
