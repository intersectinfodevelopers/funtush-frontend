'use client';

import bookings from '../../../../data/bookings.json';
import users from '../../../../data/users.json';
import packages from '../../../../data/packages.json';

type Props = {
  agencyId: string;
};

const statusStyles = {
  confirmed: 'bg-green-100 text-green-700',
  inquiry: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

export default function RecentBookings({ agencyId }: Props) {
  const bookingCreated = bookings
    .filter((booking) => booking.agency_id === agencyId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const recentBookingArr = bookingCreated.map((booking) => {
    const usr = users.find((user) => user.id === booking.trekker_id);
    const pkg = packages.find((pkg) => pkg.id === booking.package_id);

    return {
      id: booking.id,
      trekkerName: usr?.name,
      packageName: pkg?.title,
      status: booking.status,
      amount: booking.total_price,
    };
  });

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6">
      <h3 className="font-semibold text-neutral-900">Recent Bookings</h3>
      {recentBookingArr.map((booking) => {
        return (
          <div key={booking.id} className="flex items-center justify-between py-3">
            <span>{booking.trekkerName}</span>
            <span>{booking.packageName}</span>
            <span
              className={`rounded-full px-2 py-1 text-sm ${statusStyles[booking.status as keyof typeof statusStyles]}`}
            >
              {booking.status}
            </span>
            <span>${booking.amount}</span>
          </div>
        );
      })}
    </div>
  );
}
