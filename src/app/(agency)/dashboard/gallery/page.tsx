"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowUpRight, Camera, Eye, FilePenLine, ImagePlus, Pencil, Search, Trash2 } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useGalleryList } from "@/hooks/useAgencyMedia";
import { deleteGalleryPost, type GalleryPost } from "@/lib/api/agency/media";
import type { ApiError } from "@/lib/api/client";

const PAGE_SIZE = 12;
const field = "rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

export default function GalleryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState<GalleryPost | null>(null);
  const debounced = useDebouncedValue(search.trim());
  const { data, isLoading, isError, isFetching } = useGalleryList({ search: debounced || undefined, status: status || undefined, page, limit: PAGE_SIZE });
  const rows = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const stats = data?.stats;
  // Real numbers only: "% from last month" compares against posts that existed before this month began.
  const growth = !stats ? undefined : stats.totalBeforeMonth === 0 ? (stats.total > 0 ? `${stats.total} new` : undefined) : `${stats.total >= stats.totalBeforeMonth ? "+" : ""}${(((stats.total - stats.totalBeforeMonth) / stats.totalBeforeMonth) * 100).toFixed(1)}%`;
  const share = (n?: number) => (n === undefined || !stats?.total ? undefined : `${Math.round((n / stats.total) * 1000) / 10}%`);
  const remove = useMutation({
    mutationFn: (p: GalleryPost) => deleteGalleryPost(p.id),
    onSuccess: () => { toast.success("Gallery post deleted"); setRemoving(null); void qc.invalidateQueries({ queryKey: ["agency", "gallery"] }); },
    onError: (e) => { setRemoving(null); toast.error((e as unknown as ApiError).message || "Couldn't delete the post."); },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="flex items-center gap-2 text-sm text-neutral-500"><Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span><span className="font-semibold text-neutral-900">Gallery</span></div><h1 className="mt-2 text-2xl font-bold text-neutral-900">Manage Gallery</h1><p className="mt-1 text-sm text-neutral-600">Create and manage gallery posts with up to five photos each.</p></div>
        <Link href="/dashboard/gallery/new" className="inline-flex items-center gap-2 self-start rounded-full bg-primary-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-800"><ImagePlus className="h-4 w-4" /> Upload Image</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<Camera className="h-5 w-5" />} label="Gallery Posts" value={data?.stats.total ?? data?.total ?? 0} tone="blue" change={growth} note="from last month" />
        <StatCard icon={<span className="text-lg">◉</span>} label="Published" value={data?.stats.published ?? 0} tone="green" change={share(data?.stats.published)} note="of all posts" />
        <StatCard icon={<FilePenLine className="h-5 w-5" />} label="Drafts" value={data?.stats.draft ?? 0} tone="yellow" change={share(data?.stats.draft)} note="of all posts" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" /><input type="search" aria-label="Search gallery" placeholder="Search gallery posts" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className={`${field} w-full pl-11`} /></div>
        <select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={`${field} sm:w-44`}><option value="">All status</option><option value="published">Published</option><option value="draft">Draft</option></select>
      </div>
      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load the gallery.</p>}
      {!isLoading && rows.length === 0 && <p className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">{search || status ? "No posts match this filter." : "No gallery posts yet."}</p>}
      <div className={`overflow-x-auto bg-white ${isFetching && !isLoading ? "opacity-70" : ""}`}>
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-neutral-50 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500"><tr><th className="px-4 py-3">S. No</th><th className="px-4 py-3">Post</th><th className="px-4 py-3">Photos</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>{rows.map((p, index) => <tr key={p.id} className="border-t border-neutral-200 text-neutral-700"><td className="px-4 py-3">{(page - 1) * PAGE_SIZE + index + 1}</td><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden bg-neutral-100">{p.featuredImage ? <img src={p.featuredImage} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full" />}</div><div className="min-w-0"><Link href={`/dashboard/gallery/${p.id}`} className="font-semibold text-neutral-900 hover:underline">{p.title}</Link><p className="max-w-[280px] truncate text-xs text-neutral-500">{p.description || "No description"}</p></div></div></td><td className="px-4 py-3"><span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{p.images.length} photo{p.images.length === 1 ? "" : "s"}</span></td><td className="px-4 py-3">{p.category || "—"}</td><td className="px-4 py-3"><span className={p.status === "published" ? "text-success-700" : "text-neutral-600"}>{p.status === "published" ? "Published" : "Draft"}</span></td><td className="px-4 py-3"><div className="flex items-center gap-2"><Link href={`/dashboard/gallery/${p.id}`} aria-label={`View ${p.title}`} className="rounded-lg bg-primary-50 p-2 text-primary-700 hover:bg-primary-100"><Eye className="h-4 w-4" /></Link><Link href={`/dashboard/gallery/${p.id}/edit`} aria-label={`Edit ${p.title}`} className="rounded-lg bg-warning-50 p-2 text-warning-600 hover:bg-warning-100"><Pencil className="h-4 w-4" /></Link><button type="button" aria-label={`Delete ${p.title}`} onClick={() => setRemoving(p)} className="rounded-lg bg-danger-50 p-2 text-danger-600 hover:bg-danger-100"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody>
        </table>
      </div>
      <Pagination currentPage={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} />
      <Modal isOpen={removing !== null} onClose={() => setRemoving(null)} title="Delete this gallery post?" size="sm">
        <div className="space-y-4 p-4"><p className="text-sm text-neutral-600">“{removing?.title}” and its photos are removed from your site.</p><div className="flex justify-end gap-2"><button type="button" onClick={() => setRemoving(null)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Cancel</button><button type="button" disabled={remove.isPending} onClick={() => removing && remove.mutate(removing)} className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">{remove.isPending ? "Deleting…" : "Delete"}</button></div></div>
      </Modal>
    </div>
  );
}

function StatCard({ icon, label, value, tone, change, note }: { icon: React.ReactNode; label: string; value: number; tone: "blue" | "green" | "yellow"; change?: string; note?: string }) {
  const styles = { blue: "bg-[#eef4ff] text-[#1e2470]", green: "bg-[#ecfff2] text-[#08783e]", yellow: "bg-[#fffedc] text-[#695e00]" }[tone];
  const iconStyles = { blue: "bg-[#25127d]", green: "bg-[#00ac55]", yellow: "bg-[#f2a900]" }[tone];
  return (
    <div className={`rounded-2xl border border-white/80 p-4 shadow-sm ${styles}`}>
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${iconStyles}`}>{icon}</div>
      <p className="mt-3 text-sm font-semibold">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
      {change && <p className="mt-2 text-xs text-neutral-500"><span className={`font-semibold ${change.startsWith("-") ? "text-danger-600" : "text-success-600"}`}>{change}</span> {note} {!change.startsWith("-") && <ArrowUpRight className="ml-1 inline h-3.5 w-3.5 text-success-600" />}</p>}
    </div>
  );
}
