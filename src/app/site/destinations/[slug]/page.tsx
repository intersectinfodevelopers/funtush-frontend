'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Photo, Stars } from '@/components/site/Cards';
import { Loading, Note } from '@/components/site/PageFrame';
import { siteApi } from '@/lib/site/api';
import { useSite } from '@/lib/site/SiteContext';

export default function DestinationDetailPage() {
  const { slug: dslug } = useParams<{ slug: string }>();
  const { slug, href } = useSite();
  const { data: d, isLoading, isError } = useQuery({ queryKey: ['site', slug, 'destination', dslug], queryFn: () => siteApi.destination(slug, dslug), staleTime: 60_000, retry: false });
  if (isLoading) return <div className="mx-auto max-w-5xl px-4 py-10"><Loading /></div>;
  if (isError || !d) return <div className="mx-auto max-w-5xl px-4 py-10"><Note>We couldn&apos;t find that destination. <Link href={href('/destinations')} className="font-semibold underline">All destinations</Link></Note></div>;
  const facts: [string, string][] = [
    d.region ? ['Region', d.region] : null, d.difficulty ? ['Difficulty', d.difficulty] : null, d.category ? ['Type', d.category] : null,
    d.durationMinDays != null ? ['Duration', `${d.durationMinDays}${d.durationMaxDays && d.durationMaxDays !== d.durationMinDays ? `–${d.durationMaxDays}` : ''} days`] : null,
    d.altitudeMaxM != null ? ['Altitude', `${d.altitudeMinM != null ? `${d.altitudeMinM.toLocaleString()}–` : 'up to '}${d.altitudeMaxM.toLocaleString()} m`] : null,
    d.bestTimeToVisit ? ['Best time', d.bestTimeToVisit] : null,
  ].filter((x): x is [string, string] => x !== null);
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <Photo src={d.featuredImage} alt={d.title} className="rounded-2xl" />
      <div><h1 className="text-3xl font-extrabold text-neutral-900">{d.title}</h1>{d.rating !== null && <p className="mt-1 flex items-center gap-2 text-sm text-neutral-600"><Stars value={d.rating} /> {d.rating} ({d.reviewCount})</p>}</div>
      {d.shortDescription && <p className="text-lg text-neutral-700">{d.shortDescription}</p>}
      {facts.length > 0 && <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">{facts.map(([k, v]) => <div key={k} className="rounded-xl border border-neutral-200 p-3"><dt className="text-xs text-neutral-500">{k}</dt><dd className="font-semibold text-neutral-900">{v}</dd></div>)}</dl>}
      {d.longDescription && <p className="whitespace-pre-line leading-relaxed text-neutral-700">{d.longDescription}</p>}
      {d.activities.length > 0 && <p className="flex flex-wrap gap-2">{d.activities.map((a) => <span key={a} className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700">{a}</span>)}</p>}
      {d.gallery.length > 0 && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{d.gallery.map((g) => <Image key={g} src={g} alt={d.title} width={800} height={600} unoptimized className="w-full rounded-xl object-cover" />)}</div>}
      <Link href={href('/packages')} className="inline-block rounded-xl px-5 py-2.5 font-semibold" style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)' }}>See our treks</Link>
    </div>
  );
}
