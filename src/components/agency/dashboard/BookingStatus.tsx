'use client';

import { useState } from 'react';
import { PieChart, Pie, Tooltip, Label, Cell } from 'recharts';
import { getAgencyData } from '@/lib/agency/getAgencyData';

type Props = { agencyId: string };
type Booking = { created_at: string; status: string };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#0088FF', '#FF2D55', '#FFCC00', '#00C8B3'];

const filterByMonth = (month: number, data: Booking[]) =>
  data.filter((b) => new Date(b.created_at).getMonth() === month);

export default function BookingStatus({ agencyId }: Props) {
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[currentMonth]);
  const month = MONTHS.indexOf(selectedMonth);
  const monthOptions = MONTHS.slice(0, currentMonth + 1);

  const { bookings } = getAgencyData(agencyId);
  const monthly = filterByMonth(month, bookings);

  const statusData = [
    { name: 'Confirmed', count: monthly.filter((b) => b.status === 'confirmed').length },
    { name: 'Pending', count: monthly.filter((b) => !['confirmed', 'cancelled', 'completed'].includes(b.status)).length },
    { name: 'Cancelled', count: monthly.filter((b) => b.status === 'cancelled').length },
    { name: 'Completed', count: monthly.filter((b) => b.status === 'completed').length },
  ];
  const total = statusData.reduce((sum, s) => sum + s.count, 0);

  return (
    <section className="flex flex-col gap-3 rounded-lg bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold sm:text-sm">Booking Status</h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded border border-neutral-200 p-1 text-[10px] outline-none focus:ring-1 focus:ring-blue-500 sm:text-xs"
        >
          {monthOptions.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
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