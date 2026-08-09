'use client';

import { monthlyTransaction } from '@/lib/agency/finance/monthlyTransaction';

const tableClass = 'p-4 text-left';

export default function ReportsPage() {
  const agencyId = 'ag-001';
  const monthData = monthlyTransaction(agencyId, 5).reverse(); // Get data for the last 6 months (0 to 5);

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-neutral-900">Reports</h2>
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h3 className="font-semibold text-neutral-900">Profit & Loss Summary (by month)</h3>
        <table className="w-full border-collapse mt-4">
          <thead>
            <tr>
              <th className={tableClass}>Month</th>
              <th className={tableClass}>Income</th>
              <th className={tableClass}>Expenses</th>
              <th className={tableClass}>Net Profit</th>
            </tr>
          </thead>
          <tbody>
            {monthData.map((data) => {
              return (
                <tr key={`${data.year} - ${data.month}`}>
                  <td className={tableClass}>{`${data.month} ${data.year}`}</td>
                  <td className={tableClass}>{`NPR ${data.income}`}</td>
                  <td className={tableClass}>{`NPR ${data.expenses}`}</td>
                  <td className={tableClass}>{`NPR ${data.income - data.expenses}`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
