'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getCustomerStats, getGuideStats, getOriginPerformance, getOverview, getPackageStats, type AnalyticsPeriod } from '@/lib/api/agency/analytics';

const opts = { placeholderData: keepPreviousData, retry: false } as const;
export const useOverview = (p: AnalyticsPeriod) => useQuery({ queryKey: ['agency', 'analytics', 'overview', p], queryFn: () => getOverview(p), ...opts });
export const usePackageStats = (p: AnalyticsPeriod) => useQuery({ queryKey: ['agency', 'analytics', 'packages', p], queryFn: () => getPackageStats(p), ...opts });
export const useCustomerStats = (p: AnalyticsPeriod) => useQuery({ queryKey: ['agency', 'analytics', 'customers', p], queryFn: () => getCustomerStats(p), ...opts });
export const useGuideStats = (p: AnalyticsPeriod) => useQuery({ queryKey: ['agency', 'analytics', 'guides', p], queryFn: () => getGuideStats(p), ...opts });
export const useOriginPerformance = (p: AnalyticsPeriod) => useQuery({ queryKey: ['agency', 'analytics', 'origin-performance', p], queryFn: () => getOriginPerformance(p), ...opts });
