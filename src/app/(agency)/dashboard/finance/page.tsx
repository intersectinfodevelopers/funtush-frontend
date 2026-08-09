'use client';

import finance from '../../../../../data/finance.json';
//import SummaryStatCard from '@/components/agency/finance/SummaryStatCard';
import MonthlyChart from '@/components/agency/finance/MonthlyChart';
import RecentTransactions from '@/components/agency/finance/RecentTransactions';
import QuickLinks from '@/components/agency/finance/QuickLinks';
import Link from 'next/link';
import { AnalyticsSummaryCard } from '@/components/shared/AnalyticsSummaryCard';
import { ArrowDownToLine, ArrowUpToLine, Wallet, Receipt } from 'lucide-react';

const agencyId = 'ag-001';

const isAgencyData = (agency_id: string) => agency_id === agencyId;

const incomeArr = finance.income.filter((inc) => isAgencyData(inc.agency_id));
const expensesArr = finance.expenses.filter((expense) => isAgencyData(expense.agency_id));

const totalIncome = incomeArr.reduce((sum, inc) => sum + inc.amount, 0);

const totalExpenses = expensesArr.reduce((sum, expense) => sum + expense.amount, 0);

const netProfit = totalIncome - totalExpenses;

const ouststandingInvoice = finance.invoices
  .filter((invoice) => isAgencyData(invoice.agency_id) && invoice.status !== 'Paid')
  .reduce((sum, invoice) => sum + invoice.amount, 0);

export default function AgencyFinancePage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/dashboard">Dashboard</Link>
          <span>/</span>
          <span className="font-semibold text-neutral-900">Finance</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Finance Overview</h1>
        <p className="mt-1 text-sm text-neutral-600">Track income, expenses, profit, and outstanding invoices.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsSummaryCard
          label="Total Income"
          value={`Rs. ${totalIncome.toLocaleString()}`}
          tone="success"
          icon={ArrowUpToLine}
        />
        <AnalyticsSummaryCard
          label="Total Expenses"
          value={`Rs. ${totalExpenses.toLocaleString()}`}
          tone="danger"
          icon={ArrowDownToLine}
        />
        <AnalyticsSummaryCard
          label="Net Profit"
          value={`Rs. ${netProfit.toLocaleString()}`}
          tone="primary"
          icon={Wallet}
        />
        <AnalyticsSummaryCard
          label="Outstanding Invoices"
          value={`Rs. ${ouststandingInvoice.toLocaleString()}`}
          tone="warning"
          icon={Receipt}
        />
      </div>
      <MonthlyChart agencyId={agencyId} />
      <RecentTransactions incomeArr={incomeArr} expensesArr={expensesArr} />
      <QuickLinks />
    </div>
  );
}
