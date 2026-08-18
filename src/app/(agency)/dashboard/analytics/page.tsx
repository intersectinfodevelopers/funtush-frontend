'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BarChart3, CheckCircle2, Eye, TrendingUp } from 'lucide-react';
import { AnalyticsSummaryCard } from '@/components/shared/AnalyticsSummaryCard';
import SummarizedResult from '@/components/agency/analytics/SummarizedResult';

const metrics = [
  { label: 'Total Bookings', value: '24', tone: 'primary' as const, icon: CheckCircle2 },
  { label: 'Conversion Rate', value: '68%', tone: 'success' as const, icon: TrendingUp },
  { label: 'Total Views', value: '12,000', tone: 'accent' as const, icon: Eye },
  { label: 'Avg. Revenue', value: 'Rs. 84K', tone: 'warning' as const, icon: BarChart3 },
];

const agencyId = 'ag-001';

export default function Page() {
  const [period, setPeriod] = useState('Monthly');
  const values =
    period === 'Weekly'
      ? [35, 48, 42, 62, 58, 75, 68]
      : period === 'Yearly'
        ? [35, 52, 48, 70, 62, 78, 72, 84, 76, 91, 86, 96]
        : [42, 56, 50, 68, 61, 78, 72, 88, 80, 94, 86, 98];

  return (
    <div className="space-y-4">
      <SummarizedResult agencyId={agencyId} />
      <div>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/dashboard">Dashboard</Link>
          <span>/</span>
          <span className="font-semibold text-neutral-900">Analytics</span>
        </div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Expedition Analytics</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Track booking conversion, traffic, and customer performance.
            </p>
          </div>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
          >
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Yearly</option>
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <AnalyticsSummaryCard key={metric.label} {...metric} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Booking performance</h2>
              <p className="mt-1 text-xs text-neutral-500">{period} overview</p>
            </div>
            <BarChart3 className="h-4 w-4 text-primary-700" />
          </div>
          <div className="mt-6 flex h-56 items-end gap-2 border-b border-neutral-200">
            {values.map((value, index) => (
              <div key={index} className="flex flex-1 items-end">
                <div className="w-full rounded-t-md bg-primary-600" style={{ height: `${value}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-neutral-400">
            <span>Jan</span>
            <span>Mar</span>
            <span>Jun</span>
            <span>Sep</span>
            <span>Dec</span>
          </div>
        </section>
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-neutral-900">Traffic demographics</h2>
          <div className="mt-6 flex justify-center">
            <div
              className="relative h-36 w-36 rounded-full"
              style={{
                background:
                  'conic-gradient(var(--color-primary-700) 0 54%, var(--color-success-500) 54% 79%, var(--color-warning-500) 79% 100%)',
              }}
            >
              <div className="absolute inset-5 flex items-center justify-center rounded-full bg-white text-xl font-semibold text-neutral-900">
                100%
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-2 text-xs text-neutral-600">
            <p className="flex justify-between">
              <span>Organic search</span>
              <strong>54%</strong>
            </p>
            <p className="flex justify-between">
              <span>Social media</span>
              <strong>25%</strong>
            </p>
            <p className="flex justify-between">
              <span>Direct traffic</span>
              <strong>21%</strong>
            </p>
          </div>
        </section>
      </div>
      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Performance summary</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Summary label="Top destination" value="Everest Region" />
          <Summary label="Best channel" value="Organic Search" />
          <Summary label="Growth" value="12.5% this month" />
        </div>
      </section>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-50 p-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
