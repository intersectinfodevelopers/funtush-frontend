import { API_BASE_URL } from '@/lib/api/client';

/** Errors from the public site API. A 503 carries the agency's coming-soon copy. */
export class SiteError extends Error {
  status: number;
  comingSoon: { headline: string; message: string } | null;
  constructor(status: number, message: string, comingSoon: SiteError['comingSoon'] = null) {
    super(message);
    this.status = status;
    this.comingSoon = comingSoon;
  }
}

// Plain fetch on purpose: these are public, cookie-less, cacheable reads — no auth headers, no refresh logic.
async function get<T>(slug: string, path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/site/${encodeURIComponent(slug)}/${path}`, { headers: { Accept: 'application/json' } });
  let body: { data?: T; message?: string; comingSoon?: SiteError['comingSoon'] } = {};
  try { body = await res.json(); } catch { /* non-JSON error page */ }
  if (!res.ok) throw new SiteError(res.status, body.message || 'This site is unavailable.', body.comingSoon ?? null);
  return body.data as T;
}

export interface SiteBranding { brandName: string; logoUrl: string | null; faviconUrl: string | null; primaryColor: string; onPrimaryColor: string; fontStack: string; cardImageRatioValue: string; currencyCode: string; currencySymbol: string; currencyDisplay: 'SYMBOL' | 'CODE' | 'SYMBOL_CODE'; logoWidth: number }
export interface SiteConfig { underConstruction: boolean; published: boolean; comingSoon: { headline: string; message: string } | null; showFuntushBadge: boolean; topBar: { text: string; behavior: string; backgroundColor: string; textColor: string; linkUrl: string | null; dismissible: boolean } | null; popup: { title: string; body: string; ctaLabel: string | null; ctaUrl: string | null; trigger: string; delaySeconds: number; frequency: string } | null }
export interface NavLeaf { label: string; linkType: 'INTERNAL' | 'EXTERNAL'; url: string; openInNewTab: boolean }
export interface SiteNav { items: (NavLeaf & { children: NavLeaf[] })[]; bookNow: { label: string; hidden: boolean } }
export interface SiteSocial { facebookUrl: string | null; instagramUrl: string | null; tiktokUrl: string | null; youtubeUrl: string | null; whatsappNumber: string | null; whatsappLink: string | null }
export interface SiteSeo { metaTitle: string | null; metaDescription: string | null; ogImageUrl: string | null }
export interface SiteSection { id: string; type: string; title: string | null; text: string | null; subtitle: string | null; image: string | null; link: string | null; ctaText: string | null; ctaText2: string | null; ctaLink2: string | null; heroHeight: string | null; overlayEnabled: boolean; fontSize: number | null; speed: number | null; direction: string | null; useThemeBg: boolean; bgColor: string | null; useThemeText: boolean; textColor: string | null; spacingTop: number | null; spacingBottom: number | null; itemCount: number | null; selectedIds: string[]; adPosition: string | null; widthPercent: number }
export interface SitePage { header: { style: string; ctaText: string | null; ctaLink: string | null; sticky: boolean }; footer: { style: string }; sections: SiteSection[] }
export interface SiteAbout { name: string; description: string | null; address: string | null; phones: string[]; emails: string[]; regions: string[] }
export interface SitePackage { id: string; slug: string; title: string; description: string | null; durationDays: number; pricePerPerson: number; difficulty: string; maxGroupSize: number; photos: string[]; shortSummary: string | null; category: string | null; region: string | null; destination: string | null; currency: string; isFeatured: boolean; nextDeparture: string | null }
export interface SitePackageDetail extends Omit<SitePackage, 'nextDeparture'> { activities: string[]; routes: string[]; bestTimeToVisit: string | null; altitudeMinM: number | null; altitudeMaxM: number | null; minDurationDays: number | null; maxDurationDays: number | null; volumeDiscounts: { minPeople: number; percentOff: number }[]; itineraries: { dayNumber: number; location: string | null; description: string | null; altitudeM: number | null }[]; departures: { id: string; startDate: string; seatsLeft: number }[]; addOns: { id: string; name: string; price: number; perPerson: boolean }[] }
export interface SiteDestination { id: string; slug: string; title: string; category: string | null; shortDescription: string | null; region: string | null; difficulty: string | null; featuredImage: string | null; durationMinDays: number | null; durationMaxDays: number | null; altitudeMinM: number | null; altitudeMaxM: number | null; featured: boolean; rating: number | null; reviewCount: number }
export interface SiteDestinationDetail extends SiteDestination { longDescription: string | null; activities: string[]; gallery: string[]; bestTimeToVisit: string | null }
export interface SiteBlog { id: string; title: string; subtitle: string; tag: string | null; photos: string[]; createdAt: string }
export interface SiteBlogDetail extends SiteBlog { content: string }
export interface SiteGallery { id: string; title: string; description: string | null; category: string | null; images: string[]; featuredImage: string | null }
export interface SiteVideo { id: string; title: string; description: string | null; youtubeUrl: string; thumbnailUrl: string | null }
export interface SiteReviews { average: number | null; count: number; reviews: { id: string; rating: number; title: string | null; text: string; createdAt: string; author: string; country: string | null; reply: string | null }[] }
export interface SiteAd { id: string; title: string; imageUrl: string; linkUrl: string | null; position: string }

export const siteApi = {
  branding: (s: string) => get<SiteBranding>(s, 'branding'),
  config: (s: string) => get<SiteConfig>(s, 'config'),
  navigation: (s: string) => get<SiteNav>(s, 'navigation'),
  social: (s: string) => get<SiteSocial>(s, 'social-links'),
  seo: (s: string) => get<SiteSeo>(s, 'seo'),
  page: (s: string) => get<SitePage>(s, 'site-page'),
  about: (s: string) => get<SiteAbout>(s, 'about'),
  packages: (s: string, search?: string) => get<SitePackage[]>(s, `packages${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  package: (s: string, id: string) => get<SitePackageDetail>(s, `packages/${encodeURIComponent(id)}`),
  destinations: (s: string) => get<SiteDestination[]>(s, 'destinations'),
  destination: (s: string, slug: string) => get<SiteDestinationDetail>(s, `destinations/${encodeURIComponent(slug)}`),
  blogs: (s: string) => get<SiteBlog[]>(s, 'blog'),
  blog: (s: string, id: string) => get<SiteBlogDetail>(s, `blog/${encodeURIComponent(id)}`),
  gallery: (s: string) => get<SiteGallery[]>(s, 'gallery'),
  videos: (s: string) => get<SiteVideo[]>(s, 'videos'),
  reviews: (s: string) => get<SiteReviews>(s, 'reviews'),
  ads: (s: string, position?: string) => get<SiteAd[]>(s, `ads${position ? `?position=${encodeURIComponent(position)}` : ''}`),
};
