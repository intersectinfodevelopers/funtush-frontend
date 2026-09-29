import { api } from '../client';

// Every /agencies/me/* site endpoint answers { success, data }; the real settings live under data (or data.values).

/* ── Branding ─────────────────────────────────────────────────────────────── */
export interface Branding {
  brandName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  paletteId: string | null;
  fontFamily: string;
  cardImageRatio: string;
  currencyCode: string;
  currencySymbol: string;
  currencyDisplay: 'SYMBOL' | 'CODE' | 'SYMBOL_CODE';
  currencyExample: string;
  colorPickerMode: 'curated' | 'free';
  logoWidth: number;
  receiptFooter: string;
}
export interface BrandingOptions {
  tier: string;
  colorPickerMode: 'curated' | 'free';
  palette: { id: string; label: string; hex: string }[];
  fonts: { id: string; label: string; category: string }[];
  cardImageRatios: { id: string; label: string }[];
  currencies: { code: string; symbol: string; label: string }[];
  currencyDisplayModes: string[];
  imageSpecs: { logo: { width: number; height: number; maxBytes: number }; favicon: { width: number; height: number; maxBytes: number } };
  logoWidth: { min: number; max: number };
  receiptFooter: { maxLength: number };
}
export type BrandingPatch = Partial<Pick<Branding, 'brandName' | 'primaryColor' | 'paletteId' | 'fontFamily' | 'cardImageRatio' | 'currencyCode' | 'currencySymbol' | 'currencyDisplay' | 'logoWidth' | 'receiptFooter'>>;

export const getBranding = async () => (await api.get<{ data: Branding }>('/agencies/me/branding')).data;
export const getBrandingOptions = async () => (await api.get<{ data: BrandingOptions }>('/agencies/me/branding/options')).data;
/** Multipart: text fields as strings, optional `logo` / `favicon` files. */
export async function saveBranding(patch: BrandingPatch, files: { logo?: File; favicon?: File } = {}) {
  const form = new FormData();
  for (const [k, v] of Object.entries(patch)) if (v !== undefined && v !== null) form.append(k, String(v));
  if (files.logo) form.append('logo', files.logo);
  if (files.favicon) form.append('favicon', files.favicon);
  return (await api.upload<{ data: Branding }>('/agencies/me/branding', form, 'patch')).data;
}

/* ── SEO ──────────────────────────────────────────────────────────────────── */
export interface SeoValues { metaTitle: string | null; metaDescription: string | null; ogImageUrl: string | null }
export const getSeo = async () => (await api.get<{ data: { values: SeoValues } }>('/agencies/me/seo')).data.values;
export const saveSeo = async (patch: Partial<SeoValues>) => (await api.patch<{ data: { values: SeoValues } }>('/agencies/me/seo', patch)).data.values;

/* ── Social links ─────────────────────────────────────────────────────────── */
export interface SocialValues { facebookUrl: string | null; instagramUrl: string | null; tiktokUrl: string | null; whatsappNumber: string | null; youtubeUrl: string | null }
export const getSocial = async () => (await api.get<{ data: { values: SocialValues } }>('/agencies/me/social-links')).data.values;
export const saveSocial = async (patch: Partial<SocialValues>) => (await api.patch<{ data: { values: SocialValues } }>('/agencies/me/social-links', patch)).data.values;

/* ── Navigation ───────────────────────────────────────────────────────────── */
export type NavLinkType = 'INTERNAL' | 'EXTERNAL';
export interface NavItem { label: string; linkType: NavLinkType; url: string; openInNewTab?: boolean; children?: NavItem[] }
export interface NavigationSettings {
  tier: string;
  items: NavItem[];
  bookNowLabel: string | null;
  bookNowHidden: boolean;
  capabilities: { customNavigation: boolean; bookNowCustomization: boolean };
  effectiveNavigation: { items: NavItem[]; bookNow: { label: string; hidden: boolean }; isCustom: boolean };
}
export interface NavigationOptions {
  limits: { maxTopLevelItems: number; maxDropdownItems: number; maxDepth: number };
  notes: { customNavigation: string; bookNow: string };
}
export interface NavigationPatch { items?: NavItem[]; bookNowLabel?: string | null; bookNowHidden?: boolean }
export const getNavigation = async () => (await api.get<{ data: NavigationSettings }>('/agencies/me/navigation')).data;
export const getNavigationOptions = async () => (await api.get<{ data: NavigationOptions }>('/agencies/me/navigation/options')).data;
export const saveNavigation = async (patch: NavigationPatch) => (await api.patch<{ data: NavigationSettings }>('/agencies/me/navigation', patch)).data;

/* ── Widgets ──────────────────────────────────────────────────────────────── */
export interface WidgetSettings {
  whatsapp: { enabled?: boolean | null; number?: string | null };
  googleMaps: { enabled?: boolean | null };
  liveChat: { enabled?: boolean | null; code?: string | null };
  weather: { enabled?: boolean | null };
  currencyConverter: { enabled?: boolean | null };
  googleAnalytics: { id?: string | null };
  facebookPixel: { id?: string | null };
}
export const getWidgets = async () => (await api.get<{ data: WidgetSettings }>('/agencies/me/widgets')).data;
export const saveWhatsapp = (b: { whatsappEnabled: boolean; whatsappNumber: string | null }) => api.patch('/agencies/me/widgets/whatsapp', b);
export const saveLiveChat = (b: { liveChatEnabled: boolean; liveChatCode: string | null }) => api.patch('/agencies/me/widgets/livechat', b);
export const saveAnalytics = (googleAnalyticsId: string | null) => api.patch('/agencies/me/widgets/google', { googleAnalyticsId });
export const savePixel = (facebookPixelId: string | null) => api.patch('/agencies/me/widgets/facebook', { facebookPixelId });
export const setWeather = (enabled: boolean) => api.patch('/agencies/me/widgets/weather-enable', { enabled });
export const setCurrencyConverter = (enabled: boolean) => api.patch('/agencies/me/widgets/currency-enable', { enabled });

