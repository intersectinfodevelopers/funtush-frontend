'use client';

import Link from 'next/link';
import { useBookingList } from '@/hooks/useAgencyDashboard';
import { bucketOf } from '@/lib/api/agency/bookings';

const statusStyles: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
};

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

/** Departures with at least one live booking, soonest first — built from real bookings. */
export default function UpcomingTreks() {
  const { data, isLoading } = useBookingList({ limit: 100 });

  const today = new Date().setHours(0, 0, 0, 0);
  const departures = new Map<string, { id: string; title: string; start: string; travellers: number; bookings: number; confirmed: boolean }>();
  for (const b of data?.bookings ?? []) {
    const bucket = bucketOf(b.status);
    const start = b.departureDate?.startDate;
    if (!start || bucket === 'cancelled' || bucket === 'completed' || new Date(start).getTime() < today) continue;
    const d = departures.get(b.departureDateId) ?? { id: b.departureDateId, title: b.package?.title ?? 'Trek', start, travellers: 0, bookings: 0, confirmed: false };
    d.travellers += b.groupSize;
    d.bookings += 1;
    d.confirmed ||= bucket === 'confirmed';
    departures.set(b.departureDateId, d);
  }
  const upcoming = [...departures.values()].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()).slice(0, 4);

  return (
    <section className="flex flex-col gap-3 rounded-lg bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold sm:text-sm">Upcoming Treks</h2>
        <Link href="/dashboard/packages" className="text-[11px] font-semibold text-blue-600 hover:underline">View All</Link>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading && <div className="h-14 animate-pulse rounded-md bg-neutral-100" />}
        {!isLoading && upcoming.length === 0 && <p className="py-4 text-center text-xs text-neutral-500">No upcoming departures with bookings yet.</p>}
        {upcoming.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="min-w-0 flex-1 space-y-0.5">
              <h3 className="truncate text-xs font-semibold sm:text-sm">{item.title}</h3>
              <p className="text-[10px] text-neutral-500 sm:text-xs">Departs {fmt(item.start)}</p>
              <p className="text-[10px] text-neutral-500 sm:text-xs">{item.travellers} travellers · {item.bookings} booking{item.bookings === 1 ? '' : 's'}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold sm:text-xs ${statusStyles[item.confirmed ? 'confirmed' : 'pending']}`}>
              {item.confirmed ? 'confirmed' : 'pending'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
