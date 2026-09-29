'use client';

import Link from 'next/link';
import { Check, Calendar, DollarSign, RefreshCw, AlertTriangle, Flag } from 'lucide-react';
import { useBookingList } from '@/hooks/useAgencyDashboard';
import type { ApiBookingStatus } from '@/lib/api/agency/bookings';

const EVENT: Record<ApiBookingStatus, { title: string; icon: React.ElementType; bg: string; fg: string }> = {
  INQUIRY: { title: 'New booking inquiry', icon: Check, bg: 'bg-green-100', fg: 'text-green-500' },
  CONFIRMED: { title: 'Booking confirmed', icon: Calendar, bg: 'bg-blue-100', fg: 'text-blue-500' },
  PAYMENT_PENDING: { title: 'Awaiting payment', icon: DollarSign, bg: 'bg-amber-100', fg: 'text-amber-500' },
  PAID: { title: 'Payment received', icon: DollarSign, bg: 'bg-green-100', fg: 'text-green-500' },
  ALTERNATIVE_PROPOSED: { title: 'New date proposed', icon: RefreshCw, bg: 'bg-orange-100', fg: 'text-orange-500' },
  ACTIVE: { title: 'Trek started', icon: Flag, bg: 'bg-indigo-100', fg: 'text-indigo-500' },
  COMPLETED: { title: 'Trek completed', icon: Check, bg: 'bg-blue-100', fg: 'text-blue-500' },
  REJECTED: { title: 'Inquiry rejected', icon: AlertTriangle, bg: 'bg-red-100', fg: 'text-red-500' },
  CANCELLED: { title: 'Booking cancelled', icon: AlertTriangle, bg: 'bg-red-100', fg: 'text-red-500' },
};

/** The agency's latest booking events, from real bookings (there is no separate activity feed API). */
export default function RecentActivity() {
  const { data, isLoading } = useBookingList({ limit: 6 });
  const activities = (data?.bookings ?? []).map((b) => ({
    id: b.id,
    time: new Date(b.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
    description: `${b.package?.title ?? 'Trek'} · ${b.trekkerName}`,
    ...EVENT[b.status],
  }));

  return (
    <section className="rounded-lg bg-white p-3 shadow-sm md:p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold sm:text-base">Recent Activity</h2>
        <Link href="/dashboard/bookings" className="text-[11px] font-medium text-violet-600 hover:text-violet-800 sm:text-xs">
          View all bookings
        </Link>
      </div>

      {isLoading && <div className="h-16 animate-pulse rounded-md bg-neutral-100" />}
      {!isLoading && activities.length === 0 && <p className="py-4 text-center text-xs text-neutral-500">Nothing has happened yet — activity appears here as bookings come in.</p>}

      <div className="flex items-start gap-6 overflow-x-auto pb-2">
        {activities.map((activity, i) => (
          <div key={activity.id} className="flex shrink-0 items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activity.bg} ${activity.fg}`}>
              <activity.icon size={18} />
            </div>
            <div className="min-w-[120px] text-[11px] font-medium sm:text-xs">
              <p className="mb-1 text-neutral-500">{activity.time}</p>
              <p className="whitespace-nowrap text-neutral-900">{activity.title}</p>
              <p className="mt-1 max-w-[180px] truncate text-neutral-500" title={activity.description}>{activity.description}</p>
            </div>
            {i < activities.length - 1 && <div className="mt-5 h-px w-8 shrink-0 bg-neutral-300" />}
          </div>
        ))}
      </div>
    </section>
  );
}
