'use client';

import Link from 'next/link';

type Props = {
  pendingInquiries: number;
};

export default function PendingInquiries({ pendingInquiries }: Props) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-lg border border-neutral-200 p-6 ${pendingInquiries > 0 ? 'bg-amber-100' : 'bg-white'}`}
    >
      <h3 className="font-semibold text-neutral-900">Pending Inquiries</h3>
      <p>{pendingInquiries}</p>
      {pendingInquiries === 0 ? (
        <p>No pending inquiries</p>
      ) : (
        <Link className="transition-transform hover:translate-x-0.5" href="/dashboard/bookings">
          View Bookings →
        </Link>
      )}
    </div>
  );
}
