'use client';

import { useQuery } from '@tanstack/react-query';
import { ReviewList } from '@/components/site/Cards';
import { Loading, Note, PageFrame } from '@/components/site/PageFrame';
import { siteApi } from '@/lib/site/api';
import { useSite } from '@/lib/site/SiteContext';

export default function ReviewsPage() {
  const { slug } = useSite();
  const { data, isLoading, isError } = useQuery({ queryKey: ['site', slug, 'reviews-all'], queryFn: () => siteApi.reviews(slug), staleTime: 60_000, retry: false });
  return (
    <PageFrame title="What trekkers say">
      {isLoading ? <Loading /> : isError ? <Note>We couldn&apos;t load reviews.</Note> : !data || data.reviews.length === 0 ? <Note>No reviews yet.</Note> : <ReviewList data={data} />}
    </PageFrame>
  );
}
