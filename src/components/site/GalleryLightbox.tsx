'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { SiteGallery } from '@/lib/site/api';

export function GalleryLightbox({ post, onClose }: { post: SiteGallery | null; onClose: () => void }) {
  useEffect(() => {
    if (!post) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [post, onClose]);
  if (!post) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={post.title} className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4" onClick={onClose}>
      <div className="mx-auto max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between text-white"><div><p className="text-lg font-bold">{post.title}</p>{post.description && <p className="text-sm opacity-80">{post.description}</p>}</div><button type="button" aria-label="Close" onClick={onClose} className="rounded-full bg-white/10 p-2 hover:bg-white/20"><X className="h-5 w-5" /></button></div>
        <div className="grid gap-3 sm:grid-cols-2">{post.images.map((src) => /* eslint-disable-next-line @next/next/no-img-element */ <img key={src} src={src} alt={post.title} className="w-full rounded-xl object-cover" />)}</div>
      </div>
    </div>
  );
}
