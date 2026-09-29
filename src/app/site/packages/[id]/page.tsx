'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, Mountain, Users } from 'lucide-react';
import { Photo } from '@/components/site/Cards';
import { Loading, Note } from '@/components/site/PageFrame';
import { siteApi } from '@/lib/site/api';
import { useSite } from '@/lib/site/SiteContext';

const DIFF: Record<string, string> = { EASY: 'Easy', MODERATE: 'Moderate', CHALLENGING: 'Challenging', DIFFICULT: 'Difficult' };
const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function PackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { slug, href, money } = useSite();
  const [shown, setShown] = useState(0);
  const { data: p, isLoading, isError } = useQuery({ queryKey: ['site', slug, 'package', id], queryFn: () => siteApi.package(slug, id), staleTime: 60_000, retry: false });
  if (isLoading) return <div className="mx-auto max-w-6xl px-4 py-10"><Loading /></div>;
  if (isError || !p) return <div className="mx-auto max-w-6xl px-4 py-10"><Note>We couldn&apos;t find that trek. <Link href={href('/packages')} className="font-semibold underline">See all treks</Link></Note></div>;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Photo src={p.photos?.[shown] ?? p.photos?.[0]} alt={p.title} className="rounded-2xl" />
          {p.photos?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Photos">
              {p.photos.map((u, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <button key={u} type="button" onClick={() => setShown(i)} aria-label={`Show photo ${i + 1}`} aria-pressed={i === shown} className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${i === shown ? 'border-[var(--site-primary)]' : 'border-transparent'}`}><img src={u} alt="" className="h-full w-full object-cover" /></button>
              ))}
            </div>
          )}
          <div><h1 className="text-3xl font-extrabold text-neutral-900">{p.title}</h1>
            <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-600"><span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {p.durationDays} days</span><span className="inline-flex items-center gap-1"><Mountain className="h-4 w-4" /> {DIFF[p.difficulty] ?? p.difficulty}</span><span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> up to {p.maxGroupSize} people</span></p></div>
          {(p.shortSummary || p.category || p.region || p.bestTimeToVisit || p.altitudeMaxM) && (
            <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 text-sm">
              {p.shortSummary && <p className="font-medium text-neutral-800">{p.shortSummary}</p>}
              <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {p.category && <div><dt className="text-neutral-500">Category</dt><dd className="font-semibold">{p.category}</dd></div>}
                {p.region && <div><dt className="text-neutral-500">Region</dt><dd className="font-semibold">{p.region}</dd></div>}
                {p.bestTimeToVisit && <div><dt className="text-neutral-500">Best time to visit</dt><dd className="font-semibold">{p.bestTimeToVisit}</dd></div>}
                {(p.altitudeMinM != null || p.altitudeMaxM != null) && <div><dt className="text-neutral-500">Altitude</dt><dd className="font-semibold">{[p.altitudeMinM, p.altitudeMaxM].filter((v) => v != null).map((v) => `${Number(v).toLocaleString('en-US')} m`).join(' – ')}</dd></div>}
                {p.activities.length > 0 && <div><dt className="text-neutral-500">Activities</dt><dd className="font-semibold">{p.activities.join(', ')}</dd></div>}
                {p.routes.length > 0 && <div><dt className="text-neutral-500">Routes &amp; trails</dt><dd className="font-semibold">{p.routes.join(', ')}</dd></div>}
              </dl>
            </div>
          )}
          {p.description && <p className="whitespace-pre-line leading-relaxed text-neutral-700">{p.description}</p>}
          {p.itineraries.length > 0 && (
            <section aria-label="Itinerary"><h2 className="mb-3 text-xl font-bold">Itinerary</h2>
              <ol className="space-y-3">{p.itineraries.map((d) => <li key={d.dayNumber} className="rounded-xl border border-neutral-200 p-4"><p className="font-semibold text-neutral-900">Day {d.dayNumber}{d.location ? ` — ${d.location}` : ''}{d.altitudeM ? <span className="ml-2 text-xs font-normal text-neutral-500">{d.altitudeM.toLocaleString()} m</span> : null}</p>{d.description && <p className="mt-1 text-sm text-neutral-600">{d.description}</p>}</li>)}</ol>
            </section>
          )}
        </div>
        <aside className="h-fit space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <p className="text-sm text-neutral-500">from</p>
          <p className="text-3xl font-extrabold text-neutral-900">{money(p.pricePerPerson, p.currency)}<span className="text-sm font-medium text-neutral-500"> / person</span></p>
          {p.volumeDiscounts.length > 0 && (
            <div><p className="mb-1 text-sm font-semibold text-neutral-700">Group discounts</p>
              <ul className="space-y-1 text-sm text-neutral-700">{p.volumeDiscounts.map((t) => <li key={t.minPeople} className="flex justify-between"><span>{t.minPeople}+ people</span><span className="font-semibold">{t.percentOff}% off</span></li>)}</ul>
            </div>
          )}
          <div><p className="mb-1 text-sm font-semibold text-neutral-700">Upcoming departures</p>
            {p.departures.length === 0 ? <p className="text-sm text-neutral-500">No open departures right now — contact us for private dates.</p> : <ul className="space-y-1 text-sm">{p.departures.slice(0, 6).map((d) => <li key={d.id} className="flex items-center justify-between"><span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-neutral-400" /> {fmt(d.startDate)}</span><span className="text-neutral-500">{d.seatsLeft} seat{d.seatsLeft === 1 ? '' : 's'} left</span></li>)}</ul>}
          </div>
          {p.departures.length > 0 && <Link href={href(`/book/${p.id}`)} className="block rounded-xl px-4 py-3 text-center font-semibold hover:opacity-90" style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)' }}>Book this trek</Link>}
        </aside>
      </div>
    </div>
  );
}
