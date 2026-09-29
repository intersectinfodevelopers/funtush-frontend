"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { Download } from "lucide-react";

import { FeatureGate } from "@/components/shared/FeatureGate";
import { TrendStatCard } from "@/components/shared/TrendStatCard";
import { useCustomerStats, useGuideStats, useOverview, useOriginPerformance, usePackageStats } from "@/hooks/useAgencyAnalytics";
import { useMoney } from "@/hooks/useAgencyDashboard";
import { useMyTier } from "@/hooks/useAgencySettings";
import { exportCsv } from "@/lib/csvExport";
import { growthPct, splitCompare } from "@/lib/trend";
import type { AnalyticsPeriod } from "@/lib/api/agency/analytics";

const PERIODS: { id: AnalyticsPeriod; label: string }[] = [
  { id: "last_7_days", label: "Last 7 days" },
  { id: "last_30_days", label: "Last 30 days" },
  { id: "last_12_months", label: "Last 12 months" },
];

const shortDate = (period: AnalyticsPeriod, date: string) =>
  period === "last_12_months"
    ? new Date(`${date}-01T00:00:00.000Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
    : new Date(`${date}T00:00:00.000Z`).toLocaleDateString("en-US", { day: "numeric", month: "short", timeZone: "UTC" });

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function AnalyticsPage() {
  const { tier: myTier, isLoading: tierLoading } = useMyTier();
  const [period, setPeriod] = useState<AnalyticsPeriod>("last_30_days");
  const money = useMoney();
  const overview = useOverview(period);
  const comparison = useOverview("last_7_days");
  const origin = useOriginPerformance(period);
  const packages = usePackageStats(period);
  const customers = useCustomerStats(period);
  const guides = useGuideStats(period);

  const o = overview.data;
  const compareLabel = period === "last_12_months" ? "Compared to last month" : "vs earlier in this period";

  const bookingsSeries = useMemo(() => (o?.charts.bookingsByDay ?? []).map((b) => ({ label: shortDate(period, b.date), v: b.count })), [o, period]);
  const revenueSeries = useMemo(() => (o?.charts.revenueByDay ?? []).map((b) => ({ label: shortDate(period, b.date), v: b.revenue })), [o, period]);
  const conversionSeries = useMemo(() => (o?.charts.conversionByDay ?? []).map((b) => ({ label: shortDate(period, b.date), v: b.rate })), [o, period]);

  const bookingsCmp = splitCompare(bookingsSeries);
  const revenueCmp = splitCompare(revenueSeries);
  const conversionCmp = splitCompare(conversionSeries);

  // "Comparison": this week vs the week before, always from a real 7-day window (available on every tier).
  const dailyRevenue = comparison.data?.charts.revenueByDay ?? [];
  const thisWeek = dailyRevenue.slice(Math.ceil(dailyRevenue.length / 2));
  const lastWeekDays = dailyRevenue.slice(0, Math.ceil(dailyRevenue.length / 2));
  const thisWeekTotal = thisWeek.reduce((s, d) => s + d.revenue, 0);
  const lastWeekTotal = lastWeekDays.reduce((s, d) => s + d.revenue, 0);
  const thisWeekSeries = thisWeek.map((d) => ({ label: shortDate("last_7_days", d.date), v: d.revenue }));
  const lastWeekSeries = lastWeekDays.map((d) => ({ label: shortDate("last_7_days", d.date), v: d.revenue }));

  const rows = origin.data?.rows ?? [];

  return (
    <FeatureGate unlocked={myTier?.analyticsEnabled ?? false} loading={tierLoading} feature="Analytics">
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500"><Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span>/</span><span className="font-semibold text-neutral-900">Analytics</span></div>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Summarized Result</h1>
          <p className="mt-1 text-sm text-neutral-600">Overview of bookings, revenue, and recent trends for this agency.</p>
        </div>
        <div role="group" aria-label="Period" className="inline-flex rounded-xl border border-neutral-200 bg-white p-1">
          {PERIODS.map((p) => (
            <button key={p.id} type="button" aria-pressed={period === p.id} onClick={() => setPeriod(p.id)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${period === p.id ? "bg-primary-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>{p.label}</button>
          ))}
        </div>
      </div>

      {overview.isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load analytics for this period.</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        <TrendStatCard label="Total Bookings" value={o ? o.summary.totalBookings : "—"} tone="danger" series={bookingsSeries} change={o ? growthPct(bookingsCmp.recent, bookingsCmp.prior) : undefined} note={compareLabel} />
        <TrendStatCard label="Revenue" value={o ? money(o.summary.totalRevenue) : "—"} tone="success" series={revenueSeries} change={o ? growthPct(revenueCmp.recent, revenueCmp.prior) : undefined} note={compareLabel} />
        <TrendStatCard label="Conversion Rate" value={o ? `${o.summary.conversionRate}%` : "—"} tone="primary" series={conversionSeries} change={o ? growthPct(conversionCmp.recent, conversionCmp.prior) : undefined} note={compareLabel} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-2xl border border-danger-100 bg-danger-50/40 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-neutral-900">Gross Profit</h2>
              <p className="mt-1 text-2xl font-bold text-neutral-900">{o ? money(o.summary.totalRevenue) : "—"} {o && growthPct(revenueCmp.recent, revenueCmp.prior) && <span className="ml-1 text-sm font-semibold text-success-700">{growthPct(revenueCmp.recent, revenueCmp.prior)}</span>}</p>
            </div>
            <button type="button" onClick={() => exportCsv("gross-profit.csv", (o?.charts.revenueByDay ?? []).map((b) => ({ date: b.date, revenue: b.revenue })))} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-900 hover:bg-neutral-50"><Download className="h-3.5 w-3.5" /> Export</button>
          </div>
          <div className="mt-4 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs><linearGradient id="gross-profit-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16A34A" stopOpacity={0.3} /><stop offset="100%" stopColor="#16A34A" stopOpacity={0} /></linearGradient></defs>
                <Tooltip formatter={(v) => money(Number(v))} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e5e5e5" }} />
                <Area type="monotone" dataKey="v" stroke="#16A34A" strokeWidth={2} fill="url(#gross-profit-fill)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-neutral-900">Comparison</h2>
          <div className="mt-3">
            <p className="text-sm font-semibold text-neutral-700">This week</p>
            <p className="text-xl font-bold text-neutral-900">{comparison.data ? money(thisWeekTotal) : "—"}</p>
            <div className="h-16 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={thisWeekSeries}><defs><linearGradient id="cmp-this" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16A34A" stopOpacity={0.3} /><stop offset="100%" stopColor="#16A34A" stopOpacity={0} /></linearGradient></defs><Tooltip formatter={(v) => money(Number(v))} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e5e5e5" }} /><Area type="monotone" dataKey="v" stroke="#16A34A" strokeWidth={2} fill="url(#cmp-this)" dot={false} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div>
          </div>
          <div className="mt-4 border-t border-neutral-100 pt-3">
            <p className="text-sm font-semibold text-neutral-700">Previous week</p>
            <p className="text-xl font-bold text-neutral-900">{comparison.data ? money(lastWeekTotal) : "—"}</p>
            <div className="h-16 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={lastWeekSeries}><defs><linearGradient id="cmp-last" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0369A1" stopOpacity={0.3} /><stop offset="100%" stopColor="#0369A1" stopOpacity={0} /></linearGradient></defs><Tooltip formatter={(v) => money(Number(v))} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e5e5e5" }} /><Area type="monotone" dataKey="v" stroke="#0369A1" strokeWidth={2} fill="url(#cmp-last)" dot={false} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-neutral-900">Trekker Origin &amp; Package Performance</h2>
            <p className="mt-0.5 text-sm text-neutral-500">Origin breakdown and package performance for recent bookings.</p>
          </div>
          {rows.length > 0 && <button type="button" onClick={() => exportCsv("origin-performance.csv", rows.map((r) => ({ country: r.country, package: r.packageTitle ?? r.packageId, bookings: r.bookings, revenueNet: r.revenueNet, avgValue: r.avgValue, lastBooking: r.lastBooking })))} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-900 hover:bg-neutral-50"><Download className="h-3.5 w-3.5" /> Export</button>}
        </div>
        {origin.isLoading && <div className="mt-4 h-32 animate-pulse rounded-xl bg-neutral-100" />}
        {!origin.isLoading && rows.length === 0 && <p className="mt-4 text-sm text-neutral-500">No bookings with an origin country in this period.</p>}
        {rows.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-100">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.2em] text-neutral-500"><tr><th className="px-4 py-3">No</th><th className="px-4 py-3">Country</th><th className="px-4 py-3">Package</th><th className="px-4 py-3">Bookings</th><th className="px-4 py-3">Revenue (Net)</th><th className="px-4 py-3">Avg Value</th><th className="px-4 py-3">Last Booking</th></tr></thead>
              <tbody>{rows.map((r, i) => (
                <tr key={`${r.country}-${r.packageId}`} className="border-t border-neutral-100">
                  <td className="px-4 py-3 text-neutral-500">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-neutral-900">{r.country}</td>
                  <td className="px-4 py-3 text-neutral-700">{r.packageTitle ?? "Removed package"}</td>
                  <td className="px-4 py-3 text-neutral-700">{r.bookings}</td>
                  <td className="px-4 py-3 text-neutral-700">{money(r.revenueNet)}</td>
                  <td className="px-4 py-3 text-neutral-700">{money(r.avgValue)}</td>
                  <td className="px-4 py-3 text-neutral-500">{fmtDate(r.lastBooking)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-neutral-900">Top packages</h2>
          {packages.data && packages.data.topByBookings.length === 0 ? <p className="text-sm text-neutral-500">No package activity in this period.</p> : (
            <table className="w-full text-left text-sm"><thead className="text-[10px] uppercase tracking-[0.2em] text-neutral-500"><tr><th className="py-1">Package</th><th className="py-1">Bookings</th><th className="py-1">Revenue</th></tr></thead>
              <tbody>{(packages.data?.topByBookings ?? []).slice(0, 5).map((p) => <tr key={p.package_id} className="border-t border-neutral-100"><td className="py-2 font-semibold text-neutral-900">{p.title ?? "Removed package"}</td><td className="py-2">{p.bookings}</td><td className="py-2">{money(p.revenue)}</td></tr>)}</tbody></table>
          )}
        </section>
        <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-neutral-900">Guides</h2>
          {guides.data && guides.data.guides.length === 0 ? <p className="text-sm text-neutral-500">No guide assignments in this period.</p> : (
            <>
              {guides.data && <p className="text-xs text-neutral-500">{guides.data.summary.totalGuides} guides · {guides.data.summary.utilizationRate}% utilisation · {guides.data.summary.avgBookingsPerGuide} bookings per guide on average</p>}
              <ul className="space-y-1.5 text-sm">{(guides.data?.guides ?? []).slice(0, 5).map((g) => <li key={g.guide_id} className="flex justify-between border-t border-neutral-100 pt-1.5"><span className="font-semibold text-neutral-900">{g.name ?? "Unknown guide"}</span><span>{g.bookings} bookings</span></li>)}</ul>
            </>
          )}
        </section>
        <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-neutral-900">Customers</h2>
          {customers.data && customers.data.summary.totalCustomers === 0 ? <p className="text-sm text-neutral-500">No customer activity in this period.</p> : (
            <>
              {customers.data && <dl className="grid grid-cols-4 gap-2 text-center"><div><dt className="text-[11px] text-neutral-500">Total</dt><dd className="font-bold">{customers.data.summary.totalCustomers}</dd></div><div><dt className="text-[11px] text-neutral-500">New</dt><dd className="font-bold">{customers.data.summary.newCustomers}</dd></div><div><dt className="text-[11px] text-neutral-500">Returning</dt><dd className="font-bold">{customers.data.summary.returningCustomers}</dd></div><div><dt className="text-[11px] text-neutral-500">Retention</dt><dd className="font-bold">{customers.data.summary.retentionRate}%</dd></div></dl>}
              <ul className="space-y-1.5 text-sm">{(customers.data?.topCustomers ?? []).slice(0, 5).map((c) => <li key={c.trekker_id} className="flex justify-between border-t border-neutral-100 pt-1.5"><span className="font-semibold text-neutral-900">{c.name ?? "Customer"}</span><span>{c.bookings} · {money(c.revenue)}</span></li>)}</ul>
            </>
          )}
        </section>
      </div>
    </div>
    </FeatureGate>
  );
}
