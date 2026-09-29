'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, MessageCircle, Mountain, X } from 'lucide-react';

import { SiteProvider, useSite, useSiteState } from '@/lib/site/SiteContext';
import type { NavLeaf, SiteBranding, SiteSeo } from '@/lib/site/api';

const isHttp = (u: string) => /^https?:\/\//i.test(u);

/** One link, wherever it points: a page on this site, or somewhere else. */
export function SiteLink({ to, external, newTab, className, children }: { to: string; external?: boolean; newTab?: boolean; className?: string; children: ReactNode }) {
  const { href } = useSite();
  if (external || isHttp(to)) return <a href={to} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined} className={className}>{children}</a>;
  return <Link href={href(to)} className={className}>{children}</Link>;
}
const NavLink = ({ item, className }: { item: NavLeaf; className?: string }) => <SiteLink to={item.url} external={item.linkType === 'EXTERNAL'} newTab={item.openInNewTab} className={className}>{item.label}</SiteLink>;

function TopBar() {
  const { config, slug } = useSite();
  const bar = config.topBar;
  const key = `site_topbar_${slug}`;
  const [closed, setClosed] = useState(() => { try { return typeof window !== 'undefined' && window.sessionStorage.getItem(key) === '1'; } catch { return false; } });
  if (!bar || closed) return null;
  const text = bar.behavior === 'SCROLLING'
    ? <div className="overflow-hidden whitespace-nowrap"><span className="inline-block animate-[site-marquee_18s_linear_infinite] pl-[100%]">{bar.text}</span></div>
    : <span>{bar.text}</span>;
  return (
    <div role="region" aria-label="Announcement" style={{ backgroundColor: bar.backgroundColor, color: bar.textColor }} className="flex items-center justify-center gap-3 px-4 py-2 text-center text-sm font-medium">
      <div className="min-w-0 flex-1">{bar.linkUrl ? <SiteLink to={bar.linkUrl} className="underline-offset-2 hover:underline">{text}</SiteLink> : text}</div>
      {bar.dismissible && <button type="button" aria-label="Dismiss announcement" onClick={() => { setClosed(true); try { window.sessionStorage.setItem(key, '1'); } catch { /* ignore */ } }} className="shrink-0 rounded p-1 opacity-80 hover:opacity-100"><X className="h-4 w-4" /></button>}
    </div>
  );
}

