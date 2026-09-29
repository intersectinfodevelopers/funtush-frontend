'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Photo } from '@/components/site/Cards';
import { Loading, Note } from '@/components/site/PageFrame';
import { siteApi } from '@/lib/site/api';
import { useSite } from '@/lib/site/SiteContext';

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const { slug, href } = useSite();
  const { data: b, isLoading, isError } = useQuery({ queryKey: ['site', slug, 'blog', id], queryFn: () => siteApi.blog(slug, id), staleTime: 60_000, retry: false });
  if (isLoading) return <div className="mx-auto max-w-3xl px-4 py-10"><Loading /></div>;
  if (isError || !b) return <div className="mx-auto max-w-3xl px-4 py-10"><Note>We couldn&apos;t find that post. <Link href={href('/blog')} className="font-semibold underline">All posts</Link></Note></div>;
  return (
    <article className="mx-auto max-w-3xl space-y-5 px-4 py-10">
      <Photo src={b.photos[0]} alt={b.title} className="rounded-2xl" />
      <p className="text-sm text-neutral-500">{new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}{b.tag ? ` · ${b.tag}` : ''}</p>
      <h1 className="text-3xl font-extrabold text-neutral-900">{b.title}</h1>
      <p className="text-lg text-neutral-600">{b.subtitle}</p>
      {/* The API returns sanitised HTML (allow-listed tags/attributes; no scripts, handlers or javascript: URLs). */}
      <div className="ql-editor prose max-w-none break-words px-0 text-neutral-800 [&_a]:text-primary-700 [&_a]:underline [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_img]:rounded-xl [&_ul]:list-disc [&_ul]:pl-5 [overflow-wrap:anywhere]" dangerouslySetInnerHTML={{ __html: b.content }} />
    </article>
  );
}
