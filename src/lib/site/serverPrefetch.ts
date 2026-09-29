import type { SitePage } from './api';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');

export type SeedEntry = [queryKey: unknown[], data: unknown];

async function read<T>(slug: string, path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}/site/${encodeURIComponent(slug)}/${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return ((await res.json()) as { data: T }).data;
  } catch {
    return null;
  }
}

/** Shell queries → API path. The keys are the ones `useSiteState` reads. */
const SHELL: [string, string][] = [['config', 'config'], ['branding', 'branding'], ['nav', 'navigation'], ['social', 'social-links'], ['seo', 'seo'], ['page', 'site-page'], ['about', 'about']];
const LISTS: Record<string, [string, string]> = {
  '/packages': ['packages', 'packages'], '/destinations': ['destinations', 'destinations'], '/blog': ['blogs', 'blog'],
  '/gallery': ['gallery', 'gallery'], '/videos': ['videos', 'videos'], '/reviews': ['reviews-all', 'reviews'],
};
const SECTION_LISTS: Record<string, [string, string][]> = {
  PACKAGES: [['packages', 'packages']], DESTINATIONS: [['destinations', 'destinations']], CATEGORIES: [['destinations', 'destinations']],
  BLOGS: [['blogs', 'blog']], GALLERY: [['gallery', 'gallery']], VIDEOS: [['videos', 'videos']], REVIEWS: [['reviews', 'reviews']],
};

/**
 * Everything the first paint of `pathname` needs, fetched on the server so it is in the HTML. Anything that fails
 * is simply left out; the browser then loads it the usual way and shows the usual error state.
 */
export async function prefetchSite(slug: string, pathname: string): Promise<SeedEntry[]> {
  const entries: SeedEntry[] = [];
  const add = async (key: string | string[], path: string) => {
    const data = await read(slug, path);
    if (data !== null) entries.push([['site', slug, ...(Array.isArray(key) ? key : [key])], data]);
    return data;
  };
  const shell = await Promise.all(SHELL.map(([key, path]) => add(key, path)));
  const path = pathname.replace(/\/+$/, '') || '/';
  const detail = path.match(/^\/(packages|destinations|blog)\/([^/]+)$/);
  const wanted: Promise<unknown>[] = [];
  if (path === '/') {
    const page = shell[SHELL.findIndex(([k]) => k === 'page')] as SitePage | null;
    const seen = new Set<string>();
    for (const s of page?.sections ?? []) {
      for (const [key, api] of SECTION_LISTS[s.type] ?? []) if (!seen.has(key)) { seen.add(key); wanted.push(add(key, api)); }
      if (s.type === 'ADS') {
        const k = `ads:${s.adPosition ?? ''}`;
        if (!seen.has(k)) { seen.add(k); wanted.push(add(k, `ads${s.adPosition ? `?position=${encodeURIComponent(s.adPosition)}` : ''}`)); }
      }
    }
  } else if (LISTS[path]) {
    wanted.push(add(LISTS[path][0], LISTS[path][1]));
  } else if (detail) {
    const [, kind, id] = detail;
    const key = kind === 'packages' ? 'package' : kind === 'destinations' ? 'destination' : 'blog';
    let raw = id;
    try { raw = decodeURIComponent(id); } catch { /* keep as-is */ }
    wanted.push(add([key, raw], `${kind}/${encodeURIComponent(raw)}`));
  }
  await Promise.all(wanted);
  return entries;
}
