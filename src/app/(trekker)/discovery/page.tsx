'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, Mountain, Star } from 'lucide-react';

import { Pagination } from '@/components/ui/pagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useMarketSearch } from '@/hooks/useTrekker';
import type { MarketPackage } from '@/lib/api/trekker';

const field = 'rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100';
const DIFF: Record<string, string> = { EASY: 'Easy', MODERATE: 'Moderate', CHALLENGING: 'Challenging', DIFFICULT: 'Difficult' };

function Card({ p }: { p: MarketPackage }) {
  // The agency's own site holds the itinerary, open departures and the booking form.
  const to = p.agencySlug ? `/site/packages/${encodeURIComponent(p.slug)}?site=${encodeURIComponent(p.agencySlug)}` : null;
  const body = (
    <article className="h-full space-y-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {p.sponsored && <span className="rounded-full bg-warning-50 px-2 py-0.5 text-[10px] font-bold uppercase text-warning-700">Sponsored</span>}
      <h2 className="text-lg font-bold text-neutral-900">{p.title}</h2>
      <p className="text-sm text-neutral-500">by {p.agencyName}{p.agencyRating > 0 && <span className="ml-2 inline-flex items-center gap-0.5"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{p.agencyRating.toFixed(1)}</span>}</p>
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500"><span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{p.duration} days</span><span className="inline-flex items-center gap-1"><Mountain className="h-3.5 w-3.5" />{DIFF[p.difficulty] ?? p.difficulty}</span>{p.altitude > 0 && <span>up to {p.altitude.toLocaleString()} m</span>}</p>
      {p.description && <p className="line-clamp-2 text-sm text-neutral-600">{p.description}</p>}
      <p className="pt-1 text-sm text-neutral-500">from <strong className="text-lg text-neutral-900">{p.price.toLocaleString('en-US')}</strong> / person</p>
    </article>
  );
  return to ? <Link href={to} className="block">{body}</Link> : body;
}

export default function DiscoveryPage() {
  const [q, setQ] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [maxDays, setMaxDays] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebouncedValue(q.trim());
  const { data, isLoading, isError, isFetching } = useMarketSearch({ q: dq || undefined, difficulty: difficulty || undefined, price_max: maxPrice ? Number(maxPrice) : undefined, duration_max: maxDays ? Number(maxDays) : undefined, page, limit: 12 });
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };
  const rows = data?.data ?? [];

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-neutral-900">Discover treks</h1><p className="mt-1 text-sm text-neutral-600">Guided treks from verified agencies.</p></div>
      <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_160px_140px_140px]">
        <input type="search" aria-label="Search treks" placeholder="Search treks, places, agencies…" value={q} onChange={(e) => reset(setQ)(e.target.value)} className={`${field} w-full`} />
        <select aria-label="Difficulty" value={difficulty} onChange={(e) => reset(setDifficulty)(e.target.value)} className={field}><option value="">Any difficulty</option>{Object.entries(DIFF).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <input type="number" min={0} aria-label="Maximum price" placeholder="Max price" value={maxPrice} onChange={(e) => reset(setMaxPrice)(e.target.value)} className={field} />
        <input type="number" min={1} aria-label="Maximum days" placeholder="Max days" value={maxDays} onChange={(e) => reset(setMaxDays)(e.target.value)} className={field} />
      </div>
      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load treks. Please try again.</p>}
      {isLoading ? <div className="h-40 animate-pulse rounded-2xl bg-white" /> : rows.length === 0 && !isError ? <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-500">No treks match your search.</p> : (
        <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? 'opacity-70' : ''}`}>{rows.map((p) => <Card key={p.id} p={p} />)}</div>
      )}
      <Pagination currentPage={page} totalPages={Math.max(1, data?.meta.pages ?? 1)} onPageChange={setPage} />
    </div>
  );
}
