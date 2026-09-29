'use client';

import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { siteApi, type SiteSection } from '@/lib/site/api';
import { useSite } from '@/lib/site/SiteContext';
import { BlogCard, DestinationCard, GalleryCard, PackageCard, Photo, ReviewList, VideoCard } from './Cards';
import { SiteLink } from './SiteShell';
import { GalleryLightbox } from './GalleryLightbox';

const HERO_HEIGHT: Record<string, string> = { SMALL: '240px', MEDIUM: '360px', LARGE: '480px', FULL: '640px' };
const cardsGrid = 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3';

function useContent<T>(key: string, load: (slug: string) => Promise<T>) {
  const { slug } = useSite();
  return useQuery({ queryKey: ['site', slug, key], queryFn: () => load(slug), staleTime: 60_000, retry: false });
}

function Block({ s, children }: { s: SiteSection; children: ReactNode }) {
  return (
    <section
      aria-label={s.title ?? s.type}
      style={{ backgroundColor: s.useThemeBg ? undefined : s.bgColor ?? undefined, color: s.useThemeText ? undefined : s.textColor ?? undefined, paddingTop: s.spacingTop ?? 32, paddingBottom: s.spacingBottom ?? 32 }}
    >
      <div className="mx-auto px-4" style={{ maxWidth: '72rem', width: `${Math.min(100, Math.max(25, s.widthPercent))}%` }}>{children}</div>
    </section>
  );
}
const Heading = ({ s }: { s: SiteSection }) => (s.title || s.subtitle ? <div className="mb-6">{s.title && <h2 className="text-2xl font-bold">{s.title}</h2>}{s.subtitle && <p className="mt-1 opacity-70">{s.subtitle}</p>}</div> : null);
const Empty = ({ children }: { children: ReactNode }) => <p className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm opacity-70">{children}</p>;
const pick = <T extends { id: string }>(rows: T[], s: SiteSection) => { const chosen = s.selectedIds.length ? rows.filter((r) => s.selectedIds.includes(r.id)) : rows; return s.itemCount ? chosen.slice(0, s.itemCount) : chosen; };

