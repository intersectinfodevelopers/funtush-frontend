'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAgencyData } from '@/lib/agency/getAgencyData';

type Props = { agencyId: string };
type Transaction = { id: string; date: string; amount: number };
type DisplayData = { date: string; revenue: number; expenses: number };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const sortByDate = (data: Transaction[]) =>
  [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const filterByMonth = (year: number, month: number, data: Transaction[]) =>
  data.filter((item) => {
    const d = new Date(item.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

const fillDisplayData = (type: 'revenue' | 'expenses', arr: Transaction[], target: DisplayData[]) => {
  arr.forEach((item) => {
    const day = new Date(item.date).getDate();
    target[day - 1][type] += item.amount;
  });
};

export default function RevenueOverview({ agencyId }: Props) {
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[currentMonth]);
  const [showRevenue, setShowRevenue] = useState(true);
  const [showExpenses, setShowExpenses] = useState(true);

  const month = MONTHS.indexOf(selectedMonth);
  const monthOptions = MONTHS.slice(0, currentMonth + 1);

  const { income, expense } = getAgencyData(agencyId);
  const incomeArr = filterByMonth(2026, month, sortByDate(income));
  const expenseArr = filterByMonth(2026, month, sortByDate(expense));

  const chartData: DisplayData[] = Array.from({ length: 31 }, (_, i) => ({
    date: `${MONTHS[month]} ${i + 1}`,
    revenue: 0,
    expenses: 0,
  }));
  fillDisplayData('revenue', incomeArr, chartData);
  fillDisplayData('expenses', expenseArr, chartData);

  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = chartData.reduce((sum, d) => sum + d.expenses, 0);

  return (
    <section className="flex flex-col gap-3 rounded-lg bg-white p-3 shadow-sm md:col-span-2 xl:col-span-1">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold sm:text-sm">Revenue Overview</h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded border border-neutral-200 p-1 text-[10px] outline-none focus:ring-1 focus:ring-blue-500 sm:text-xs"
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <button className="text-[10px] font-semibold sm:text-xs" onClick={() => setShowRevenue((v) => !v)}>
              <span className={showRevenue ? 'text-green-500' : 'text-green-200'}>▬</span> Revenue
            </button>
            <button className="text-[10px] font-semibold sm:text-xs" onClick={() => setShowExpenses((v) => !v)}>
              <span className={showExpenses ? 'text-green-500' : 'text-green-200'}>▬</span> Expenses
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-sm font-semibold sm:text-lg">Rs {totalRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-neutral-500 sm:text-xs">Total Revenue</p>
          </div>
          <div className="h-8 w-px bg-neutral-200" />
          <div className="text-center text-neutral-500">
            <p className="text-sm font-semibold sm:text-lg">Rs {totalExpenses.toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs">Total Expenses</p>
          </div>
        </div>
      </div>

      <div className="h-[160px] w-full md:h-[200px] lg:h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: 15, bottom: 5 }}>
            <CartesianGrid stroke="#e5e5e5" vertical horizontal />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#737373' }} tickMargin={10} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#737373' }}
              tickFormatter={(v) => (v === 0 ? 'Rs0' : `Rs ${v / 1000}K`)}
              tickMargin={10}
            />
            <Tooltip formatter={(v) => `Rs ${Number(v).toLocaleString()}`} />
            {showRevenue && <Line type="monotone" dataKey="revenue" stroke="#0784ff" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />}
            {showExpenses && (
              <Line type="monotone" dataKey="expenses" stroke="#9dccff" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}