import { createContext, useContext, useSyncExternalStore } from 'react';

/** The slug the server already resolved from the Host header (null on preview URLs, where only the browser knows). */
export const ServerSlugContext = createContext<string | null>(null);

const KEY = 'funtush_site_slug';
const RESERVED = new Set(['www', 'app', 'admin', 'api']);

/**
 * Which agency's site is this? In production the answer is the subdomain (`{slug}.funtush.io`); in dev
 * `{slug}.localhost:3001` works the same. For a plain `localhost:3001/site?site={slug}` (a preview link) the
 * `site` query parameter is used and remembered for the tab so every internal link keeps working.
 */
export function resolveSiteSlug(): string | null {
  if (typeof window === 'undefined') return null;
  const m = window.location.hostname.toLowerCase().match(/^([a-z0-9-]+)\.(localhost|funtush\.com|funtush\.io)$/);
  if (m && !RESERVED.has(m[1])) return m[1];
  const fromQuery = new URLSearchParams(window.location.search).get('site');
  try {
    if (fromQuery && /^[a-z0-9-]{1,80}$/i.test(fromQuery)) {
      window.sessionStorage.setItem(KEY, fromQuery.toLowerCase());
      return fromQuery.toLowerCase();
    }
    return window.sessionStorage.getItem(KEY);
  } catch {
    return fromQuery && /^[a-z0-9-]{1,80}$/i.test(fromQuery) ? fromQuery.toLowerCase() : null;
  }
}

/** True when the slug comes from the hostname, so plain paths ("/packages") are correct as links. */
export function isSubdomainSite(): boolean {
  if (typeof window === 'undefined') return false;
  return /^([a-z0-9-]+)\.(localhost|funtush\.com|funtush\.io)$/.test(window.location.hostname.toLowerCase()) && resolveSiteSlug() !== null;
}

export function useSiteSlug(): string | null {
  const server = useContext(ServerSlugContext);
  return useSyncExternalStore(() => () => {}, resolveSiteSlug, () => server);
}

/** Builds an internal link: `/packages` on a subdomain, `/site/packages?site=slug` otherwise. */
export function siteHref(slug: string, path: string, onSubdomain = false): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (onSubdomain || isSubdomainSite()) return clean;
  const [p, hash] = clean.split('#');
  const joiner = p.includes('?') ? '&' : '?';
  return `/site${p === '/' ? '' : p}${joiner}site=${encodeURIComponent(slug)}${hash ? `#${hash}` : ''}`;
}
