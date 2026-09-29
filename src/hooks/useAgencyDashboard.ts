'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  fetchActiveIncidents,
  fetchAnalytics,
  fetchBranding,
  fetchCustomerCount,
  fetchDashboardSummary,
  fetchGuides,
  fetchPnl,
} from '@/lib/api/agency/dashboard';
import { listBookings, type BookingListParams } from '@/lib/api/agency/bookings';

// Query keys are exported so mutations elsewhere can invalidate exactly these.
export const keys = {
  summary: ['agency', 'summary'] as const,
  bookings: (p?: BookingListParams) => ['agency', 'bookings', p ?? {}] as const,
  analytics: (period: string) => ['agency', 'analytics', period] as const,
  pnl: (period?: string) => ['agency', 'pnl', period ?? 'current'] as const,
  incidents: ['agency', 'incidents', 'active'] as const,
  branding: ['agency', 'branding'] as const,
  customerCount: ['agency', 'customers', 'count'] as const,
};

export const useGuidesOnTrek = () => useQuery({ queryKey: ['agency', 'guides', 'on-trek'], queryFn: () => fetchGuides('on_trek') });
export const useDashboardSummary = () => useQuery({ queryKey: keys.summary, queryFn: fetchDashboardSummary });
export const useBookingList = (p: BookingListParams = {}, enabled = true) =>
  useQuery({ queryKey: keys.bookings(p), queryFn: () => listBookings(p), placeholderData: keepPreviousData, enabled }); // keep the table on screen while the next page/filter loads
export const useAnalytics = (period: 'last_7_days' | 'last_30_days' = 'last_30_days') =>
  useQuery({ queryKey: keys.analytics(period), queryFn: () => fetchAnalytics(period) });
export const usePnl = (period?: string) => useQuery({ queryKey: keys.pnl(period), queryFn: () => fetchPnl(period) });
export const useActiveIncidents = (enabled = true) =>
  useQuery({ queryKey: keys.incidents, queryFn: fetchActiveIncidents, refetchInterval: 30_000, enabled }); // a live SOS feed must not go stale
export const useCustomerCount = () => useQuery({ queryKey: keys.customerCount, queryFn: fetchCustomerCount });

const CURRENCY_SYMBOL: Record<string, string> = { NPR: 'Rs', USD: '$', EUR: '€', GBP: '£', INR: '₹' };

/** Formats money in the agency's own currency (branding), falling back to the code. */
export function useMoney() {
  const { data } = useQuery({ queryKey: keys.branding, queryFn: fetchBranding, staleTime: 10 * 60_000 });
  const symbol = data?.currencySymbol ?? data?.currencyCode ?? '';
  // `code`: a package can be priced in its own currency; show that one instead of the agency's default.
  return (n: number, code?: string) => {
    const sym = code && code !== data?.currencyCode && CURRENCY_SYMBOL[code] ? CURRENCY_SYMBOL[code] : symbol;
    return `${sym}${sym.length > 1 ? ' ' : ''}${Math.round(n).toLocaleString()}`;
  };
}

/** Same currency symbol as useMoney, but abbreviated (37.7k, 1.2M) for compact stat tiles. */
export function useCompactMoney() {
  const { data } = useQuery({ queryKey: keys.branding, queryFn: fetchBranding, staleTime: 10 * 60_000 });
  const symbol = data?.currencySymbol ?? data?.currencyCode ?? '';
  return (n: number) => {
    const abs = Math.abs(n);
    const body = abs >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : abs >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : Math.round(n).toLocaleString();
    return `${symbol}${symbol.length > 1 ? ' ' : ''}${body}`;
  };
}
