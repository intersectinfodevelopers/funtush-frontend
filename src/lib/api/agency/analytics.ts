import { api } from '../client';

export type AnalyticsPeriod = 'last_7_days' | 'last_30_days' | 'last_12_months';

export interface AnalyticsOverview {
  period: string;
  summary: { totalBookings: number; totalInquiries: number; totalRevenue: number; conversionRate: number };
  charts: { bookingsByDay: { date: string; count: number }[]; revenueByDay: { date: string; revenue: number }[]; conversionByDay: { date: string; rate: number }[] };
}
export interface PackageAnalytics {
  topByBookings: { package_id: string; title: string | null; bookings: number; revenue: number }[];
  topByRevenue: { package_id: string; title: string | null; bookings: number; revenue: number }[];
  total: number;
}
export interface CustomerAnalytics {
  summary: { totalCustomers: number; newCustomers: number; returningCustomers: number; retentionRate: number };
  topCustomers: { trekker_id: string; name: string | null; bookings: number; revenue: number }[];
  geographicSources: { country: string; count: number }[];
}
export interface GuideAnalytics {
  summary: { totalGuides: number; totalBookingsWithGuide: number; avgBookingsPerGuide: number; utilizationRate: number };
  guides: { guide_id: string; name: string | null; bookings: number }[];
}
export interface OriginPackageRow {
  country: string;
  packageId: string;
  packageTitle: string | null;
  bookings: number;
  revenueNet: number;
  avgValue: number;
  lastBooking: string;
}

const q = (period: AnalyticsPeriod) => ({ params: { period } });
export const getOverview = (p: AnalyticsPeriod) => api.get<AnalyticsOverview>('/agencies/me/analytics', q(p));
export const getPackageStats = (p: AnalyticsPeriod) => api.get<PackageAnalytics>('/agencies/me/analytics/packages', q(p));
export const getCustomerStats = (p: AnalyticsPeriod) => api.get<CustomerAnalytics>('/agencies/me/analytics/customers', q(p));
export const getGuideStats = (p: AnalyticsPeriod) => api.get<GuideAnalytics>('/agencies/me/analytics/guides', q(p));
export const getOriginPerformance = (p: AnalyticsPeriod) => api.get<{ rows: OriginPackageRow[] }>('/agencies/me/analytics/origin-performance', q(p));
