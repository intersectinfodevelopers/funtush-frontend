import type { Metadata } from 'next';
import { headers } from 'next/headers';
import SiteShell from '@/components/site/SiteShell';
import SiteSeed from '@/components/site/SiteSeed';
import { prefetchSite } from '@/lib/site/serverPrefetch';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');
const TENANT = /^([a-z0-9-]+)\.(localhost|funtush\.com|funtush\.io)$/;
const RESERVED = new Set(['www', 'app', 'admin', 'api']);

async function getJson<T>(slug: string, path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}/site/${encodeURIComponent(slug)}/${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return ((await res.json()) as { data: T }).data;
  } catch {
    return null;
  }
}

/**
 * On a tenant subdomain the server already knows which agency this is (from the Host header), so the title,
 * description and social-share tags are in the first HTML a crawler receives. On a preview URL (?site=) the
 * slug is only known in the browser, and the client shell sets the same tags after load.
 */
export async function generateMetadata(): Promise<Metadata> {
  const host = ((await headers()).get('host') ?? '').split(':')[0].toLowerCase();
  const m = host.match(TENANT);
  if (!m || RESERVED.has(m[1])) return {};
  const [seo, branding] = await Promise.all([
    getJson<{ metaTitle: string | null; metaDescription: string | null; ogImageUrl: string | null }>(m[1], 'seo'),
    getJson<{ brandName: string; faviconUrl: string | null }>(m[1], 'branding'),
  ]);
  if (!branding) return {};
  const title = seo?.metaTitle || branding.brandName;
  return {
    title: { absolute: title },
    description: seo?.metaDescription ?? undefined,
    icons: branding.faviconUrl ? { icon: branding.faviconUrl } : undefined,
    openGraph: { title, description: seo?.metaDescription ?? undefined, images: seo?.ogImageUrl ? [seo.ogImageUrl] : undefined },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // On a tenant subdomain the page body is rendered on the server too. (Preview URLs, `?site=`, stay client-rendered.)
  const h = await headers();
  const m = (h.get('host') ?? '').split(':')[0].toLowerCase().match(TENANT);
  if (!m || RESERVED.has(m[1])) return <SiteShell>{children}</SiteShell>;
  const entries = await prefetchSite(m[1], h.get('x-site-path') ?? '/');
  return <SiteSeed slug={m[1]} entries={entries}><SiteShell>{children}</SiteShell></SiteSeed>;
}
