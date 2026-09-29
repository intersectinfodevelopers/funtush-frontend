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
import { useAgencyAccess } from '@/hooks/useAgencyAccess';

export default function AgencyDashboardPage() {
  const { can: allowed, known } = useAgencyAccess();
  const can = (href: string) => known && allowed(href); // don't fire requests a staff role can't make while we're still finding out who this is
  // Each widget reads data behind one permission; a staff member only sees the widgets their role can load.
  const bookings = can('/dashboard/bookings');
  const finance = can('/dashboard/finance');
  const analytics = can('/dashboard/analytics');
  const guides = can('/dashboard/guides');
  const packages = can('/dashboard/packages');
  const any = bookings || finance || analytics || guides || packages;
  return (
    <div className="space-y-3 text-neutral-900 md:space-y-4">
      <DashboardHeader />
      {known && !any && <p className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-600">Welcome! Your role doesn&apos;t include any dashboard reports — use the menu to open the areas you have access to.</p>}
      {bookings && <ActiveSos />}

      {analytics && finance && <StatCards />}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.55fr_1fr_1fr]">
        {finance && <RevenueOverview />}
        {bookings && <BookingStatus />}
        {bookings && <UpcomingTreks />}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.55fr_1fr_1fr_1fr]">
        {bookings && <RecentBookings />}
        {guides && <ActiveGuides />}
        {packages && <TopDestinations />}
        {bookings && <QuickState />}
      </div>

      {bookings && <RecentActivity />}
    </div>
  );
}