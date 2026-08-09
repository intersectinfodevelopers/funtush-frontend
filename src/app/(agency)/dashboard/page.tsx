'use client';

import Link from 'next/link';
import { Plus, ShieldAlert } from 'lucide-react';

import users from '@/../data/users.json';

import ActiveGuides from '@/components/agency/dashboard/ActiveGuides';
import BookingStatus from '@/components/agency/dashboard/BookingStatus';
import QuickState from '@/components/agency/dashboard/QuickState';
import RecentActivity from '@/components/agency/dashboard/RecentActivity';
import RecentBookings from '@/components/agency/dashboard/RecentBookings';
import RevenueOverview from '@/components/agency/dashboard/RevenueOverview';
import StatCards from '@/components/agency/dashboard/StatCards';
import TopDestinations from '@/components/agency/dashboard/TopDestinations';
import UpcomingTreks from '@/components/agency/dashboard/UpcomingTreks';

const agencyId = 'ag-001';

export default function AgencyDashboardPage() {
  const activeSos = ''; // Placeholder for active SOS check
  const user = users[0].name.split(' ')[0];
  return (
    <div className="w-full space-y-4 gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span className="font-semibold text-neutral-900">Dashboard</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Good Morning, {user}</h1>
          <p className="mt-1 text-sm text-neutral-600">Here’s What’s happening with your agency today.</p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/dashboard/packages/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary-900 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-800"
          >
            <Plus className="h-4 w-4" /> New package
          </Link>
        </div>
      </div>

      {activeSos && (
        <div className="rounded-2xl border border-danger-300 bg-danger-50 px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger-600 text-white">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-danger-900">Active safety attention required</p>
                <p className="text-xs text-danger-700">
                  An active trek is currently in progress. Review the safety dashboard for live status.
                </p>
              </div>
            </div>
            <Link href="/dashboard/safety" className="text-xs font-semibold text-danger-800 hover:underline">
              View safety →
            </Link>
          </div>
        </div>
      )}

      <div>
        <StatCards agencyId={agencyId} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1.55fr_1fr_1fr]">
        <RevenueOverview agencyId={agencyId} />
        <BookingStatus agencyId={agencyId} />
        <UpcomingTreks agencyId={agencyId} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1.55fr_1fr_1fr_1fr]">
        <RecentBookings agencyId={agencyId} />
        <ActiveGuides />
        <TopDestinations /> {/* Placeholder */}
        <QuickState /> {/* Placeholder */}
      </div>
      <div>
        <RecentActivity /> {/* Placeholder */}
      </div>
    </div>
  );
}