function Header() {
  const { branding, nav, page, href } = useSite();
  const [open, setOpen] = useState(false);
  const centered = page.header.style === 'CENTERED';
  const ctaText = nav.bookNow.label || page.header.ctaText || 'Book Now';
  const ctaLink = page.header.ctaLink || '/packages';
  const brand = (
    <Link href={href('/')} className="flex items-center gap-2 font-bold text-neutral-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {branding.logoUrl ? <img src={branding.logoUrl} alt={branding.brandName} style={{ width: branding.logoWidth, maxWidth: '60vw' }} className="h-auto" /> : <><Mountain className="h-6 w-6" style={{ color: 'var(--site-primary)' }} /><span className="text-lg">{branding.brandName}</span></>}
    </Link>
  );
  const links = (
    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
      {nav.items.map((it) => it.children.length ? (
        <div key={it.label} className="group relative">
          <span className="inline-flex cursor-default items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100">{it.label}<ChevronDown className="h-3.5 w-3.5" /></span>
          <div className="invisible absolute left-0 top-full z-30 min-w-48 rounded-xl border border-neutral-200 bg-white p-1 opacity-0 shadow-lg group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
            {it.children.map((c) => <NavLink key={c.label + c.url} item={c} className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" />)}
          </div>
        </div>
      ) : <NavLink key={it.label + it.url} item={it} className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100" />)}
    </nav>
  );
  const cta = !nav.bookNow.hidden && <SiteLink to={ctaLink} className="rounded-xl px-4 py-2 text-sm font-semibold hover:opacity-90" ><span style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)' }} className="-mx-4 -my-2 block rounded-xl px-4 py-2">{ctaText}</span></SiteLink>;
  return (
    <header className={`${page.header.sticky ? 'sticky top-0' : ''} z-40 border-b border-neutral-200 bg-white/95 backdrop-blur`}>
      <div className={`mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 ${centered ? 'flex-col md:flex-row md:justify-center' : 'justify-between'}`}>
        {brand}
        {links}
        <div className="flex items-center gap-2">
          {cta}
          <button type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="rounded-lg p-2 hover:bg-neutral-100 md:hidden"><Menu className="h-5 w-5" /></button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="border-t border-neutral-200 bg-white px-4 py-2 md:hidden">
          {nav.items.flatMap((it) => [it, ...it.children]).map((it) => <NavLink key={it.label + it.url} item={it} className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100" />)}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const { branding, config, social, about, nav, page } = useSite();
  const socials = [['Facebook', social.facebookUrl], ['Instagram', social.instagramUrl], ['TikTok', social.tiktokUrl], ['YouTube', social.youtubeUrl]].filter((x): x is [string, string] => Boolean(x[1]));
  const style = page.footer.style;
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-900 text-neutral-300">
      <div className={`mx-auto grid max-w-6xl gap-8 px-4 py-10 ${style === 'BASIC' ? '' : 'md:grid-cols-3'}`}>
        <div><p className="text-lg font-bold text-white">{branding.brandName}</p>{about.description && <p className="mt-2 line-clamp-4 text-sm text-neutral-400">{about.description}</p>}</div>
        {style !== 'BASIC' && <div><p className="text-sm font-semibold text-white">Explore</p><ul className="mt-2 space-y-1 text-sm">{nav.items.map((it) => <li key={it.label + it.url}><NavLink item={it} className="hover:text-white" /></li>)}</ul></div>}
        <div className="space-y-1 text-sm">
          {style !== 'BASIC' && <p className="font-semibold text-white">Contact</p>}
          {about.address && <p>{about.address}</p>}
          {about.phones.map((p) => <p key={p}><a href={`tel:${p.replace(/\s/g, '')}`} className="hover:text-white">{p}</a></p>)}
          {about.emails.map((e) => <p key={e}><a href={`mailto:${e}`} className="hover:text-white">{e}</a></p>)}
          {socials.length > 0 && <p className="flex flex-wrap gap-3 pt-2">{socials.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-white hover:underline">{n}</a>)}</p>}
        </div>
      </div>
      <div className="border-t border-neutral-800 px-4 py-4 text-center text-xs text-neutral-500">© {new Date().getFullYear()} {branding.brandName}{config.showFuntushBadge && <> · Powered by <a href="https://funtush.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-300">Funtush</a></>}</div>
    </footer>
  );
}

function Popup() {
  const { config, slug } = useSite();
  const p = config.popup;
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!p) return;
    const key = `site_popup_${slug}`;
    const seen = (() => { try { return { s: window.sessionStorage.getItem(key), l: Number(window.localStorage.getItem(key) ?? 0) }; } catch { return { s: null, l: 0 }; } })();
    const allowed = p.frequency === 'EVERY_VISIT' || (p.frequency === 'ONCE_PER_SESSION' && !seen.s) || (p.frequency === 'ONCE_PER_DAY' && Date.now() - seen.l > 86_400_000) || (p.frequency === 'ONCE_EVER' && !seen.l);
    if (!allowed) return;
    const show = () => { setOpen(true); try { window.sessionStorage.setItem(key, '1'); window.localStorage.setItem(key, String(Date.now())); } catch { /* ignore */ } };
    if (p.trigger === 'ON_LOAD') { const t = window.setTimeout(show, 0); return () => window.clearTimeout(t); }
    if (p.trigger === 'ON_EXIT_INTENT' && window.matchMedia('(hover: hover)').matches) {
      const onLeave = (e: MouseEvent) => { if (e.clientY <= 0) { show(); document.removeEventListener('mouseleave', onLeave); } };
      document.addEventListener('mouseleave', onLeave);
      return () => document.removeEventListener('mouseleave', onLeave);
    }
    const t = window.setTimeout(show, Math.max(0, p.delaySeconds) * 1000);
    return () => window.clearTimeout(t);
  }, [p, slug]);
  if (!p || !open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={p.title} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setOpen(false)}>
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="absolute right-3 top-3 rounded p-1 hover:bg-neutral-100"><X className="h-4 w-4" /></button>
        <h2 className="pr-6 text-xl font-bold text-neutral-900">{p.title}</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-neutral-600">{p.body}</p>
        {p.ctaLabel && p.ctaUrl && <SiteLink to={p.ctaUrl} className="mt-4 inline-block"><span onClick={() => setOpen(false)} style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)' }} className="inline-block rounded-xl px-4 py-2 text-sm font-semibold">{p.ctaLabel}</span></SiteLink>}
      </div>
    </div>
  );
}

/**
 * Sets the page title/meta/favicon for this agency and returns a function that undoes it. Only elements THIS
 * creates (marked data-funtush-site) are touched or removed: Next manages the other <head> nodes itself, and
 * editing those made route changes throw.
 */
function applyHead(seo: SiteSeo, branding: SiteBranding): () => void {
  const prevTitle = document.title;
  document.title = seo.metaTitle || branding.brandName;
  const made: HTMLElement[] = [];
  const add = (el: HTMLElement) => {
    el.dataset.funtushSite = '1';
    document.head.appendChild(el);
    made.push(el);
  };
  const meta = (attr: 'name' | 'property', key: string, content: string | null) => {
    if (!content) return;
    const el = document.createElement('meta');
    el.setAttribute(attr, key);
    el.content = content;
    add(el);
  };
  meta('name', 'description', seo.metaDescription);
  meta('property', 'og:title', seo.metaTitle || branding.brandName);
  meta('property', 'og:description', seo.metaDescription);
  meta('property', 'og:image', seo.ogImageUrl);
  if (branding.faviconUrl) {
    const l = document.createElement('link');
    l.rel = 'icon';
    l.href = branding.faviconUrl;
    add(l);
  }
  return () => {
    document.title = prevTitle;
    for (const el of made) el.parentNode?.removeChild(el);
  };
}

function Chrome({ children }: { children: ReactNode }) {
  const { branding, seo, social } = useSite();
  useEffect(() => applyHead(seo, branding), [seo, branding]);
  return (
    <div style={{ ['--site-primary' as string]: branding.primaryColor, ['--site-on-primary' as string]: branding.onPrimaryColor, fontFamily: branding.fontStack }} className="min-h-screen bg-white text-neutral-900">
      <style>{'@keyframes site-marquee{from{transform:translateX(0)}to{transform:translateX(-100%)}}'}</style>
      <TopBar />
      <Header />
      <main>{children}</main>
      <Footer />
      <Popup />
      {social.whatsappLink && <a href={social.whatsappLink} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105"><MessageCircle className="h-6 w-6" /></a>}
    </div>
  );
}

function Message({ title, children }: { title: string; children?: ReactNode }) {
  return <main className="grid min-h-screen place-items-center bg-neutral-50 p-6 text-center"><div className="max-w-md"><Mountain className="mx-auto h-10 w-10 text-neutral-400" /><h1 className="mt-4 text-2xl font-bold text-neutral-900">{title}</h1><div className="mt-2 text-neutral-600">{children}</div></div></main>;
}

/** Wraps every /site page: resolves which agency this is, shows the right state, and provides the shared data. */
export default function SiteShell({ children }: { children: ReactNode }) {
  const state = useSiteState();
  if (state.status === 'no-slug') return <Message title="No site selected">Open this page from an agency&apos;s address, e.g. <code>your-agency.funtush.io</code>, or add <code>?site=your-agency</code> to the link.</Message>;
  if (state.status === 'loading') return <div className="grid min-h-screen place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-600" role="status" aria-label="Loading" /></div>;
  if (state.status === 'error') {
    const e = state.error;
    if (e.comingSoon) return <Message title={e.comingSoon.headline}>{e.comingSoon.message}</Message>;
    if (e.status === 404) return <Message title="Site not found">We couldn&apos;t find that agency&apos;s website.</Message>;
    return <Message title="This site is unavailable">Please try again in a little while.</Message>;
  }
  return <SiteProvider value={state.value}><Chrome>{children}</Chrome></SiteProvider>;
}
