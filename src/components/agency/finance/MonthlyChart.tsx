'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { monthlyTransaction } from '@/lib/agency/finance/monthlyTransaction';

type MonthlyChartProps = {
  agencyId: string;
};

export default function MonthlyChart({ agencyId }: MonthlyChartProps) {
  // Prepare data for the chart
  const chartData = monthlyTransaction(agencyId, 5); // Get data for the last 6 months (0 to 5);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6">
      <h3 className="font-semibold text-neutral-900">Monthly Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="income" fill="#8884d8" />
          <Bar dataKey="expenses" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
