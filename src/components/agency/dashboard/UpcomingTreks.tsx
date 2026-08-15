'use client';

import { getAgencyData } from '@/lib/agency/getAgencyData';
import Image from 'next/image';
import Link from 'next/link';

type Props = { agencyId: string };

const statusStyles: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  published: 'bg-red-100 text-red-700',
  available: 'bg-blue-100 text-blue-700',
};

export default function UpcomingTreks({ agencyId }: Props) {
  const { bookings, packages } = getAgencyData(agencyId);

  const upcoming = [...bookings]
    .sort((a, b) => new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime())
    .map((booking) => {
      const pkg = packages.find((p) => p.id === booking.package_id);
      const bookedSeats = (pkg?.group_size_max ?? 0) - (pkg?.available_slots ?? 0);
      const start = new Date(booking.departure_date || '');
      const end = new Date(start);
      end.setDate(end.getDate() + (pkg?.duration_days ?? 0));
      const fmt = (d: Date, year = false) =>
        d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', ...(year && { year: 'numeric' }) });

      return {
        id: booking.id,
        packageName: pkg?.title,
        duration: `${fmt(start)} - ${fmt(end, true)}`,
        seats: `${bookedSeats}/${pkg?.group_size_max}`,
        status: pkg?.status ?? 'available',
        image: pkg?.image,
      };
    })
    .slice(0, 4);

  return (
    <section className="flex flex-col gap-3 rounded-lg bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold sm:text-sm">Upcoming Treks</h2>
        <Link href="/dashboard/packages" className="text-[11px] font-semibold text-blue-600 hover:underline">
          View All
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {upcoming.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Image
              src={item.image || '/assets/placeholder.jpg'}
              alt={item.packageName ?? 'Trek'}
              width={72}
              height={52}
              className="h-[52px] w-[72px] shrink-0 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1 space-y-0.5">
              <h3 className="truncate text-xs font-semibold sm:text-sm">{item.packageName}</h3>
              <p className="text-[10px] text-neutral-500 sm:text-xs">{item.duration}</p>
              <p className="text-[10px] text-neutral-500 sm:text-xs">{item.seats} Seats</p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold sm:text-xs ${statusStyles[item.status]}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}