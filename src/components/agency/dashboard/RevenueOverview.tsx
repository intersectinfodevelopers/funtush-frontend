'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics, useMoney, usePnl } from '@/hooks/useAgencyDashboard';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** The last 30 calendar days, oldest first, each filled from the API's sparse revenue-by-day list. */
function last30Days(revenueByDay: Array<{ date: string; revenue: number }>) {
  const byDate = new Map(revenueByDay.map((r) => [r.date, r.revenue]));
  const out: Array<{ date: string; revenue: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    out.push({ date: `${MONTHS[d.getMonth()]} ${d.getDate()}`, revenue: byDate.get(iso) ?? 0 });
  }
  return out;
}

export default function RevenueOverview() {
  const analytics = useAnalytics('last_30_days');
  const pnl = usePnl(); // current month, straight from the ledger
  const money = useMoney();

  const chartData = last30Days(analytics.data?.charts.revenueByDay ?? []);
  const revenue30 = analytics.data?.summary.totalRevenue ?? 0;
  const symbol = money(0).replace(/0$/, '').trim();

  return (
    <section className="flex flex-col gap-3 rounded-lg bg-white p-3 shadow-sm md:col-span-2 xl:col-span-1">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-xs font-semibold sm:text-sm">Revenue Overview</h2>
          <p className="text-[10px] text-neutral-500 sm:text-xs">Paid bookings, last 30 days</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-sm font-semibold sm:text-lg">{money(revenue30)}</p>
            <p className="text-[10px] text-neutral-500 sm:text-xs">Revenue (30 days)</p>
          </div>
          <div className="h-8 w-px bg-neutral-200" />
          <div className="text-center text-neutral-500">
            <p className="text-sm font-semibold sm:text-lg">{pnl.data ? money(pnl.data.expenses.total) : '—'}</p>
            <p className="text-[10px] sm:text-xs">Expenses (this month)</p>
          </div>
        </div>
      </div>

      <div className="h-[160px] w-full md:h-[200px] lg:h-[230px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: 15, bottom: 5 }}>
            <CartesianGrid stroke="#e5e5e5" vertical horizontal />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#737373' }} tickMargin={10} interval={4} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#737373' }}
              tickFormatter={(v) => (v === 0 ? `${symbol}0` : v >= 1000 ? `${symbol}${v / 1000}K` : `${symbol}${v}`)}
              tickMargin={10}
            />
            <Tooltip formatter={(v) => money(Number(v))} />
            <Line type="monotone" dataKey="revenue" stroke="#0784ff" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
