'use client';

type Transaction = {
  id: string;
  date: string;
  category: string;
  notes: string;
  amount: number;
};

type Props = {
  incomeArr: Transaction[];
  expensesArr: Transaction[];
};

const tableClass = 'p-4 text-left';

export default function RecentTransactions({ incomeArr, expensesArr }: Props) {
  const transactions = [
    ...incomeArr.map((income) => {
      return {
        id: income.id,
        date: income.date,
        category: income.category,
        description: income.notes,
        amount: income.amount,
        color: 'green',
      };
    }),
    ...expensesArr.map((expense) => {
      return {
        id: expense.id,
        date: expense.date,
        category: expense.category,
        description: expense.notes,
        amount: expense.amount,
        color: 'red',
      };
    }),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10); //sort trasactions in descending order by date with maximum of 10 transaction

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6">
      <h3 className="font-semibold text-neutral-900">Recent Transaction</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={tableClass}>Date</th>
            <th className={tableClass}>Category</th>
            <th className={tableClass}>Description</th>
            <th className={tableClass}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            return (
              <tr key={transaction.id}>
                <td className={tableClass}>{transaction.date}</td>
                <td className={tableClass}>{transaction.category}</td>
                <td className={tableClass}>{transaction.description}</td>
                <td className={`${tableClass} ${transaction.color === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                  {`NPR ${transaction.amount}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
