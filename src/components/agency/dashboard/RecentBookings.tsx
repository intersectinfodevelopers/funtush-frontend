'use client';

import Link from 'next/link';
import { getAgencyData } from '@/lib/agency/getAgencyData';
import users from '@/../data/users.json';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

type Props = {
  agencyId: string;
};

const tableStyles = 'grid lg:grid-cols-5';
const headerStyles = 'font-[500] text-sm text-[#505055]';
const dataStyles = 'font-[500] text-[10px]';

const statusStyles = {
  confirmed: 'bg-green-100 text-green-700',
  inquiry: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

export default function RecentBookings({ agencyId }: Props) {
  const { bookings, packages } = getAgencyData(agencyId);

  const bookingCreated = bookings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const recentBookingArr = bookingCreated.map((booking) => {
    const usr = users.find((user) => user.id === booking.trekker_id);
    const pkg = packages.find((pkg) => pkg.id === booking.package_id);

    return {
      id: booking.id,
      customer: usr?.name ?? 'Unknown',
      packageName: pkg?.title,
      bookingDate: booking.created_at.split('T')[0],
      amount: booking.total_price,
      status: booking.status,
    };
  });

  return (
    <section className="flex flex-col gap-4 rounded-lg px-3 py-4 bg-white">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Recent Bookings</h3>
        <Link
          href="/dashboard/bookings"
          className="text-xs text-[#0D2DFC] font-semibold transition-transform hover:translate-y-[-1px] hover:underline "
        >
          View All
        </Link>
      </div>
      <div className={`${tableStyles}`}>
        <span className={headerStyles}>Customer</span>
        <span className={headerStyles}>Package</span>
        <span className={headerStyles}>Date</span>
        <span className={headerStyles}>Amount</span>
        <span className={headerStyles}>Status</span>
      </div>
      <hr className="w-full border-2 border-[#F2F2F7]" />
      {recentBookingArr.map((booking) => {
        return (
          <div key={booking.id} className={`${tableStyles}`}>
            <span className={dataStyles}>
              <AccountCircleIcon />
              {booking.customer}
            </span>
            <span className={dataStyles}>{booking.packageName}</span>
            <span className={dataStyles}>{booking.bookingDate}</span>
            <span className={dataStyles}>${booking.amount}</span>
            <span
              className={`justify-self-start self-center rounded-full px-2 py-1 ${dataStyles} ${statusStyles[booking.status as keyof typeof statusStyles]}`}
            >
              {booking.status}
            </span>
          </div>
        );
      })}
    </section>
  );
}
