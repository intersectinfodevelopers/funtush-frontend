'use client';

import Link from 'next/link';
import { getAgencyData } from '@/lib/agency/getAgencyData';
import { UserCircle } from 'lucide-react';
import users from '@/../data/users.json';

type Props = { agencyId: string };

const statusStyles: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  inquiry: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

export default function RecentBookings({ agencyId }: Props) {
  const { bookings, packages } = getAgencyData(agencyId);

  const recent = bookings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4)
    .map((booking) => ({
      id: booking.id,
      customer: users.find((u) => u.id === booking.trekker_id)?.name ?? 'Unknown',
      packageName: packages.find((p) => p.id === booking.package_id)?.title,
      date: booking.created_at.split('T')[0],
      amount: booking.total_price,
      status: booking.status,
    }));

  return (
    <section className="flex flex-col gap-2 rounded-lg bg-white p-3 shadow-sm xl:col-span-1">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold sm:text-sm">Recent Bookings</h2>
        <Link href="/dashboard/bookings" className="text-[11px] font-semibold text-blue-600 hover:underline">
          View All
        </Link>
      </div>

      {/* Table - desktop */}
      <div className="hidden md:block">
        <div className="grid grid-cols-5 gap-2 border-b border-neutral-100 pb-1 text-xs font-medium text-neutral-500">
          <span>Customer</span><span>Package</span><span>Date</span><span>Amount</span><span>Status</span>
        </div>
        <div className="mt-1 flex flex-col gap-2">
          {recent.map((b) => (
            <div key={b.id} className="grid grid-cols-5 items-center gap-2 text-xs">
              <span className="flex items-center gap-1 truncate">
                <UserCircle size={16} className="shrink-0 text-neutral-400" /> {b.customer}
              </span>
              <span className="truncate">{b.packageName}</span>
              <span>{b.date}</span>
              <span>Rs {b.amount.toLocaleString()}</span>
              <span className={`w-fit rounded-full px-2 py-1 text-[10px] ${statusStyles[b.status] ?? 'bg-neutral-100 text-neutral-600'}`}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cards - mobile */}
      <div className="flex flex-col gap-2 md:hidden">
        {recent.map((b) => (
          <div key={b.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-2.5">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-xs font-semibold">
                <UserCircle size={16} className="text-neutral-400" /> {b.customer}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyles[b.status] ?? 'bg-neutral-100 text-neutral-600'}`}>
                {b.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-neutral-600">
              <span>Package</span><span className="text-right font-medium text-neutral-800">{b.packageName}</span>
              <span>Date</span><span className="text-right font-medium text-neutral-800">{b.date}</span>
              <span>Amount</span><span className="text-right font-medium text-neutral-800">Rs {b.amount.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}