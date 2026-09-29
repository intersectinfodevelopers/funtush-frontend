"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useBlogPhotoLibrary } from "@/hooks/useAgencyBlog";

const LIMIT = 8;

export function BlogPhotoLibraryModal({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (url: string) => void }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebouncedValue(search.trim());
  const { data, isLoading } = useBlogPhotoLibrary({ search: debounced || undefined, page, limit: LIMIT });
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / LIMIT));

  function reset() {
    setSearch("");
    setPage(1);
  }

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); reset(); }} title="Select Image from Gallery" size="lg">
      <div className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-500">Search and pick an image to use in your blog post.</p>
          <div className="flex items-center gap-2">
            <input type="search" aria-label="Search photo library" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by title or category..." className="w-64 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
            {search && <button type="button" onClick={() => { setSearch(""); setPage(1); }} className="text-sm font-semibold text-neutral-500 hover:text-neutral-900">Clear</button>}
          </div>
        </div>

        {isLoading && <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-lg bg-neutral-100" />)}</div>}

        {!isLoading && (data?.items.length ?? 0) === 0 && (
          <div className="mt-6 flex flex-col items-center gap-2 py-10 text-center text-sm text-neutral-500">
            <ImageOff className="h-6 w-6 text-neutral-300" />
            {debounced ? "No photos match your search." : "No photos yet — a photo you upload for a post is saved here automatically for reuse."}
          </div>
        )}

        {!isLoading && (data?.items.length ?? 0) > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {data!.items.map((photo) => (
              <button key={photo.id} type="button" onClick={() => { onSelect(photo.url); onClose(); reset(); }} className="overflow-hidden rounded-lg border border-neutral-200 text-left transition hover:border-primary-400 hover:shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.title} loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
                <p className="truncate px-2 py-1.5 text-xs text-neutral-600">{photo.title}</p>
              </button>
            ))}
          </div>
        )}

        {(data?.total ?? 0) > LIMIT && <Pagination currentPage={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} className="mt-4 border-t-0 px-0" />}
      </div>
    </Modal>
  );
}
