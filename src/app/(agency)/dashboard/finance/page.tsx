"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { BadgeDollarSign, Download, FileWarning, ReceiptText, Wallet } from "lucide-react";

import { TrendStatCard } from "@/components/shared/TrendStatCard";
import { usePnl, usePnlTrend, useInvoiceList } from "@/hooks/useAgencyFinance";
import { useOverview, usePackageStats } from "@/hooks/useAgencyAnalytics";
import { useCompactMoney, useMoney } from "@/hooks/useAgencyDashboard";
import { exportCsv } from "@/lib/csvExport";
import { growthPct as growth, splitCompare } from "@/lib/trend";

const monthLabel = (period: string) => new Date(`${period}-01T00:00:00.000Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const shortMonth = (period: string) => new Date(`${period}-01T00:00:00.000Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
const shortDay = (date: string) => new Date(`${date}T00:00:00.000Z`).toLocaleDateString("en-US", { day: "numeric", month: "short", timeZone: "UTC" });

const ACCOUNT_CODE = { trekRevenue: "4000", addOnRevenue: "4100", guidePayroll: "5000", permits: "5200" };

export default function FinanceOverviewPage() {
  const money = useMoney();
  const compact = useCompactMoney();
  const pnl = usePnl();
  const trend = usePnlTrend(12);
  const packages = usePackageStats("last_30_days");
  // last_30_days (not last_12_months) — the latter is gated to MEDIUM/LARGE tiers and 403s for everyone else.
  const bookingsOverview = useOverview("last_30_days");
  const invoices = useInvoiceList({ limit: 100 });

  const p = pnl.data;
  const points = trend.data ?? [];
  const current = points[points.length - 1];
  const previous = points[points.length - 2];

  const revenueSeries = useMemo(() => points.map((pt) => ({ label: shortMonth(pt.period), v: pt.revenue })), [points]);
  const profitSeries = useMemo(() => points.map((pt) => ({ label: shortMonth(pt.period), v: pt.netProfit })), [points]);
  const pnlChartData = useMemo(() => points.map((pt) => ({ label: shortMonth(pt.period), netProfit: pt.netProfit })), [points]);

  const dailyBookings = bookingsOverview.data?.charts.bookingsByDay ?? [];
  const bookingsSeries = useMemo(() => dailyBookings.map((b) => ({ label: shortDay(b.date), v: b.count })), [dailyBookings]);
  const totalBookings30d = dailyBookings.reduce((s, b) => s + b.count, 0);
  // Split the 30-day window in half for an honest trend comparison — a "vs last month" figure
  // needs the last_12_months period, which is gated to paid tiers and 403s for everyone else.
  const { recent: recentHalf, prior: priorHalf } = splitCompare(bookingsSeries);

  const pendingInvoices = (invoices.data?.invoices ?? []).filter((i) => i.status === "Sent" || i.status === "Overdue");
  const pendingTotal = pendingInvoices.reduce((s, i) => s + i.total, 0);

  const find = (lines: { code: string; name: string; amount: number }[], code: string) => lines.find((l) => l.code === code)?.amount ?? 0;
  const trekRevenue = p ? find(p.revenue.lines, ACCOUNT_CODE.trekRevenue) : 0;
  const addOnRevenue = p ? find(p.revenue.lines, ACCOUNT_CODE.addOnRevenue) : 0;
  const guidePayroll = p ? find(p.expenses.lines, ACCOUNT_CODE.guidePayroll) : 0;
  const permits = p ? find(p.expenses.lines, ACCOUNT_CODE.permits) : 0;

  const topPackages = packages.data?.topByRevenue ?? [];
  const maxRevenue = Math.max(1, ...topPackages.map((pk) => pk.revenue));
  const totalBookingsThisPeriod = topPackages.reduce((s, pk) => s + pk.bookings, 0);
  const avgRevenue = totalBookingsThisPeriod === 0 ? 0 : topPackages.reduce((s, pk) => s + pk.revenue, 0) / totalBookingsThisPeriod;

  return (
    <div className="space-y-4">
      {(pnl.isError || trend.isError) && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load this month&apos;s figures.</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-primary-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between"><p className="text-sm font-semibold text-neutral-700">Revenue{p ? ` (${monthLabel(p.period).split(" ")[0]})` : ""}</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><Wallet className="h-4 w-4" /></span></div>
          <p className="mt-2 text-2xl font-bold text-neutral-900">{p ? compact(p.revenue.total) : "—"}</p>
          {current && previous && growth(current.revenue, previous.revenue) && <p className="mt-1 text-xs text-neutral-600"><span className={`font-semibold ${current.revenue >= previous.revenue ? "text-success-700" : "text-danger-600"}`}>{growth(current.revenue, previous.revenue)}</span> from {shortMonth(previous.period)}</p>}
        </div>
        <div className="rounded-2xl border border-danger-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between"><p className="text-sm font-semibold text-neutral-700">Expenses{p ? ` (${monthLabel(p.period).split(" ")[0]})` : ""}</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger-50 text-danger-700"><ReceiptText className="h-4 w-4" /></span></div>
          <p className="mt-2 text-2xl font-bold text-neutral-900">{p ? compact(p.expenses.total) : "—"}</p>
          <p className="mt-1 text-xs text-neutral-500">{p && p.expenses.lines.length > 0 ? p.expenses.lines.slice(0, 3).map((l) => l.name).join(", ") : "No expenses recorded yet"}</p>
        </div>
        <div className="rounded-2xl border border-success-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between"><p className="text-sm font-semibold text-neutral-700">Net Profit</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-50 text-success-700"><BadgeDollarSign className="h-4 w-4" /></span></div>
          <p className="mt-2 text-2xl font-bold text-neutral-900">{p ? compact(p.netProfit) : "—"}</p>
          <p className="mt-1 text-xs text-neutral-600">{p ? <><span className={`font-semibold ${p.netProfitMargin >= 0 ? "text-success-700" : "text-danger-600"}`}>{p.netProfitMargin >= 0 ? "↑" : "↓"}</span> {p.netProfitMargin}% margin</> : "—"}</p>
        </div>
        <div className="rounded-2xl border border-warning-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between"><p className="text-sm font-semibold text-neutral-700">Invoices Pending</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning-50 text-warning-700"><FileWarning className="h-4 w-4" /></span></div>
          <p className="mt-2 text-2xl font-bold text-neutral-900">{invoices.data ? pendingInvoices.length : "—"}</p>
          <p className="mt-1 text-xs text-neutral-500">{invoices.data ? `${money(pendingTotal)} outstanding` : "—"}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-500">Summarized Result</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <TrendStatCard label="Gross Revenue" value={current ? money(current.revenue) : "—"} tone="warning" series={revenueSeries} change={current && previous ? growth(current.revenue, previous.revenue) : undefined} onExport={() => exportCsv("gross-revenue.csv", points.map((pt) => ({ period: pt.period, revenue: pt.revenue })))} />
          <TrendStatCard label="Total Bookings" value={bookingsOverview.data ? totalBookings30d : "—"} tone="success" series={bookingsSeries} change={bookingsOverview.data ? growth(recentHalf, priorHalf) : undefined} note="vs previous 15 days" onExport={() => exportCsv("bookings-by-day.csv", dailyBookings.map((b) => ({ date: b.date, bookings: b.count })))} />
          <TrendStatCard label="Net Profit" value={current ? money(current.netProfit) : "—"} tone="success" series={profitSeries} change={current && previous ? growth(current.netProfit, previous.netProfit) : undefined} onExport={() => exportCsv("net-profit.csv", points.map((pt) => ({ period: pt.period, netProfit: pt.netProfit })))} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-neutral-900">P&amp;L Summary {p ? `— ${monthLabel(p.period)}` : ""}</h2>
              <p className="mt-1 text-2xl font-bold text-neutral-900">{p ? money(p.netProfit) : "—"} {current && previous && <span className={`ml-1 text-sm font-semibold ${current.netProfit >= previous.netProfit ? "text-success-700" : "text-danger-600"}`}>{growth(current.netProfit, previous.netProfit) ?? ""}</span>}</p>
            </div>
            <button type="button" onClick={() => exportCsv("pnl-summary.csv", points.map((pt) => ({ period: pt.period, revenue: pt.revenue, expenses: pt.expenses, netProfit: pt.netProfit })))} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-900 hover:bg-neutral-50"><Download className="h-3.5 w-3.5" /> Export</button>
          </div>
          <div className="mt-4 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pnlChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => money(Number(v))} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e5e5e5" }} />
                <Line type="monotone" dataKey="netProfit" name="Net profit" stroke="#4338CA" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <dl className="mt-4 divide-y divide-neutral-100 border-t border-neutral-100 text-sm">
            <div className="flex items-center justify-between py-2"><dt className="text-neutral-600">Trek Revenue</dt><dd className="font-semibold text-success-700">+{money(trekRevenue)}</dd></div>
            <div className="flex items-center justify-between py-2"><dt className="text-neutral-600">Add-on Revenue</dt><dd className="font-semibold text-success-700">+{money(addOnRevenue)}</dd></div>
            <div className="flex items-center justify-between py-2"><dt className="text-neutral-600">Guide Payroll</dt><dd className="font-semibold text-danger-600">-{money(guidePayroll)}</dd></div>
            <div className="flex items-center justify-between py-2"><dt className="text-neutral-600">Permits &amp; Fees</dt><dd className="font-semibold text-danger-600">-{money(permits)}</dd></div>
            <div className="flex items-center justify-between py-2.5"><dt className="font-bold text-neutral-900">Net Profit</dt><dd className="font-bold text-neutral-900">{p ? money(p.netProfit) : "—"}</dd></div>
          </dl>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="flex items-center gap-1.5 font-bold text-neutral-900">Top Packages by Revenue</h2></div>
          {packages.isLoading && <div className="mt-3 h-24 animate-pulse rounded-xl bg-neutral-100" />}
          {!packages.isLoading && topPackages.length === 0 && <p className="mt-3 text-sm text-neutral-500">No package revenue in the last 30 days.</p>}
          <ul className="mt-3 space-y-4">
            {topPackages.slice(0, 3).map((pk) => (
              <li key={pk.package_id}>
                <div className="flex items-center justify-between gap-2"><span className="font-semibold text-neutral-900">{pk.title ?? "Removed package"}</span><span className="font-bold text-primary-700">{money(pk.revenue)}</span></div>
                <p className="text-xs text-neutral-500">{pk.bookings} booking{pk.bookings === 1 ? "" : "s"} · avg. {money(pk.bookings ? pk.revenue / pk.bookings : 0)}</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-gradient-to-r from-danger-400 via-warning-400 to-primary-500" style={{ width: `${Math.max(6, (pk.revenue / maxRevenue) * 100)}%` }} /></div>
              </li>
            ))}
          </ul>

          {topPackages.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-xl border border-neutral-100">
              <table className="w-full text-left text-xs"><thead className="bg-neutral-50 text-[10px] uppercase tracking-wide text-neutral-500"><tr><th className="px-3 py-2">No.</th><th className="px-3 py-2">Package</th><th className="px-3 py-2">Bookings</th><th className="px-3 py-2 text-right">Revenue</th></tr></thead>
                <tbody>{topPackages.slice(0, 5).map((pk, i) => <tr key={pk.package_id} className="border-t border-neutral-100"><td className="px-3 py-2 text-neutral-500">{i + 1}</td><td className="px-3 py-2 font-semibold text-neutral-900">{pk.title ?? "Removed"}</td><td className="px-3 py-2">{pk.bookings}</td><td className="px-3 py-2 text-right font-semibold text-primary-700">{money(pk.revenue)}</td></tr>)}</tbody>
              </table>
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-4 text-center">
            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-2.5"><p className="text-[11px] text-neutral-500">Total Packages</p><p className="text-lg font-bold text-neutral-900">{packages.data ? packages.data.total : "—"}</p></div>
            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-2.5"><p className="text-[11px] text-neutral-500">Total Bookings</p><p className="text-lg font-bold text-neutral-900">{packages.data ? totalBookingsThisPeriod : "—"}</p></div>
            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-2.5"><p className="text-[11px] text-neutral-500">Avg Revenue</p><p className="text-lg font-bold text-neutral-900">{packages.data ? money(avgRevenue) : "—"}</p></div>
          </div>
        </section>
      </div>

      <div className="flex justify-end"><Link href="/dashboard/finance/reports" className="text-sm font-semibold text-primary-700 hover:underline">View full reports →</Link></div>
    </div>
  );
}
