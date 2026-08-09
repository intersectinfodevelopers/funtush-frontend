'use client';

import { getAgencyData } from '@/lib/agency/getAgencyData';
import users from '@/../data/users.json';
import Link from 'next/link';

type Props = {
  agencyId: string;
};

export default function PendingInquiries({ agencyId }: Props) {
  const { bookings } = getAgencyData(agencyId);
  const inquiries = bookings.filter((booking) => booking.status === 'inquiry');
  const pendingInquiries = inquiries.length;
  const displayInquiries = inquiries.map((inquiry) => {
    const usr = users.find((user) => user.id === inquiry.trekker_id)?.name;
    return {
      id: inquiry.trekker_id,
      name: usr,
      groupSize: inquiry.group_size,
    };
  });

  return (
    <section
      className={`flex flex-col gap-4 rounded-lg border border-neutral-200 p-6 ${pendingInquiries > 0 ? 'bg-amber-100' : 'bg-white'}`}
    >
      <div className="flex justify-between border-b border-neutral-200">
        <h3 className="font-semibold text-neutral-900">
          Pending Inquiries <span>{pendingInquiries}</span>
        </h3>
        {pendingInquiries === 0 ? (
          <p>No pending inquiries</p>
        ) : (
          <Link className="transition-transform hover:translate-x-0.5" href="/dashboard/bookings">
            View all
          </Link>
        )}
      </div>
      <div>
        {displayInquiries.slice(0, 5).map((inquiry) => {
          return (
            <Link
              key={inquiry.id}
              href={`/dashboard/bookings/${inquiry.id}`}
              className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 hover:bg-neutral-50"
            >
              <div>
                <p className="text-sm font-semibold text-neutral-900">{inquiry.name ?? inquiry.id}</p>
                <p className="text-xs text-neutral-500">
                  {inquiry.id} · {inquiry.groupSize} pax
                </p>
              </div>
              <span className="rounded-full bg-warning-50 px-2 py-1 text-[10px] font-semibold text-warning-700">
                Pending
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
