'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

type Props = {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  outstandingInvoices: number;
};

export default function SummaryStatCard({ totalIncome, totalExpenses, netProfit, outstandingInvoices }: Props) {
  const summaryData = [
    { title: 'Total Income', content: totalIncome },
    { title: 'Total Expenses', content: totalExpenses },
    { title: 'Net Profit', content: netProfit },
    { title: 'Outstanding Invoices', content: outstandingInvoices },
  ];
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {summaryData.map((data) => (
          <Card key={data.title}>
            <CardHeader>
              <CardTitle>{data.title}</CardTitle>
            </CardHeader>

            <CardContent>
              <p>{data.content.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
