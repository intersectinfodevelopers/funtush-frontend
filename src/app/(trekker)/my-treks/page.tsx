"use client";

/**
 * My Treks — every booking the trekker has, across every agency, in four tabs.
 */

import { useMemo, useState } from "react";
import { Compass, Map as MapIcon } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";
import { getUserTreks } from "@/lib/treks";
import { HubHeader, EmptyState } from "@/components/trekker/trekker-kit";
import { TrekCard } from "@/components/trekker/treks/trek-card";
import type { TrekTabCategory, RawBooking, RawPackage, RawAgency, RawGuide } from "@/types/trek";

import bookingsData from "../../../../data/bookings.json";
import packagesData from "../../../../data/packages.json";
import agenciesData from "../../../../data/agencies.json";
import guidesData from "../../../../data/guides.json";

const bookings = bookingsData as RawBooking[];
const packages = packagesData as unknown as RawPackage[];
const agencies = agenciesData as RawAgency[];
const guides = guidesData as RawGuide[];

const TABS: Array<{ key: TrekTabCategory; label: string }> = [
  { key: "upcoming", label: "Upcoming" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const EMPTY_COPY: Record<TrekTabCategory, string> = {
  upcoming: "No upcoming treks booked.",
  active: "You're not on a trek right now.",
  completed: "No completed treks yet.",
  cancelled: "Nothing cancelled — good.",
};

export default function MyTreksPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TrekTabCategory>("upcoming");

  const userTreks = useMemo(
    () => (user ? getUserTreks(user.id, bookings, packages, agencies, guides) : []),
    [user],
  );

  const counts = useMemo(() => {
    const result: Record<TrekTabCategory, number> = {
      upcoming: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
    };
    userTreks.forEach((t) => (result[t.category] += 1));
    return result;
  }, [userTreks]);

  // Land on whichever tab has something, preferring an active trek.
  const initialised = useMemo(() => {
    if (counts.active > 0) return "active" as const;
    if (counts.upcoming > 0) return "upcoming" as const;
    return null;
  }, [counts]);
  const [pinned, setPinned] = useState(false);
  const shownTab = pinned || !initialised ? activeTab : initialised;

  const filtered = userTreks.filter((t) => t.category === shownTab);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <HubHeader
        title="My Treks"
        description="Every trek you've booked, across every agency, in one place."
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = shownTab === tab.key;
          const count = counts[tab.key];
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setPinned(true);
              }}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-900 text-white shadow-sm"
                  : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
              )}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                    isActive ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((trek) => <TrekCard key={trek.bookingId} trek={trek} />)
        ) : (
          <EmptyState
            icon={shownTab === "cancelled" ? <MapIcon className="h-7 w-7" /> : <Compass className="h-7 w-7" />}
            title={EMPTY_COPY[shownTab]}
            description={
              <>
                Discover new packages at{" "}
                <a
                  href="https://funtush.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-600 hover:underline"
                >
                  funtush.com
                </a>
              </>
            }
          />
        )}
      </div>
    </div>
  );
}
