'use client';

import ActiveSos from '@/components/agency/dashboard/ActiveSos';
import DashboardHeader from '@/components/agency/dashboard/DashboardHeader';
import StatCards from '@/components/agency/dashboard/StatCards';
import RevenueOverview from '@/components/agency/dashboard/RevenueOverview';
import BookingStatus from '@/components/agency/dashboard/BookingStatus';
import UpcomingTreks from '@/components/agency/dashboard/UpcomingTreks';
import RecentBookings from '@/components/agency/dashboard/RecentBookings';
import { ActiveGuides, TopDestinations, QuickState } from '@/components/agency/dashboard/SidePanels';
import RecentActivity from '@/components/agency/dashboard/RecentActivity';

const agencyId = 'ag-001';

export default function AgencyDashboardPage() {
  return (
    <div className="space-y-3 text-neutral-900 md:space-y-4">
      <DashboardHeader />
      <ActiveSos />

      <StatCards agencyId={agencyId} />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.55fr_1fr_1fr]">
        <RevenueOverview agencyId={agencyId} />
        <BookingStatus agencyId={agencyId} />
        <UpcomingTreks agencyId={agencyId} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.55fr_1fr_1fr_1fr]">
        <RecentBookings agencyId={agencyId} />
        <ActiveGuides />
        <TopDestinations />
        <QuickState />
      </div>

      <RecentActivity />
    </div>
  );
}