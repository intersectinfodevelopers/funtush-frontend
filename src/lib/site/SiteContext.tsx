'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { siteApi, SiteError, type SiteAbout, type SiteBranding, type SiteConfig, type SiteNav, type SitePage, type SiteSeo, type SiteSocial } from './api';
import { ServerSlugContext, siteHref, useSiteSlug } from './slug';

interface SiteValue {
  slug: string;
  branding: SiteBranding;
  config: SiteConfig;
  nav: SiteNav;
  social: SiteSocial;
  seo: SiteSeo;
  page: SitePage;
  about: SiteAbout;
  /** Internal link for this site, correct on a subdomain and on a plain preview URL. */
  href: (path: string) => string;
  /** Formats a price the way the agency set up (symbol / code / both). */
  money: (n: number, currency?: string) => string;
}

const Ctx = createContext<SiteValue | null>(null);
export const useSite = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSite must be used inside <SiteProvider>');
  return v;
};

export type SiteState =
  | { status: 'no-slug' }
  | { status: 'loading' }
  | { status: 'error'; error: SiteError }
  | { status: 'ready'; value: SiteValue };

const SYMBOL: Record<string, string> = { NPR: 'Rs', USD: '$', EUR: '€', GBP: '£', INR: '₹' };
const q = { staleTime: 60_000, retry: false } as const;

/** Loads everything the shared chrome needs, once, and exposes it to every page of the site. */
export function useSiteState(): SiteState {
  const slug = useSiteSlug();
  const onSubdomain = useContext(ServerSlugContext) !== null; // the server rendered this as a tenant subdomain, so links must match
  const on = { enabled: Boolean(slug), ...q };
  const config = useQuery({ queryKey: ['site', slug, 'config'], queryFn: () => siteApi.config(slug!), ...on });
  const branding = useQuery({ queryKey: ['site', slug, 'branding'], queryFn: () => siteApi.branding(slug!), ...on });
  const nav = useQuery({ queryKey: ['site', slug, 'nav'], queryFn: () => siteApi.navigation(slug!), ...on });
  const social = useQuery({ queryKey: ['site', slug, 'social'], queryFn: () => siteApi.social(slug!), ...on });
  const seo = useQuery({ queryKey: ['site', slug, 'seo'], queryFn: () => siteApi.seo(slug!), ...on });
  const page = useQuery({ queryKey: ['site', slug, 'page'], queryFn: () => siteApi.page(slug!), ...on });
  const about = useQuery({ queryKey: ['site', slug, 'about'], queryFn: () => siteApi.about(slug!), ...on });

  return useMemo<SiteState>(() => {
    if (!slug) return { status: 'no-slug' };
    const failed = [config, branding, nav, social, seo, page, about].find((x) => x.isError);
    // A 503 (unpublished / under construction) hits every gated route; report the first meaningful error.
    if (failed?.error) return { status: 'error', error: failed.error as SiteError };
    if (!config.data || !branding.data || !nav.data || !social.data || !seo.data || !page.data || !about.data) return { status: 'loading' };
    const b = branding.data;
    const money = (n: number, currency?: string) => {
      if (currency && currency !== b.currencyCode && SYMBOL[currency]) return `${SYMBOL[currency]} ${Math.round(n).toLocaleString('en-US')}`;
      const num = Math.round(n).toLocaleString('en-US');
      return b.currencyDisplay === 'CODE' ? `${b.currencyCode} ${num}` : b.currencyDisplay === 'SYMBOL_CODE' ? `${b.currencySymbol} ${num} ${b.currencyCode}` : `${b.currencySymbol} ${num}`;
    };
    return { status: 'ready', value: { slug, branding: b, config: config.data, nav: nav.data, social: social.data, seo: seo.data, page: page.data, about: about.data, href: (p) => siteHref(slug, p, onSubdomain), money } };
  }, [slug, onSubdomain, config, branding, nav, social, seo, page, about]);
}

export function SiteProvider({ value, children }: { value: SiteValue; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
