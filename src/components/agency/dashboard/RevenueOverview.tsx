'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAgencyData } from '@/lib/agency/getAgencyData';

type Props = {
  agencyId: string;
};

type Transaction = {
  id: string;
  date: string;
  amount: number;
};

type DisplayData = {
  date: string;
  revenue: number;
  expenses: number;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getSortedTransaction = (data: Transaction[]) => {
  const newData = data.map((item) => ({ id: item.id, date: item.date, amount: item.amount }));
  return newData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const getTransactionByMonth = (year: number, month: number, data: Transaction[]) => {
  const newData = data.filter((item) => {
    const date = new Date(item.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
  return newData;
};

const getDisplayableData = (amountType: 'revenue' | 'expenses', arr: Transaction[], mainArr: DisplayData[]) => {
  arr.forEach((item) => {
    const day = new Date(item.date).getDate();
    mainArr[day - 1][amountType] += item.amount;
  });
};

export default function RevenueOverview({ agencyId }: Props) {
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[currentMonth]);
  const [showRevenue, setShowRevenue] = useState(true);
  const [showExpenses, setShowExpenses] = useState(true);

  const month = MONTHS.indexOf(selectedMonth);
  const monthArr = MONTHS.slice(0, currentMonth + 1);

  const { income, expense } = getAgencyData(agencyId);
  const sortedIncome = getSortedTransaction(income);
  const sortedExpense = getSortedTransaction(expense);

  const incomeArr = getTransactionByMonth(2026, month, sortedIncome);
  const expenseArr = getTransactionByMonth(2026, month, sortedExpense);

  const chartdata: DisplayData[] = [];

  for (let i = 1; i <= 31; i++) {
    chartdata.push({
      date: `${MONTHS[month]} ${i}`,
      revenue: 0,
      expenses: 0,
    });
  }

  getDisplayableData('revenue', incomeArr, chartdata);
  getDisplayableData('expenses', expenseArr, chartdata);

  return (
    <section className="rounded-sm bg-[#fff] px-[12px] py-[15px] shadow-sm">
      <div className="flex justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="font-roboto font-semibold text-sm leading-sm">Revenue Overview</h3>
          <div className="flex gap-2">
            <label htmlFor="months"></label>
            <select
              name="months"
              id="months"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-[10px] border border-[#F2F2F7] rounded px-[4px] py-[5px] gap-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {monthArr.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <button className="text-sm font-semibold" onClick={() => setShowRevenue(!showRevenue)}>
              <span className={getLegendIndicatorClass(showRevenue)}>-- </span>Revenue
            </button>
            <button className="text-sm font-semibold" onClick={() => setShowExpenses(!showExpenses)}>
              <span className={getLegendIndicatorClass(showExpenses)}>-- </span>Expenses
            </button>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex flex-col gap-2 items-center font-roboto font-semibold leading-[15px]">
            <p className="text-xl">{`Rs ${chartdata.reduce((sum, item) => sum + item.revenue, 0)}`}</p>
            <p className="text-[10px]">Total Revenue</p>
          </div>
          <div className="w-[2px] h-full bg-[#625B71]"></div>
          <div className="flex flex-col gap-2 items-center font-roboto font-semibold leading-[15px]">
            <p className="text-xl">{`Rs ${chartdata.reduce((sum, item) => sum + item.expenses, 0)}`}</p>
            <p className="text-[10px]">Total Expenses</p>
          </div>
        </div>
      </div>
      <div className="pt-10 px-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartdata}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `Rs ${value}`} />
            <Tooltip formatter={(value) => `Rs ${value}`} />

            {showRevenue && <Line type="monotone" dataKey="revenue" stroke="#007bff" strokeWidth={3} dot={false} />}
            {showExpenses && (
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#8ec5ff"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

const getLegendIndicatorClass = (isActive: boolean) =>
  `font-bold text-2xl ${isActive ? 'text-[#14C935]' : 'text-[#D3F1BF]'}`;
