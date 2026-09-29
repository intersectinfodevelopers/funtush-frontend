'use client';

import Link from 'next/link';
import { Calendar, Clock, MapPin, Mountain, Play, Star } from 'lucide-react';
import { useSite } from '@/lib/site/SiteContext';
import type { SiteBlog, SiteDestination, SiteGallery, SitePackage, SiteReviews, SiteVideo } from '@/lib/site/api';

export const youtubeId = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null;
    if (u.pathname === '/watch') return u.searchParams.get('v');
    return /^\/(?:embed|shorts)\/([^/]+)/.exec(u.pathname)?.[1] ?? null;
  } catch { return null; }
};

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const DIFF: Record<string, string> = { EASY: 'Easy', MODERATE: 'Moderate', CHALLENGING: 'Challenging', DIFFICULT: 'Difficult' };

/** Cards have a photo slot; without an image it falls back to a tinted mountain. */
export function Photo({ src, alt, className = '' }: { src?: string | null; alt: string; className?: string }) {
  const { branding } = useSite();
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img src={src} alt={alt} loading="lazy" style={{ aspectRatio: branding.cardImageRatioValue }} className={`w-full object-cover ${className}`} />;
  return <div aria-hidden style={{ aspectRatio: branding.cardImageRatioValue, background: 'linear-gradient(135deg, color-mix(in srgb, var(--site-primary) 22%, white), color-mix(in srgb, var(--site-primary) 55%, white))' }} className={`grid w-full place-items-center ${className}`}><Mountain className="h-10 w-10 text-white/80" /></div>;
}

export function Stars({ value }: { value: number }) {
  return <span role="img" aria-label={`${value} out of 5`} className="inline-flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-4 w-4 ${n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />)}</span>;
}

export function PackageCard({ p }: { p: SitePackage }) {
  const { href, money } = useSite();
  return (
    <Link href={href(`/packages/${p.slug}`)} className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">
      <Photo src={p.photos?.[0]} alt={p.title} className="transition group-hover:scale-[1.02]" />
      <div className="space-y-2 p-4">
        <h3 className="font-bold text-neutral-900">{p.title}{p.isFeatured && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 align-middle text-[10px] font-semibold text-amber-800">Featured</span>}</h3>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500"><span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {p.durationDays} days</span><span>{DIFF[p.difficulty] ?? p.difficulty}</span>{p.nextDeparture && <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {fmtDate(p.nextDeparture)}</span>}</p>
        {(p.shortSummary || p.description) && <p className="line-clamp-2 text-sm text-neutral-600">{p.shortSummary || p.description}</p>}
        <p className="text-sm text-neutral-500">from <strong className="text-lg text-neutral-900">{money(p.pricePerPerson, p.currency)}</strong> / person</p>
      </div>
    </Link>
  );
}

export function DestinationCard({ d }: { d: SiteDestination }) {
  const { href } = useSite();
  return (
    <Link href={href(`/destinations/${d.slug}`)} className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">
      <Photo src={d.featuredImage} alt={d.title} />
      <div className="space-y-1.5 p-4">
        <h3 className="font-bold text-neutral-900">{d.title}</h3>
        <p className="flex flex-wrap items-center gap-x-3 text-xs text-neutral-500">{d.region && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {d.region}</span>}{d.difficulty && <span>{d.difficulty}</span>}{d.durationMinDays != null && <span>{d.durationMinDays}{d.durationMaxDays && d.durationMaxDays !== d.durationMinDays ? `–${d.durationMaxDays}` : ''} days</span>}</p>
        {d.shortDescription && <p className="line-clamp-2 text-sm text-neutral-600">{d.shortDescription}</p>}
      </div>
    </Link>
  );
}

export function BlogCard({ b }: { b: SiteBlog }) {
  const { href } = useSite();
  return (
    <Link href={href(`/blog/${b.id}`)} className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">
      <Photo src={b.photos[0]} alt={b.title} />
      <div className="space-y-1.5 p-4"><p className="text-xs text-neutral-500">{fmtDate(b.createdAt)}{b.tag ? ` · ${b.tag}` : ''}</p><h3 className="font-bold text-neutral-900">{b.title}</h3><p className="line-clamp-2 text-sm text-neutral-600">{b.subtitle}</p></div>
    </Link>
  );
}

export function GalleryCard({ g, onOpen }: { g: SiteGallery; onOpen?: (g: SiteGallery) => void }) {
  return (
    <button type="button" onClick={() => onOpen?.(g)} className="group block w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-sm transition hover:shadow-md">
      <Photo src={g.featuredImage ?? g.images[0]} alt={g.title} />
      <div className="p-3"><p className="font-semibold text-neutral-900">{g.title}</p><p className="text-xs text-neutral-500">{g.images.length} photo{g.images.length === 1 ? '' : 's'}{g.category ? ` · ${g.category}` : ''}</p></div>
    </button>
  );
}

export function VideoCard({ v }: { v: SiteVideo }) {
  const id = youtubeId(v.youtubeUrl);
  return (
    <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative">
        <Photo src={v.thumbnailUrl ?? (id ? `https://img.youtube.com/vi/${encodeURIComponent(id)}/hqdefault.jpg` : null)} alt={v.title} />
        <span className="absolute inset-0 grid place-items-center"><span className="grid h-12 w-12 place-items-center rounded-full bg-black/60 text-white group-hover:bg-black/75"><Play className="h-5 w-5 fill-white" /></span></span>
      </div>
      <div className="p-3"><p className="font-semibold text-neutral-900">{v.title}</p>{v.description && <p className="line-clamp-2 text-sm text-neutral-600">{v.description}</p>}</div>
    </a>
  );
}

export function ReviewList({ data, limit }: { data: SiteReviews; limit?: number }) {
  const rows = limit ? data.reviews.slice(0, limit) : data.reviews;
  return (
    <div className="space-y-4">
      {data.average !== null && <p className="flex items-center gap-2 text-sm text-neutral-600"><Stars value={data.average} /> <strong className="text-neutral-900">{data.average}</strong> from {data.count} review{data.count === 1 ? '' : 's'}</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <figure key={r.id} className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <Stars value={r.rating} />
            {r.title && <p className="font-semibold text-neutral-900">{r.title}</p>}
            <blockquote className="text-sm text-neutral-700">{r.text}</blockquote>
            <figcaption className="text-xs text-neutral-500">{r.author}{r.country ? `, ${r.country}` : ''} · {fmtDate(r.createdAt)}</figcaption>
            {r.reply && <p className="rounded-lg bg-neutral-50 p-2 text-xs text-neutral-600"><strong>Reply from the agency:</strong> {r.reply}</p>}
          </figure>
        ))}
      </div>
    </div>
  );
}
