'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchReviews, type ReviewParams } from '@/lib/api/agency/reviews';
import { useDashboardSummary } from '@/hooks/useAgencyDashboard';

/** The public review list is addressed by the agency's slug, which comes from the dashboard summary. */
export function useReviews(params: ReviewParams) {
  const slug = useDashboardSummary().data?.agency.slug;
  return useQuery({
    queryKey: ['agency', 'reviews', slug, params],
    queryFn: () => fetchReviews(slug!, params),
    enabled: Boolean(slug),
    placeholderData: keepPreviousData,
  });
}
