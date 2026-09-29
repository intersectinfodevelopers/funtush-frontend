'use client';

import ChartWave from './ChartWave';
import { Calendar, DollarSign, Users, Radio } from 'lucide-react';
import { useAnalytics, useCustomerCount, useDashboardSummary, useMoney } from '@/hooks/useAgencyDashboard';

/**
 * Real numbers only. The mock version invented growth percentages
 * ("+18.2% vs last 30 days") and hard-coded "Active Treks: 1"; there is no
 * period-over-period data behind those, so each card now states what it counts.
 */
export default function StatCards() {
  const summary = useDashboardSummary();
  const analytics = useAnalytics('last_30_days');
  const customers = useCustomerCount();
  const money = useMoney();

  const s = summary.data?.stats;
  const dash = (v: number | string | undefined) => (v === undefined ? '—' : v);

  const stats = [
    { label: 'Total Bookings', amount: dash(s?.totalBookings), note: `${s?.pendingInquiries ?? 0} pending inquiries`, icon: Calendar, iconBg: 'bg-blue-100', iconColor: 'text-blue-500', color: '#0088FF', gradient: ['#436CCC', '#2282FF'] },
    { label: 'Revenue (30 days)', amount: analytics.data ? money(analytics.data.summary.totalRevenue) : '—', note: 'Paid bookings', icon: DollarSign, iconBg: 'bg-green-100', iconColor: 'text-green-500', color: '#34C759', gradient: ['#43CC55', '#56FF22'] },
    { label: 'Total Customers', amount: dash(customers.data), note: 'Who have booked with you', icon: Users, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-500', color: '#6155F5', gradient: ['#5143CC', '#485BFF'] },
    { label: 'Active Treks', amount: dash(s?.bookingsByStatus.ACTIVE ?? (s ? 0 : undefined)), note: 'Checked in, live on trails', icon: Radio, iconBg: 'bg-amber-100', iconColor: 'text-amber-500', color: '#FDA31C', gradient: ['#F1ED18', '#FEC817'] },
  ];

  return (
    <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
      {stats.map(({ label, amount, note, icon: Icon, iconBg, iconColor, color, gradient }) => (
        <div key={label} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-1">
            <h3 className="text-[11px] font-semibold text-neutral-800 sm:text-xs">{label}</h3>
            <p className="text-sm font-semibold sm:text-base">{amount}</p>
            <p className="text-[10px] font-medium text-neutral-500 sm:text-[11px]">{note}</p>
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
