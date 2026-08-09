import finance from '../../../../data/finance.json';

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

export function monthlyTransaction(agencyId: string, monthBack: number) {
  const incomeArr = finance.income.filter((inc) => inc.agency_id === agencyId);
  const expensesArr = finance.expenses.filter((expense) => expense.agency_id === agencyId);

  const chartData: MonthlyFinanceData[] = [];

  for (let i = monthBack; i >= 0; i--) {
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

  return chartData;
}
