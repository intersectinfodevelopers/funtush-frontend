'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PackageCard } from '@/components/site/Cards';
import { Loading, Note, PageFrame } from '@/components/site/PageFrame';
import { siteApi } from '@/lib/site/api';
import { useSite } from '@/lib/site/SiteContext';

export default function PackagesPage() {
  const { slug } = useSite();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const { data, isLoading, isError } = useQuery({ queryKey: ['site', slug, 'packages'], queryFn: () => siteApi.packages(slug), staleTime: 60_000, retry: false });
  const q = search.trim().toLowerCase();
  const rows = (data ?? []).filter((p) => !q || `${p.title} ${p.description ?? ''}`.toLowerCase().includes(q)).sort((a, b) => (sort === 'price' ? a.pricePerPerson - b.pricePerPerson : sort === 'duration' ? a.durationDays - b.durationDays : 0));
  return (
    <PageFrame title="Our treks" subtitle="Guided departures with local experts.">
      <div className="mb-6 flex flex-wrap gap-3">
        <input type="search" aria-label="Search treks" placeholder="Search treks…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full max-w-xs rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500" />
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"><option value="newest">Newest</option><option value="price">Lowest price</option><option value="duration">Shortest first</option></select>
      </div>
      {isLoading ? <Loading /> : isError ? <Note>We couldn&apos;t load the treks. Please try again.</Note> : rows.length === 0 ? <Note>{q ? 'No treks match your search.' : 'No treks are listed yet.'}</Note> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rows.map((p) => <PackageCard key={p.id} p={p} />)}</div>}
    </PageFrame>
  );
}
