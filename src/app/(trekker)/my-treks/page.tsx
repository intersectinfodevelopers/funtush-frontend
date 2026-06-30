/**
 * Trekker My Treks Page
 * Upcoming and past treks
 */


'use client';

import { useState, useMemo } from 'react';
import { Compass } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils/cn';
import { getUserTreks } from '@/lib/treks';
import { TrekCard } from '@/components/trekker/treks/trek-card';
import type { TrekTabCategory, RawBooking, RawPackage, RawAgency, RawGuide } from '@/types/trek';

// Import JSON data
import bookingsData from '../../../../data/bookings.json';
import packagesData from '../../../../data/packages.json';
import agenciesData from '../../../../data/agencies.json';
import guidesData from '../../../../data/guides.json';

// Cast JSON
const bookings = bookingsData as RawBooking[];
const packages = packagesData as unknown as RawPackage[];
const agencies = agenciesData as RawAgency[];
const guides = guidesData as RawGuide[];

// ─── Tab Config ─────────────────────────────────────────────

const TABS: Array<{ key: TrekTabCategory; label: string }> = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

// ─── Empty State Messages ───────────────────────────────────

const EMPTY_MESSAGES: Record<TrekTabCategory, string> = {
  upcoming: 'No upcoming treks',
  active: 'No active treks',
  completed: 'No completed treks',
  cancelled: 'No cancelled treks',
};

// ─── Component ──────────────────────────────────────────────

export default function MyTreksPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TrekTabCategory>('upcoming');

  // Get all treks for current user
  const userTreks = useMemo(() => {
    if (!user) return [];
    return getUserTreks(user.id, bookings, packages, agencies, guides);
  }, [user]);

  // Filter by selected tab
  const filteredTreks = useMemo(
    () => userTreks.filter((t) => t.category === activeTab),
    [userTreks, activeTab]
  );

  // Count per tab (for badges)
  const counts = useMemo(() => {
    const result: Record<TrekTabCategory, number> = {
      upcoming: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
    };
    userTreks.forEach((t) => result[t.category]++);
    return result;
  }, [userTreks]);

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My Treks</h1>
        <p className="mt-1 text-sm text-neutral-600">
          View your upcoming and past trekking adventures
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-neutral-200">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = counts[tab.key];

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              )}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-semibold',
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-neutral-100 text-neutral-600'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Trek Cards List ── */}
      <div className="space-y-4">
        {filteredTreks.length > 0 ? (
          filteredTreks.map((trek) => (
            <TrekCard key={trek.bookingId} trek={trek} />
          ))
        ) : (
          /* Empty State */
          <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <Compass className="h-6 w-6 text-neutral-400" />
            </div>
            <p className="mt-4 text-sm font-medium text-neutral-700">
              {EMPTY_MESSAGES[activeTab]}
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Discover packages at{' '}
              <a
                href="https://funtush.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                funtush.com
              </a>
            </p>
          </div>
        )}
      </div>

    </div>
  );
}