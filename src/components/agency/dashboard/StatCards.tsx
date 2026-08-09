'use client';

import Image from 'next/image';
import { getAgencyData } from '@/lib/agency/getAgencyData';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupIcon from '@mui/icons-material/Group';
import WifiTetheringSharpIcon from '@mui/icons-material/WifiTetheringSharp';

type Props = {
  agencyId: string;
};

export default function StatCards({ agencyId }: Props) {
  const { bookings, income } = getAgencyData(agencyId);

  const totalBookings = bookings.reduce((sum, item) => sum + item.total_price, 0);
  const revenue = income.reduce((sum, item) => sum + item.amount, 0);
  const totalCustomers = bookings.length;

  const stat = [
    {
      label: 'Total Bookings',
      amount: `$${totalBookings}`,
      icon: <CalendarMonthIcon />,
      iconBg: 'bg-[#DAEBFF]',
      iconColor: 'text-[#0088FF]',
      sub: 18.2,
      comparison: 'VS last 30 days',
    },
    {
      label: 'Revenue (This month)',
      amount: `$${revenue}`,
      icon: <AttachMoneyIcon />,
      iconBg: 'bg-[#E8FDE6]',
      iconColor: 'text-[#34C759]',
      sub: 12.2,
      comparison: 'VS last month',
    },
    {
      label: 'Total Customers',
      amount: totalCustomers,
      icon: <GroupIcon />,
      iconBg: 'bg-[#E1E3FB]',
      iconColor: 'text-[#6155F5]',
      sub: 4.8,
      comparison: 'VS last 30 days',
    },
    {
      label: 'Active Treks',
      amount: 1,
      icon: <WifiTetheringSharpIcon />,
      iconBg: 'bg-[#FBFFDC]',
      iconColor: 'text-[#FDA31C]',
      sub: 4.8,
      comparison: 'Live on trails',
    },
  ];

  return (
    <div className="w-full mt-2 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {stat.map((item) => {
        return (
          <div
            key={item.label}
            className="w-full flex item-center justify-between gap-x-4 rounded-lg py-[9px] px-[10px] bg-[#FFFFFF] shadow-sm"
          >
            <div className="flex flex-col gap-y-[3px] whitespace-nowrap">
              <h3 className="text-xs font-semibold">{item.label}</h3>
              <p className="text-sm font-semibold">{item.amount}</p>
              <p className="text-xs font-semibold text-[#34C759]">
                <span>
                  <PlayArrowIcon sx={{ transform: 'rotate(270deg)' }} />
                </span>
                {`${item.sub}%`}
              </p>
              <p className="text-[9.5px] font-medium">{item.comparison}</p>
            </div>
            <div className="flex flex-col">
              <div
                className={`flex h-9 w-9 items-center justify-center self-end rounded-full ${item.iconBg} ${item.iconColor}`}
              >
                {item.icon}
              </div>
              <Image src="/null" alt="graph" width={100} height={70} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
