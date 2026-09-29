'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GalleryCard } from '@/components/site/Cards';
import { GalleryLightbox } from '@/components/site/GalleryLightbox';
import { Loading, Note, PageFrame } from '@/components/site/PageFrame';
import { siteApi, type SiteGallery } from '@/lib/site/api';
import { useSite } from '@/lib/site/SiteContext';

export default function GalleryPage() {
  const { slug } = useSite();
  const [open, setOpen] = useState<SiteGallery | null>(null);
  const { data, isLoading, isError } = useQuery({ queryKey: ['site', slug, 'gallery'], queryFn: () => siteApi.gallery(slug), staleTime: 60_000, retry: false });
  return (
    <PageFrame title="Gallery" subtitle="Moments from our treks.">
      {isLoading ? <Loading /> : isError ? <Note>We couldn&apos;t load the gallery.</Note> : !data || data.length === 0 ? <Note>No photos yet.</Note> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.map((g) => <GalleryCard key={g.id} g={g} onOpen={setOpen} />)}</div>}
      <GalleryLightbox post={open} onClose={() => setOpen(null)} />
    </PageFrame>
  );
}
