'use client';

import { useQuery } from '@tanstack/react-query';
import { BlogCard } from '@/components/site/Cards';
import { Loading, Note, PageFrame } from '@/components/site/PageFrame';
import { siteApi } from '@/lib/site/api';
import { useSite } from '@/lib/site/SiteContext';

export default function BlogPage() {
  const { slug } = useSite();
  const { data, isLoading, isError } = useQuery({ queryKey: ['site', slug, 'blogs'], queryFn: () => siteApi.blogs(slug), staleTime: 60_000, retry: false });
  return (
    <PageFrame title="Blog" subtitle="Stories, tips and news from the trail.">
      {isLoading ? <Loading /> : isError ? <Note>We couldn&apos;t load the blog.</Note> : !data || data.length === 0 ? <Note>No posts yet.</Note> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.map((b) => <BlogCard key={b.id} b={b} />)}</div>}
    </PageFrame>
  );
}
