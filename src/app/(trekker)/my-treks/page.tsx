'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Users } from 'lucide-react';

import { Pagination } from '@/components/ui/pagination';
import { useTrekDashboard } from '@/hooks/useTrekker';
import type { TrekSection } from '@/lib/api/trekker';

const TABS: { id: TrekSection; label: string }[] = [{ id: 'upcoming', label: 'Upcoming' }, { id: 'active', label: 'On the trail' }, { id: 'completed', label: 'Completed' }];
const STATUS: Record<string, string> = { INQUIRY: 'Awaiting the agency', ALTERNATIVE_PROPOSED: 'New date proposed', CONFIRMED: 'Confirmed', PAYMENT_PENDING: 'Payment due', PAID: 'Paid', ACTIVE: 'On the trail', COMPLETED: 'Completed' };
const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function MyTreksPage() {
  const [section, setSection] = useState<TrekSection>('upcoming');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useTrekDashboard(section, page);
  const rows = data?.data ?? [];

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-neutral-900">My treks</h1><p className="mt-1 text-sm text-neutral-600">Your bookings and what&apos;s next.</p></div>
      <div role="tablist" aria-label="Trek status" className="inline-flex rounded-xl border border-neutral-200 bg-white p-1">
        {TABS.map((t) => <button key={t.id} type="button" role="tab" aria-selected={section === t.id} onClick={() => { setSection(t.id); setPage(1); }} className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${section === t.id ? 'bg-primary-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>{t.label}{data && <span className="ml-1.5 text-xs opacity-70">{data.counts[t.id]}</span>}</button>)}
      </div>
      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load your treks.</p>}
      {isLoading ? <div className="h-32 animate-pulse rounded-2xl bg-white" /> : rows.length === 0 && !isError ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center"><p className="text-neutral-600">{section === 'upcoming' ? "You don't have any upcoming treks." : section === 'active' ? "You're not on a trek right now." : 'No completed treks yet.'}</p>{section === 'upcoming' && <Link href="/discovery" className="mt-3 inline-block font-semibold text-primary-700 hover:underline">Find your next trek</Link>}</div>
      ) : (
        <ul className="space-y-3">{rows.map((t) => (
          <li key={t.bookingId}><Link href={`/my-treks/${t.bookingId}`} className="block rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-lg font-bold text-neutral-900">{t.packageTitle}</h2><p className="text-sm text-neutral-500">with {t.agencyName}</p></div><span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{STATUS[t.status] ?? t.status}</span></div>
            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-600"><span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />{fmt(t.startDate)} – {fmt(t.endDate)}</span><span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" />{t.groupSize} {t.groupSize === 1 ? 'person' : 'people'}</span>{section === 'upcoming' && t.daysUntilStart >= 0 && <span className="font-semibold text-neutral-900">{t.daysUntilStart === 0 ? 'Starts today' : `In ${t.daysUntilStart} day${t.daysUntilStart === 1 ? '' : 's'}`}</span>}</p>
          </Link></li>
        ))}</ul>
      )}
      <Pagination currentPage={page} totalPages={Math.max(1, data?.meta.pages ?? 1)} onPageChange={setPage} />
    </div>
  );
}
