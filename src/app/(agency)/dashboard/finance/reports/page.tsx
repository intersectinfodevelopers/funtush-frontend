"use client";

import { useState } from "react";
import { useBalanceSheet, useCashFlow, usePnl, useTaxSummary } from "@/hooks/useAgencyFinance";
import { useMoney } from "@/hooks/useAgencyDashboard";

const thisMonth = () => new Date().toISOString().slice(0, 7);

function Lines({ title, lines, total, money }: { title: string; lines: { code: string; name: string; amount: number }[]; total: number; money: (n: number) => string }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-500">{title}</h4>
      <table className="mt-1 w-full text-sm"><tbody>
        {lines.length === 0 && <tr><td className="py-1.5 text-neutral-400">Nothing recorded</td></tr>}
        {lines.map((l) => <tr key={`${l.code}${l.name}`} className="border-t border-neutral-100"><td className="py-1.5 text-neutral-700">{l.name}</td><td className="py-1.5 text-right">{money(l.amount)}</td></tr>)}
        <tr className="border-t border-neutral-300 font-bold"><td className="py-1.5">Total</td><td className="py-1.5 text-right">{money(total)}</td></tr>
      </tbody></table>
    </div>
  );
}
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => <section aria-label={title} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"><h3 className="font-bold text-neutral-900">{title}</h3>{children}</section>;

export default function ReportsPage() {
  const [period, setPeriod] = useState(thisMonth());
  const valid = /^\d{4}-\d{2}$/.test(period);
  const p = valid ? period : undefined;
  const money = useMoney();
  const pnl = usePnl(p);
  const bs = useBalanceSheet(p);
  const cf = useCashFlow(p);
  const tax = useTaxSummary(p);
  const failed = pnl.isError || bs.isError || cf.isError || tax.isError;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3"><p className="text-sm text-neutral-600">Statements are built from your recorded income and expenses.</p>
        <label className="text-sm"><span className="mr-2 font-semibold text-neutral-700">Month</span><input aria-label="Month" type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm" /></label></div>
      {failed && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load some reports for this month.</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Profit & loss">
          {pnl.data && <><Lines title="Revenue" lines={pnl.data.revenue.lines} total={pnl.data.revenue.total} money={money} /><Lines title="Expenses" lines={pnl.data.expenses.lines} total={pnl.data.expenses.total} money={money} /><p className="border-t border-neutral-300 pt-2 text-sm font-bold">Net profit: <span className={pnl.data.netProfit < 0 ? "text-danger-700" : "text-success-700"}>{money(pnl.data.netProfit)}</span> <span className="font-normal text-neutral-500">({pnl.data.netProfitMargin}% margin)</span></p></>}
        </Card>
        <Card title="Cash flow">
          {cf.data && <><Lines title="Money in" lines={cf.data.inflows.byCategory} total={cf.data.inflows.total} money={money} /><Lines title="Money out" lines={cf.data.outflows.byCategory} total={cf.data.outflows.total} money={money} /><dl className="grid grid-cols-3 gap-2 border-t border-neutral-300 pt-2 text-center text-sm"><div><dt className="text-[11px] text-neutral-500">Opening</dt><dd className="font-bold">{money(cf.data.openingBalance)}</dd></div><div><dt className="text-[11px] text-neutral-500">Net</dt><dd className="font-bold">{money(cf.data.netCashFlow)}</dd></div><div><dt className="text-[11px] text-neutral-500">Closing</dt><dd className="font-bold">{money(cf.data.closingBalance)}</dd></div></dl></>}
        </Card>
        <Card title="Balance sheet">
          {bs.data && <><Lines title="Assets" lines={bs.data.assets.lines} total={bs.data.assets.total} money={money} /><Lines title="Liabilities" lines={bs.data.liabilities.lines} total={bs.data.liabilities.total} money={money} /><Lines title="Equity" lines={bs.data.equity.lines} total={bs.data.equity.total} money={money} />{!bs.data.balanced && <p role="alert" className="text-sm text-danger-600">This balance sheet does not balance — contact support.</p>}</>}
        </Card>
        <Card title="VAT summary">
          {tax.data && <><dl className="space-y-1 text-sm">{([["Net revenue", tax.data.totals.netRevenue], [`Output VAT (${tax.data.vatRate}%)`, tax.data.totals.outputVat], ["Deductible expenses", tax.data.totals.deductibleExpenses], ["Input VAT", tax.data.totals.inputVat]] as [string, number][]).map(([k, v]) => <div key={k} className="flex justify-between border-t border-neutral-100 py-1"><dt className="text-neutral-700">{k}</dt><dd>{money(v)}</dd></div>)}<div className="flex justify-between border-t border-neutral-300 pt-1 font-bold"><dt>Net VAT payable</dt><dd>{money(tax.data.totals.netVatPayable)}</dd></div></dl><ul className="list-disc space-y-0.5 pl-4 text-xs text-neutral-500">{tax.data.assumptions.map((a) => <li key={a}>{a}</li>)}</ul></>}
        </Card>
      </div>
    </div>
  );
}
