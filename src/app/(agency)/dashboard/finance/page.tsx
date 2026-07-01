'use client';

import finance from '../../../../../data/finance.json';
import SummaryStatCard from '@/components/agency/finance/SummaryStatCard';
import MonthlyChart from '@/components/agency/finance/MonthlyChart';
import RecentTransactions from '@/components/agency/finance/RecentTransactions';
import QuickLinks from '@/components/agency/finance/QuickLinks';

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
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-neutral-900">Finance Overview</h2>
      <SummaryStatCard
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
        outstandingInvoices={ouststandingInvoice}
      />
      <MonthlyChart incomeArr={incomeArr} expensesArr={expensesArr} />
      <RecentTransactions incomeArr={incomeArr} expensesArr={expensesArr} />
      <QuickLinks />
    </div>
  );
}
