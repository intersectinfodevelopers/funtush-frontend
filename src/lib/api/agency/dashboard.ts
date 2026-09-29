import { api } from '../client';

export interface DashboardSummary {
  agency: {
    id: string;
    name: string;
    email: string;
    slug: string;
    status: string;
    createdAt: string;
    trialExpiresAt: string | null;
    publishedAt: string | null;
    tier: { id: string; name: string; maxStaff: number | null; maxGuides: number | null; maxPackages: number | null } | null;
    kyc: { status: string; submittedAt: string; rejectionReason: string | null } | null;
  };
  stats: {
    totalBookings: number;
    bookingsByStatus: Record<string, number>;
    /** Bookings created this month / last month, by current status (for "from last month"). */
    bookingsCreatedByStatus?: { thisMonth: Record<string, number>; lastMonth: Record<string, number> };
    pendingInquiries: number;
    packages: number;
    guides: number;
    staff: number;
  };
}

export const fetchDashboardSummary = async () =>
  (await api.get<{ success: boolean; data: DashboardSummary }>('/agencies/me/dashboard')).data;

export interface AnalyticsOverview {
  period: string;
  summary: { totalBookings: number; totalInquiries: number; totalRevenue: number; conversionRate: number };
  charts: {
    bookingsByDay: Array<{ date: string; count: number }>;
    revenueByDay: Array<{ date: string; revenue: number }>;
  };
}

export const fetchAnalytics = (period: 'last_7_days' | 'last_30_days' = 'last_30_days') =>
  api.get<AnalyticsOverview>('/agencies/me/analytics', { params: { period } });

export interface Pnl {
  period: string;
  revenue: { total: number };
  expenses: { total: number };
  netProfit: number;
  netProfitMargin: number;
}

export const fetchPnl = async (period?: string) =>
  (await api.get<{ success: boolean; data: Pnl }>('/agencies/me/finance/pnl', { params: period ? { period } : {} })).data;

export interface SosIncident {
  id: string;
  status: string;
  triggeredAt: string;
  agencyName?: string;
  guideName?: string;
  trekkerName?: string;
  coordinates?: { lat: number; lng: number } | null;
  minutesSinceTriggered?: number;
  acknowledgmentOverdue?: boolean;
}

export const fetchActiveIncidents = async () =>
  (await api.get<{ success: boolean; data: { activeCount: number; overdueCount: number; incidents: SosIncident[] } }>('/agencies/me/safety/incidents/active')).data;

export interface Branding {
  currencyCode: string;
  currencySymbol: string | null;
  brandName: string | null;
}

export const fetchBranding = async () => (await api.get<{ success: boolean; data: Branding }>('/agencies/me/branding')).data;

export const fetchCustomerCount = async () =>
  (await api.get<{ success: boolean; result: { meta: { total: number } } }>('/agencies/me/customers', { params: { limit: 1 } })).result.meta.total;

export type GuideStatus = 'available' | 'on_trek' | 'unavailable';

/** A guide as the API returns it (GET /agencies/me/guides lists ACTIVE guides only). */
export interface GuideRow {
  id: string;
  /** What Booking.assignedGuideId holds. */
  guideRef: string;
  name: string;
  email: string | null;
  phone: string;
  status: GuideStatus;
  rating: number | null;
  languages: string[];
  branchId: string | null;
}

export const fetchGuides = async (status?: GuideStatus) =>
  api.get<{ success: boolean; guides: GuideRow[]; total: number }>('/agencies/me/guides', { params: status ? { status } : {} });
