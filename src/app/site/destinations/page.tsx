'use client';

import { useQuery } from '@tanstack/react-query';
import { DestinationCard } from '@/components/site/Cards';
import { Loading, Note, PageFrame } from '@/components/site/PageFrame';
import { siteApi } from '@/lib/site/api';
import { useSite } from '@/lib/site/SiteContext';

export default function DestinationsPage() {
  const { slug } = useSite();
  const { data, isLoading, isError } = useQuery({ queryKey: ['site', slug, 'destinations'], queryFn: () => siteApi.destinations(slug), staleTime: 60_000, retry: false });
  return (
    <PageFrame title="Destinations" subtitle="Where we trek.">
      {isLoading ? <Loading /> : isError ? <Note>We couldn&apos;t load destinations.</Note> : !data || data.length === 0 ? <Note>No destinations listed yet.</Note> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.map((d) => <DestinationCard key={d.id} d={d} />)}</div>}
    </PageFrame>
  );
}
