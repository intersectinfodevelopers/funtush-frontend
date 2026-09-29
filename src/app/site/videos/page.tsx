'use client';

import { useQuery } from '@tanstack/react-query';
import { VideoCard } from '@/components/site/Cards';
import { Loading, Note, PageFrame } from '@/components/site/PageFrame';
import { siteApi } from '@/lib/site/api';
import { useSite } from '@/lib/site/SiteContext';

export default function VideosPage() {
  const { slug } = useSite();
  const { data, isLoading, isError } = useQuery({ queryKey: ['site', slug, 'videos'], queryFn: () => siteApi.videos(slug), staleTime: 60_000, retry: false });
  return (
    <PageFrame title="Videos">
      {isLoading ? <Loading /> : isError ? <Note>We couldn&apos;t load the videos.</Note> : !data || data.length === 0 ? <Note>No videos yet.</Note> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.map((v) => <VideoCard key={v.id} v={v} />)}</div>}
    </PageFrame>
  );
}
