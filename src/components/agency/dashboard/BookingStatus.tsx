'use client';

import { PieChart, Pie, Tooltip, Label, Cell } from 'recharts';
import { useDashboardSummary } from '@/hooks/useAgencyDashboard';
import { bucketOf, type ApiBookingStatus } from '@/lib/api/agency/bookings';

const COLORS = ['#0088FF', '#FF2D55', '#FFCC00', '#00C8B3'];

export default function BookingStatus() {
  const { data } = useDashboardSummary();
  const byStatus = data?.stats.bookingsByStatus ?? {};

  // The API has 9 booking statuses; the chart groups them into four buckets.
  const count = (bucket: ReturnType<typeof bucketOf>) =>
    Object.entries(byStatus)
      .filter(([status]) => bucketOf(status as ApiBookingStatus) === bucket)
      .reduce((sum, [, n]) => sum + n, 0);

  const statusData = [
    { name: 'Confirmed', count: count('confirmed') },
    { name: 'Pending', count: count('pending') },
    { name: 'Cancelled', count: count('cancelled') },
    { name: 'Completed', count: count('completed') },
  ];
  const total = statusData.reduce((sum, s) => sum + s.count, 0);

  return (
    <section className="flex flex-col gap-3 rounded-lg bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold sm:text-sm">Booking Status</h2>
        <span className="text-[10px] text-neutral-500 sm:text-xs">All time</span>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <PieChart width={150} height={150}>
          <Pie data={statusData} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={62}>
            {statusData.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
            <Label
              content={({ viewBox }) =>
                viewBox && 'cx' in viewBox && 'cy' in viewBox ? (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} dy="-5" fontSize="20" fontWeight="bold">{total}</tspan>
                    <tspan x={viewBox.cx} dy="18" fontSize="11">Total</tspan>
                  </text>
                ) : null
              }
            />
          </Pie>
          <Tooltip />
        </PieChart>

        <div className="flex w-full flex-col gap-2.5">
          {statusData.map((item, i) => {
            const pct = total ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-[11px] font-semibold sm:text-xs">
                  {item.name} {item.count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}