function Hero({ s }: { s: SiteSection }) {
  return (
    <section aria-label={s.title ?? 'Hero'} style={{ minHeight: HERO_HEIGHT[s.heroHeight ?? 'LARGE'], backgroundColor: s.useThemeBg ? 'var(--site-primary)' : s.bgColor ?? undefined }} className="relative flex items-center justify-center overflow-hidden text-center">
      {s.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      {s.overlayEnabled && <div className="absolute inset-0 bg-black/45" />}
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-12" style={{ color: s.useThemeText ? 'var(--site-on-primary)' : s.textColor ?? undefined }}>
        {s.title && <h1 className="text-4xl font-extrabold md:text-5xl">{s.title}</h1>}
        {s.subtitle && <p className="mt-3 text-lg opacity-90">{s.subtitle}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {s.ctaText && <SiteLink to={s.link || '/packages'}><span className="inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow hover:bg-neutral-100">{s.ctaText}</span></SiteLink>}
          {s.ctaText2 && s.ctaLink2 && <SiteLink to={s.ctaLink2}><span className="inline-block rounded-xl border border-white/70 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">{s.ctaText2}</span></SiteLink>}
        </div>
      </div>
    </section>
  );
}

function Marquee({ s }: { s: SiteSection }) {
  const dir = s.direction === 'RTL' ? 'reverse' : 'normal';
  const secs = Math.max(4, 60 - (s.speed ?? 20));
  return (
    <div role="region" aria-label="Banner" style={{ backgroundColor: s.useThemeBg ? 'var(--site-primary)' : s.bgColor ?? undefined, color: s.useThemeText ? 'var(--site-on-primary)' : s.textColor ?? undefined }} className="overflow-hidden whitespace-nowrap py-2 text-sm font-medium">
      <span style={{ animation: `site-marquee ${secs}s linear infinite ${dir}` }} className="inline-block pl-[100%]">{s.text}</span>
    </div>
  );
}

function Packages({ s }: { s: SiteSection }) {
  const { data, isLoading, isError } = useContent('packages', (slug) => siteApi.packages(slug));
  const rows = pick(data ?? [], s);
  return <Block s={s}><Heading s={s} />{isLoading ? <Empty>Loading…</Empty> : isError || rows.length === 0 ? <Empty>No packages yet — check back soon.</Empty> : <div className={cardsGrid}>{rows.map((p) => <PackageCard key={p.id} p={p} />)}</div>}</Block>;
}
function Destinations({ s }: { s: SiteSection }) {
  const { data, isLoading, isError } = useContent('destinations', (slug) => siteApi.destinations(slug));
  const rows = pick(data ?? [], s);
  return <Block s={s}><Heading s={s} />{isLoading ? <Empty>Loading…</Empty> : isError || rows.length === 0 ? <Empty>No destinations yet.</Empty> : <div className={cardsGrid}>{rows.map((d) => <DestinationCard key={d.id} d={d} />)}</div>}</Block>;
}
function Blogs({ s }: { s: SiteSection }) {
  const { data, isLoading, isError } = useContent('blogs', (slug) => siteApi.blogs(slug));
  const rows = pick(data ?? [], s);
  return <Block s={s}><Heading s={s} />{isLoading ? <Empty>Loading…</Empty> : isError || rows.length === 0 ? <Empty>No posts yet.</Empty> : <div className={cardsGrid}>{rows.map((b) => <BlogCard key={b.id} b={b} />)}</div>}</Block>;
}
function Gallery({ s }: { s: SiteSection }) {
  const { data, isLoading, isError } = useContent('gallery', (slug) => siteApi.gallery(slug));
  const [open, setOpen] = useState<import('@/lib/site/api').SiteGallery | null>(null);
  const rows = pick(data ?? [], s);
  return <Block s={s}><Heading s={s} />{isLoading ? <Empty>Loading…</Empty> : isError || rows.length === 0 ? <Empty>No photos yet.</Empty> : <div className={cardsGrid}>{rows.map((g) => <GalleryCard key={g.id} g={g} onOpen={setOpen} />)}</div>}<GalleryLightbox post={open} onClose={() => setOpen(null)} /></Block>;
}
function Videos({ s }: { s: SiteSection }) {
  const { data, isLoading, isError } = useContent('videos', (slug) => siteApi.videos(slug));
  const rows = pick(data ?? [], s);
  return <Block s={s}><Heading s={s} />{isLoading ? <Empty>Loading…</Empty> : isError || rows.length === 0 ? <Empty>No videos yet.</Empty> : <div className={cardsGrid}>{rows.map((v) => <VideoCard key={v.id} v={v} />)}</div>}</Block>;
}
function Reviews({ s }: { s: SiteSection }) {
  const { data, isLoading, isError } = useContent('reviews', (slug) => siteApi.reviews(slug));
  return <Block s={s}><Heading s={s} />{isLoading ? <Empty>Loading…</Empty> : isError || !data || data.reviews.length === 0 ? <Empty>No reviews yet.</Empty> : <ReviewList data={data} limit={s.itemCount ?? 6} />}</Block>;
}
function Categories({ s }: { s: SiteSection }) {
  const { data } = useContent('destinations', (slug) => siteApi.destinations(slug));
  const { href } = useSite();
  const cats = [...new Set((data ?? []).map((d) => d.category).filter((c): c is string => Boolean(c)))].slice(0, s.itemCount ?? 6);
  if (cats.length === 0) return null;
  return <Block s={s}><Heading s={s} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cats.map((c) => <a key={c} href={href('/destinations')} className="rounded-2xl border border-neutral-200 p-5 text-center font-semibold shadow-sm hover:shadow-md" style={{ borderColor: 'color-mix(in srgb, var(--site-primary) 30%, white)' }}>{c}</a>)}</div></Block>;
}
function Ads({ s }: { s: SiteSection }) {
  const { data } = useContent(`ads:${s.adPosition ?? ''}`, (slug) => siteApi.ads(slug, s.adPosition ?? undefined));
  const ad = data?.[0];
  if (!ad) return null;
  const img = <Photo src={ad.imageUrl} alt={ad.title} className="rounded-2xl" />;
  return <Block s={s}>{ad.linkUrl ? <SiteLink to={ad.linkUrl}>{img}</SiteLink> : img}</Block>;
}
function TextBlock({ s }: { s: SiteSection }) {
  return <Block s={s}><Heading s={s} />{s.text && <p style={{ fontSize: s.fontSize ?? undefined }} className="max-w-3xl whitespace-pre-line leading-relaxed">{s.text}</p>}</Block>;
}

/** Draws one section of the agency's page layout. */
export function SectionView({ s }: { s: SiteSection }) {
  switch (s.type) {
    case 'TOPBAR': return <Marquee s={s} />;
    case 'HERO': return <Hero s={s} />;
    case 'CATEGORIES': return <Categories s={s} />;
    case 'TEXTBLOCK': return <TextBlock s={s} />;
    case 'PACKAGES': return <Packages s={s} />;
    case 'DESTINATIONS': return <Destinations s={s} />;
    case 'BLOGS': return <Blogs s={s} />;
    case 'GALLERY': return <Gallery s={s} />;
    case 'VIDEOS': return <Videos s={s} />;
    case 'REVIEWS': return <Reviews s={s} />;
    case 'ADS': return <Ads s={s} />;
    default: return null;
  }
}
