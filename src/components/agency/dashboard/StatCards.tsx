'use client';

import { getAgencyData } from '@/lib/agency/getAgencyData';
import ChartWave from './ChartWave';
import { Calendar, DollarSign, Users, Radio, TrendingUp } from 'lucide-react';

type Props = { agencyId: string };

export default function StatCards({ agencyId }: Props) {
  const { bookings, income } = getAgencyData(agencyId);

  const totalBookings = bookings.reduce((sum, item) => sum + item.total_price, 0);
  const revenue = income.reduce((sum, item) => sum + item.amount, 0);
  const totalCustomers = bookings.length;

  const stats = [
    {
      label: 'Total Bookings',
      amount: `Rs ${totalBookings.toLocaleString()}`,
      icon: Calendar,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
      color: '#0088FF',
      gradient: ['#436CCC', '#2282FF'],
      sub: 18.2,
      comparison: 'vs last 30 days',
    },
    {
      label: 'Revenue (This month)',
      amount: `Rs ${revenue.toLocaleString()}`,
      icon: DollarSign,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-500',
      color: '#34C759',
      gradient: ['#43CC55', '#56FF22'],
      sub: 12.2,
      comparison: 'vs last month',
    },
    {
      label: 'Total Customers',
      amount: totalCustomers,
      icon: Users,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-500',
      color: '#6155F5',
      gradient: ['#5143CC', '#485BFF'],
      sub: 4.8,
      comparison: 'vs last 30 days',
    },
    {
      label: 'Active Treks',
      amount: 1,
      icon: Radio,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-500',
      color: '#FDA31C',
      gradient: ['#F1ED18', '#FEC817'],
      sub: 4.8,
      comparison: 'Live on trails',
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
      {stats.map(({ label, amount, icon: Icon, iconBg, iconColor, color, gradient, sub, comparison }) => (
        <div key={label} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-1">
            <h3 className="text-[11px] font-semibold text-neutral-800 sm:text-xs">{label}</h3>
            <p className="text-sm font-semibold sm:text-base">{amount}</p>
            <p className="flex items-center gap-0.5 text-[11px] font-semibold text-green-500 sm:text-xs">
              <TrendingUp size={13} /> {sub}%
            </p>
            <p className="text-[10px] font-medium text-neutral-500 sm:text-[11px]">{comparison}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8 ${iconBg} ${iconColor}`}>
              <Icon size={16} />
            </div>
            <div className="h-[44px] w-[80px] sm:h-[60px] sm:w-[110px]">
              <ChartWave color={color} gradient={gradient as [string, string]} />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}