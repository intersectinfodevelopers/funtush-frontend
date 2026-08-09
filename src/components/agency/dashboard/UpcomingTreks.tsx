'use client';

import { getAgencyData } from '@/lib/agency/getAgencyData';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  agencyId: string;
};

export default function UpcomingTreks({ agencyId }: Props) {
  const { bookings, packages } = getAgencyData(agencyId);

  const departure = [...bookings].sort(
    (a, b) => new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime()
  );

  const upcomingDepartureArr = departure
    .map((booking) => {
      const pkg = packages.find((pkg) => pkg.id === booking.package_id);
      const bookedSeats = (pkg?.group_size_max ?? 0) - (pkg?.available_slots ?? 0);

      const startDate = new Date(booking?.departure_date || '');
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (pkg?.duration_days ?? 0));

      const formatDate = (date: Date, includeYear = false) =>
        date.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          ...(includeYear && { year: 'numeric' }),
        });

      return {
        id: booking.id,
        packageName: pkg?.title,
        duration: `${formatDate(startDate)} - ${formatDate(endDate, true)}`,
        currentSeats: `${bookedSeats}/${pkg?.group_size_max}`,
        status: pkg?.status,
      };
    })
    .slice(0, 4);

  return (
    <section className="flex flex-col gap-[10px] pt-[16px] px-[6px] pb-[10px] rounded-sm bg-white">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm leading-xl">Upcoming Treks</h3>
        <Link
          href="/dashboard/packages"
          className="text-xs text-[#0D2DFC] font-semibold hover:translate-y-[-1px] hover:underline"
        >
          View All
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {upcomingDepartureArr.map((item) => {
          return (
            <div key={item.id} className="flex justify-between items-center pr-4">
              <div className="flex gap-3">
                <Image src="/null" alt="no image" width={82} height={57}></Image>
                <div className="font-semibold leading-[17px]">
                  <h4 className="text-xs">{item.packageName}</h4>
                  <p className="text-[10px]">{item.duration}</p>
                  <p className="text-[10px]">{`${item.currentSeats} Seats`}</p>
                </div>
              </div>
              <p className="w-fit rounded-full px-2 py-1 text-sm bg-[#DCF4E9] font-semibold text-[11px] text-[#057247]">
                {item.status}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
