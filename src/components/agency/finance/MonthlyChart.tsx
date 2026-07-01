'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type MonthlyFinanceData = {
  month: string;
  year: number;
  income: number;
  expenses: number;
};

type FinanceRecord = {
  id: string;
  date: string;
  amount: number;
};

type Props = {
  incomeArr: FinanceRecord[];
  expensesArr: FinanceRecord[];
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const addIncomeOrExpenses = (
  amountType: 'income' | 'expenses',
  amountArr: FinanceRecord[],
  mainArr: MonthlyFinanceData[]
) => {
  amountArr.forEach((record) => {
    const date = new Date(record.date);

    const recordMonth = MONTHS[date.getMonth()];
    const recordYear = date.getFullYear();

    mainArr.forEach((obj) => {
      if (recordMonth === obj.month && recordYear === obj.year) {
        obj[amountType] += record.amount;
      }
    });
  });
};

export default function MonthlyChart({ incomeArr, expensesArr }: Props) {
  // Prepare data for the chart
  const chartData: MonthlyFinanceData[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    chartData.push({
      month: MONTHS[date.getMonth()],
      year: date.getFullYear(),
      income: 0,
      expenses: 0,
    });
  }

  addIncomeOrExpenses('income', incomeArr, chartData);
  addIncomeOrExpenses('expenses', expensesArr, chartData);

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
