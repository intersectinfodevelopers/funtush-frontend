'use client';

import { useRouter } from 'next/navigation';

import bookings from '../../../../data/bookings.json';
import packages from '../../../../data/packages.json';
import finance from '../../../../data/finance.json';
import UpcomingDepartures from '@/components/agency/dashboard/UpcomingDepartures';
import RecentBookings from '@/components/agency/dashboard/RecentBookings';
import PendingInquiries from '@/components/agency/dashboard/PendingInquiries';
import ActiveGuides from '@/components/agency/dashboard/ActiveGuides';
/**
 * Agency Dashboard Overview Page
 */

const agencyId = 'ag-001';

const isAgencyData = (agency_id: string) => agency_id === agencyId;

const totalPackages = packages.filter((pkg) => isAgencyData(pkg.agency_id)).length;

const totalBookings = bookings.filter((booking) => isAgencyData(booking.agency_id)).length;

const revenue = finance.income
  .filter((item) => isAgencyData(item.agency_id))
  .reduce((sum, item) => sum + item.amount, 0);

const pendingInquiries = bookings.filter(
  (booking) => isAgencyData(booking.agency_id) && booking.status === 'inquiry'
).length;

export default function AgencyDashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'authToken=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Dashboard Overview</h2>
          <p className="mt-1 text-neutral-600">Welcome to your agency dashboard</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Sign out
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h3 className="text-sm font-medium text-neutral-600">Active Packages</h3>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{totalPackages}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h3 className="text-sm font-medium text-neutral-600">Total Bookings</h3>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{totalBookings}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h3 className="text-sm font-medium text-neutral-600">Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-neutral-900">${revenue}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h3 className="text-sm font-medium text-neutral-600">Pending Actions</h3>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{pendingInquiries}</p>
        </div>
      </div>

      <UpcomingDepartures agencyId={agencyId} />
      <RecentBookings agencyId={agencyId} />
      <PendingInquiries pendingInquiries={pendingInquiries} />
      <ActiveGuides />

      {/* Placeholder Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h3 className="font-semibold text-neutral-900">Recent Bookings</h3>
          <p className="mt-2 text-sm text-neutral-600">No recent bookings</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h3 className="font-semibold text-neutral-900">Quick Actions</h3>
          <div className="mt-4 space-y-2">
            <button className="block w-full rounded-lg bg-primary-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-700">
              Create Package
            </button>
            <button className="block w-full rounded-lg bg-neutral-200 px-4 py-2 text-center text-sm font-medium text-neutral-900 hover:bg-neutral-300">
              View Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
