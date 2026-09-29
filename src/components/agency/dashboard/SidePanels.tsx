'use client';

import Link from 'next/link';
import { BatteryFull, Plus, Users, Map as MapIcon, Briefcase, User } from 'lucide-react';
import { useBookingList, useDashboardSummary, useGuidesOnTrek } from '@/hooks/useAgencyDashboard';

const getInitials = (name: string) => {
  const [first, last] = name.toUpperCase().split(' ');
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`;
};

export function ActiveGuides() {
  const { data, isLoading } = useGuidesOnTrek();
  const guides = data?.guides ?? [];

  return (
    <section className="flex flex-col gap-3 rounded-lg bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold sm:text-sm">Active Guides on Trek</h2>
        <Link href="/dashboard/guides" className="text-[11px] font-semibold text-blue-600 hover:underline">View All</Link>
      </div>
      <div className="flex flex-col gap-3">
        {isLoading && <div className="h-10 animate-pulse rounded-md bg-neutral-100" />}
        {!isLoading && guides.length === 0 && <p className="py-3 text-center text-xs text-neutral-500">No guides are on a trek right now.</p>}
        {guides.map((guide) => (
          <div key={guide.id} className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[10px] font-semibold text-white">
                {getInitials(guide.name)}
              </div>
              <div className="min-w-0 text-xs">
                <p className="truncate font-medium">{guide.name}</p>
                <p className="text-neutral-500">{guide.rating != null ? `Rating ${Number(guide.rating).toFixed(1)} · ` : ''}On trek</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> ON TREK
              </span>
              <BatteryFull size={16} className="text-green-600" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Where travellers are going: booked travellers per trek, from real bookings. */
export function TopDestinations() {
  const { data, isLoading } = useBookingList({ limit: 100 });

  const totals = new Map<string, number>();
  for (const b of data?.bookings ?? []) {
    if (b.status === 'CANCELLED' || b.status === 'REJECTED') continue;
    const name = b.package?.title ?? 'Unknown trek';
    totals.set(name, (totals.get(name) ?? 0) + b.groupSize);
  }
  const rows = [...totals].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  const max = Math.max(...rows.map((d) => d.value), 1);

  return (
    <section className="flex flex-col gap-3 rounded-lg bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold sm:text-sm">Top Treks</h2>
        <span className="text-[10px] text-neutral-500">Travellers booked</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {isLoading && <div className="h-10 animate-pulse rounded-md bg-neutral-100" />}
        {!isLoading && rows.length === 0 && <p className="py-3 text-center text-xs text-neutral-500">No bookings yet.</p>}
        {rows.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="w-20 shrink-0 truncate text-[11px] font-medium sm:w-24" title={d.name}>{d.name}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-purple-200">
              <div className="h-full rounded-full bg-purple-500" style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
            <span className="w-7 shrink-0 text-right text-[11px] font-medium">{d.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Real counts only (the mock listed unread messages, reviews and staff on leave that no backend tracks here). */
export function QuickState() {
  const { data } = useDashboardSummary();
  const s = data?.stats;
  const rows = [
    { label: 'Pending Inquiries', value: s?.pendingInquiries, icon: Plus },
    { label: 'Packages', value: s?.packages, icon: MapIcon },
    { label: 'Active Guides', value: s?.guides, icon: Briefcase },
    { label: 'Staff Members', value: s?.staff, icon: User },
    { label: 'Total Bookings', value: s?.totalBookings, icon: Users },
  ];

  return (
    <section className="flex flex-col gap-3 rounded-lg bg-white p-3 shadow-sm">
      <h2 className="text-xs font-semibold sm:text-sm">Quick Stats</h2>
      <div className="flex flex-col gap-2.5">
        {rows.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-2.5">
            <Icon size={16} className="shrink-0 text-neutral-400" />
            <span className="flex-1 text-[11px] font-semibold sm:text-xs">{label}</span>
            <span className="text-[11px] font-semibold sm:text-xs">{value ?? '—'}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