/* ── Site configuration (construction mode, top bar, popup) ───────────────── */
export interface SiteConfigValues {
  underConstruction: boolean;
  constructionHeadline: string | null;
  constructionMessage: string | null;
  topBarEnabled: boolean;
  topBarText: string | null;
  topBarBehavior: string;
  topBarBackgroundColor: string | null;
  topBarLinkUrl: string | null;
  topBarDismissible: boolean;
  popupEnabled: boolean;
  popupTitle: string | null;
  popupBody: string | null;
  popupCtaLabel: string | null;
  popupCtaUrl: string | null;
  popupTrigger: string;
  popupDelaySeconds: number;
  popupFrequency: string;
}
export interface SiteConfig { tier: string; values: SiteConfigValues; capabilities: { popupModal: boolean; funtushBadgeToggle: boolean; topBarColorMode: 'curated' | 'free' }; effectiveFuntushBadge: boolean }
export interface SiteConfigOptions {
  topBarBehaviors: { id: string; label: string; description: string }[];
  popupTriggers: { id: string; label: string; description: string }[];
  popupFrequencies: { id: string; label: string }[];
  notes: { funtushBadge: string; popupModal: string };
}
export const getSiteConfig = async () => (await api.get<{ data: SiteConfig }>('/agencies/me/site-config')).data;
export const getSiteConfigOptions = async () => (await api.get<{ data: SiteConfigOptions }>('/agencies/me/site-config/options')).data;
export const saveSiteConfig = async (patch: Partial<SiteConfigValues>) => (await api.patch<{ data: SiteConfig }>('/agencies/me/site-config', patch)).data;

/* ── Domain & publish ─────────────────────────────────────────────────────── */
export interface DnsRecord { type: 'CNAME' | 'TXT'; name: string; value: string }
export interface DomainSettings {
  subdomain: string;
  customDomain: string | null;
  status: 'NONE' | 'PENDING' | 'VERIFIED';
  verifiedAt: string | null;
  dnsInstructions: { cname: DnsRecord; txt: DnsRecord } | null;
  published: boolean;
  publishedAt: string | null;
}
export const getDomain = async () => (await api.get<{ data: DomainSettings }>('/agencies/me/domain')).data;
export const connectDomain = async (domain: string) => (await api.patch<{ data: DomainSettings }>('/agencies/me/domain', { domain })).data;
export const disconnectDomain = async () => (await api.delete<{ data: DomainSettings }>('/agencies/me/domain')).data;
export const verifyDomain = (): Promise<{ verified: boolean; message: string; data: DomainSettings }> => api.post('/agencies/me/domain/verify');
export const publishSite = async () => (await api.post<{ data: DomainSettings }>('/agencies/me/publish')).data;
export const unpublishSite = async () => (await api.post<{ data: DomainSettings }>('/agencies/me/unpublish')).data;

/* ── Site page (template + header/footer + sections) ──────────────────────── */
export interface PageSection {
  id?: string;
  position?: number;
  type: string;
  title: string | null;
  text: string | null;
  subtitle: string | null;
  image: string | null;
  link: string | null;
  ctaText: string | null;
  ctaText2: string | null;
  ctaLink2: string | null;
  heroHeight: string | null;
  overlayEnabled: boolean;
  fontSize: number | null;
  speed: number | null;
  direction: string | null;
  useThemeBg: boolean;
  bgColor: string | null;
  useThemeText: boolean;
  textColor: string | null;
  spacingTop: number | null;
  spacingBottom: number | null;
  itemCount: number | null;
  selectedIds: string[];
  cardWidth: number | null;
  cardHeight: number | null;
  adPosition: string | null;
  widthPercent: number;
}
export interface SitePage {
  templateId: string | null;
  variant: string;
  name: string | null;
  header: { style: string; ctaText: string | null; ctaLink: string | null; sticky: boolean };
  footer: { style: string };
  sections: PageSection[];
}
export interface SitePageOptions {
  tier: string;
  templates: { id: string; name: string; description: string; variant: string; tier: 'FREE' | 'PAID'; sections: string[]; locked: boolean }[];
  sectionTypes: { value: string; label: string; description: string; group: string }[];
  headerStyles: { value: string; label: string }[];
  footerStyles: { value: string; label: string }[];
  heroHeights: string[];
  directions: string[];
  widthPercentOptions: number[];
  limits: { maxSections: number; maxSelectedIds: number };
}
export interface SitePagePatch {
  name?: string | null;
  headerStyle?: string;
  headerCtaText?: string | null;
  headerCtaLink?: string | null;
  headerSticky?: boolean;
  footerStyle?: string;
  sections?: Omit<PageSection, 'id' | 'position'>[];
}
export const getSitePage = async () => (await api.get<{ data: SitePage }>('/agencies/me/site-page')).data;
export const getSitePageOptions = async () => (await api.get<{ data: SitePageOptions }>('/agencies/me/site-page/options')).data;
export const saveSitePage = async (patch: SitePagePatch) => (await api.patch<{ data: SitePage }>('/agencies/me/site-page', patch)).data;
export const applyTemplate = async (templateId: string) => (await api.post<{ data: SitePage }>('/agencies/me/site-page/apply-template', { templateId })).data;
