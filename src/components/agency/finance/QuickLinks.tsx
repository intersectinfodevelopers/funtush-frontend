'use client';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function QuickLinks() {
  return (
    <>
      <div className="flex flex-wrap gap-4">
        <Link href="/dashboard/finance/income">
          <Button variant="secondary">+ Add Income</Button>
        </Link>

        <Link href="/dashboard/finance/expenses">
          <Button variant="secondary">+ Add Expense</Button>
        </Link>

        <Link href="/dashboard/finance/invoices">
          <Button variant="outline">Generate Invoice</Button>
        </Link>

        <Link href="/dashboard/finance/reports">
          <Button variant="outline">View Reports</Button>
        </Link>
      </div>
    </>
  );
}
