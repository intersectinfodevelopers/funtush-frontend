'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { useTrekDashboard } from '@/hooks/useTrekker';

const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function TrekkerReviewsPage() {
  const { data, isLoading, isError } = useTrekDashboard('completed', 1);
  const rows = data?.data ?? [];
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div><h1 className="text-2xl font-bold text-neutral-900">Reviews</h1><p className="mt-1 text-sm text-neutral-600">After you finish a trek, the agency emails you a personal link to review it. Only trekkers who completed a trek can review, so reviews stay trustworthy.</p></div>
      {isError && <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load your completed treks.</p>}
      {isLoading ? <div className="h-32 animate-pulse rounded-2xl bg-white" /> : rows.length === 0 ? <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-neutral-500">You haven&apos;t completed a trek yet. <Link href="/discovery" className="font-semibold text-primary-700 hover:underline">Find one</Link></p> : (
        <ul className="space-y-3">{rows.map((t) => <li key={t.bookingId} className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4"><div><p className="font-semibold text-neutral-900">{t.packageTitle}</p><p className="text-sm text-neutral-500">{t.agencyName} · finished {fmt(t.endDate)}</p></div><span className="inline-flex items-center gap-1 text-sm text-neutral-500"><Star className="h-4 w-4" /> Check your email for the review link</span></li>)}</ul>
      )}
    </div>
  );
}
