"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CheckCircle2, Eye, Pencil, Plus, Trash2, Video as VideoIcon, XCircle } from "lucide-react";

import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useVideoList } from "@/hooks/useAgencyMedia";
import { deleteVideo, youtubeId, type VideoItem } from "@/lib/api/agency/media";
import type { ApiError } from "@/lib/api/client";

const PAGE_SIZE = 12;
const field = "rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100";

export default function VideosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState<VideoItem | null>(null);
  const debounced = useDebouncedValue(search.trim());
  const { data, isLoading, isError, isFetching } = useVideoList({ search: debounced || undefined, status: status || undefined, page, limit: PAGE_SIZE });
  const rows = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const stats = data?.stats;

  const remove = useMutation({
    mutationFn: (v: VideoItem) => deleteVideo(v.id),
    onSuccess: (_r, v) => { toast.success(`“${v.title}” was deleted`); setRemoving(null); void qc.invalidateQueries({ queryKey: ["agency", "videos"] }); },
    onError: (e, v) => { setRemoving(null); toast.error((e as unknown as ApiError).message || `Couldn't delete “${v.title}”.`); },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-neutral-500"><Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span><span className="font-semibold text-neutral-900">Manage Videos</span></div>
          <h1 className="text-2xl font-bold text-neutral-900">Manage Videos</h1>
          <p className="text-sm text-neutral-600">Add and manage YouTube videos used on the site.</p>
        </div>
        <Link href="/dashboard/videos/new" className="inline-flex items-center gap-2 self-start rounded-full bg-primary-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-800"><Plus className="h-4 w-4" /> Add New Video</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <AnalyticsSummaryCard label="Total Videos" value={stats ? stats.total : "—"} tone="primary" icon={VideoIcon} />
        <AnalyticsSummaryCard label="Active" value={stats ? stats.active : "—"} tone="success" icon={CheckCircle2} />
        <AnalyticsSummaryCard label="Inactive" value={stats ? stats.inactive : "—"} tone="danger" icon={XCircle} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_200px]">
        <input type="search" aria-label="Search videos" placeholder="Search videos" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className={`${field} w-full`} />
        <select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={field}>
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load videos.</p>}

      <div className={`overflow-hidden rounded-2xl border border-neutral-200 bg-white ${isFetching && !isLoading ? "opacity-70" : ""}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              <tr><th className="w-14 px-4 py-3.5">S.No</th><th className="px-4 py-3.5">Video</th><th className="px-4 py-3.5">Order</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => <tr key={i} className="border-t border-neutral-200"><td colSpan={5} className="px-4 py-5"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td></tr>)}
              {!isLoading && rows.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-500">{search || status ? "No videos match this filter." : "No videos yet — add your first one."}</td></tr>}
              {rows.map((v, index) => {
                const yt = youtubeId(v.youtubeUrl);
                const thumb = v.thumbnail ?? (yt ? `https://img.youtube.com/vi/${encodeURIComponent(yt)}/mqdefault.jpg` : null);
                return (
                  <tr key={v.id} className="border-t border-neutral-200 hover:bg-neutral-50/60">
                    <td className="px-4 py-4 text-neutral-600">{(page - 1) * PAGE_SIZE + index + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt="" className="h-14 w-20 shrink-0 rounded-md object-cover" />
                        ) : (
                          <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-[10px] text-neutral-400">No image</span>
                        )}
                        <div className="min-w-0">
                          <Link href={`/dashboard/videos/${v.id}`} className="font-bold text-neutral-900 hover:underline">{v.title}</Link>
                          <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-primary-700 hover:underline">{v.youtubeUrl}</a>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-neutral-700">{v.order}</td>
                    <td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${v.status === "active" ? "bg-success-50 text-success-700" : "bg-neutral-100 text-neutral-600"}`}><span className={`h-1.5 w-1.5 rounded-full ${v.status === "active" ? "bg-success-600" : "bg-neutral-400"}`} />{v.status === "active" ? "Active" : "Inactive"}</span></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/dashboard/videos/${v.id}`} aria-label={`View ${v.title}`} title="View" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition hover:bg-primary-100"><Eye className="h-4 w-4" /></Link>
                        <Link href={`/dashboard/videos/${v.id}/edit`} aria-label={`Edit ${v.title}`} title="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-warning-50 text-warning-700 transition hover:bg-warning-100"><Pencil className="h-4 w-4" /></Link>
                        <button type="button" aria-label={`Delete ${v.title}`} title="Delete" onClick={() => setRemoving(v)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-danger-50 text-danger-700 transition hover:bg-danger-100"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination currentPage={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={removing !== null} onClose={() => setRemoving(null)} title="Delete this video?" size="sm">
        <div className="space-y-4 p-4">
          <p className="text-sm text-neutral-600">“{removing?.title}” is removed from your site and can&apos;t be restored.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRemoving(null)} className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Cancel</button>
            <button type="button" disabled={remove.isPending} onClick={() => removing && remove.mutate(removing)} className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">{remove.isPending ? "Deleting…" : "Delete"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
