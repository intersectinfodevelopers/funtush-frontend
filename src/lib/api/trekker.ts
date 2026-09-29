import { API_BASE_URL, api } from './client';

/* ── Discovery (public marketplace) ───────────────────────────────────────── */
export interface MarketPackage {
  id: string;
  title: string;
  description: string;
  destination: string[];
  agencyName: string;
  agencySlug: string;
  season: string[];
  difficulty: string;
  price: number;
  duration: number;
  altitude: number;
  slug: string;
  sponsored: boolean;
  agencyRating: number;
}
export interface MarketQuery { q?: string; difficulty?: string; price_max?: number; duration_max?: number; page?: number; limit?: number }
export interface MarketPage { success: boolean; data: MarketPackage[]; meta: { total: number; page: number; limit: number; pages: number } }
export const searchPackages = (params: MarketQuery) => api.get<MarketPage>('/marketplace/packages', { params });

/* ── My treks (mobile dashboard) ──────────────────────────────────────────── */
export type TrekSection = 'upcoming' | 'active' | 'completed';
export interface TrekSummary { bookingId: string; status: string; packageTitle: string; packageSlug: string; agencyName: string; startDate: string; endDate: string; durationDays: number; groupSize: number; totalPrice: number; daysUntilStart: number }
export interface TrekDashboard { counts: Record<TrekSection, number>; data: TrekSummary[]; meta: { total: number; page: number; limit: number; pages: number } }
export const getTrekDashboard = (section: TrekSection, page = 1) => api.get<TrekDashboard>('/mobile/trekker/dashboard', { params: { section, page, limit: 10 } });

export interface TrekPackage {
  bookingId: string;
  status: string;
  trek: { title: string; slug: string; difficulty: string; durationDays: number; startDate: string; endDate: string; description: string | null };
  agency: { name: string; phones: string[]; emails: string[]; address: string | null };
  booking: { groupSize: number; totalPrice: number; specialRequests: string | null };
  guide: { name?: string; phone?: string | null } | null;
  itinerary: { dayNumber: number; location: string | null; altitudeM: number | null; description: string | null }[];
  packingList: { name?: string; item?: string; label?: string }[];
  emergency: { countryCode: string | null; contacts: { label?: string; name?: string; number?: string; phone?: string }[]; trekkerEmergencyContact: { name?: string; phone?: string } | null };
}
export const getTrekPackage = (bookingId: string) => api.get<TrekPackage>(`/mobile/bookings/${encodeURIComponent(bookingId)}/offline-package`);

/* ── Profile ──────────────────────────────────────────────────────────────── */
export interface TrekkerProfile { id: string; email: string; fullName: string | null; phone: string | null; country: string | null; nationality: string | null; emergencyContactName: string | null; emergencyContactPhone: string | null; isEmailVerified: boolean }
export const getMyProfile = async () => (await api.get<{ data: TrekkerProfile }>('/trekker/me')).data;
export const saveMyProfile = async (b: Partial<Omit<TrekkerProfile, 'id' | 'email' | 'isEmailVerified'>>) => (await api.patch<{ data: TrekkerProfile }>('/trekker/me', b)).data;

/* ── Public review form (token from the emailed invitation) ───────────────── */
export async function submitReview(input: { token: string; rating: number; text: string; title?: string; photos: File[] }): Promise<void> {
  const form = new FormData();
  form.append('token', input.token);
  form.append('rating', String(input.rating));
  form.append('text', input.text);
  if (input.title) form.append('title', input.title);
  for (const p of input.photos) form.append('photos', p);
  const res = await fetch(`${API_BASE_URL}/reviews`, { method: 'POST', body: form });
  const j = (await res.json().catch(() => ({}))) as { message?: string };
  if (!res.ok) throw new Error(j.message || 'Something went wrong. Please try again.');
}

/* ── Notifications (in-app inbox) ─────────────────────────────────────────── */
export interface TrekkerNotificationItem { id: string; title: string; body: string; data: Record<string, string> | null; readAt: string | null; createdAt: string }
export interface NotificationPage { items: TrekkerNotificationItem[]; unread: number; meta: { total: number; page: number; limit: number; pages: number } }
export const listNotifications = async (page = 1) => (await api.get<{ data: NotificationPage }>('/trekker/notifications', { params: { page } })).data;
export const getUnreadCount = async () => (await api.get<{ data: { unread: number } }>('/trekker/notifications/unread-count')).data.unread;
export const markNotificationsRead = (ids?: string[]) => api.post('/trekker/notifications/read', ids ? { ids } : {});
