"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, Globe2, Mountain, Pencil, Plus, Star, Trash2 } from "lucide-react";

import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDestinationList } from "@/hooks/useAgencyDestinations";
import { DESTINATION_CATEGORIES, deleteDestination, updateDestination, type Destination } from "@/lib/api/agency/destinations";
import type { ApiError } from "@/lib/api/client";

const PAGE_SIZE = 20;
const field = "rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100";

export default function DestinationsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState<Destination | null>(null);
  const debounced = useDebouncedValue(search.trim());

  const { data, isLoading, isError, isFetching } = useDestinationList({ search: debounced || undefined, category: category || undefined, page, limit: PAGE_SIZE });
  const stats = data?.stats;
  const rows = data?.destinations ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const refresh = () => qc.invalidateQueries({ queryKey: ["agency", "destinations"] });
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };

  // "% from last month": destinations now vs when this month began — real counts only.
  const growth = !stats ? undefined : stats.totalBeforeMonth === 0 ? (stats.total > 0 ? `${stats.total} new` : undefined) : `${stats.total >= stats.totalBeforeMonth ? "+" : ""}${(((stats.total - stats.totalBeforeMonth) / stats.totalBeforeMonth) * 100).toFixed(1)}%`;
  const share = (n?: number) => (n === undefined || !stats?.total ? undefined : `${Math.round((n / stats.total) * 1000) / 10}%`);

  const toggle = useMutation({
    mutationFn: ({ d, key }: { d: Destination; key: "published" | "featured" }) => updateDestination(d.id, { [key]: !d[key] }),
    onSuccess: (_r, { d, key }) => {
      toast.success(key === "published" ? (d.published ? `“${d.title}” was unpublished` : `“${d.title}” is now published`) : (d.featured ? `“${d.title}” is no longer featured` : `“${d.title}” is now featured`));
      void refresh();
    },
    onError: (e, { d }) => toast.error(`“${d.title}”: ${(e as unknown as ApiError).message || "that didn't work — please try again."}`, { duration: 6000 }),
  });
  const remove = useMutation({
    mutationFn: (d: Destination) => deleteDestination(d.id),
    onSuccess: (_r, d) => { toast.success(`“${d.title}” was deleted`); setRemoving(null); void refresh(); },
    onError: (e, d) => { setRemoving(null); toast.error(`Couldn't delete “${d.title}”: ${(e as unknown as ApiError).message || "please try again."}`); },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-neutral-500"><Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span><span className="font-semibold text-neutral-900">Destinations</span></div>
          <h1 className="text-2xl font-bold text-neutral-900">Destinations</h1>
          <p className="text-sm text-neutral-600">Manage trekking destinations and seasonal information.</p>
        </div>
        <Link href="/dashboard/destinations/new" className="inline-flex items-center gap-2 self-start rounded-xl bg-primary-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-800"><Plus className="h-4 w-4" /> New Destination</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsSummaryCard label="Total Destinations" value={stats?.total ?? "—"} tone="primary" icon={Globe2} change={growth} />
        <AnalyticsSummaryCard label="Published" value={stats?.published ?? "—"} tone="primary" icon={Eye} change={share(stats?.published)} note="of all destinations" />
        <AnalyticsSummaryCard label="Featured" value={stats?.featured ?? "—"} tone="success" icon={Star} change={share(stats?.featured)} note="of all destinations" />
        <AnalyticsSummaryCard label="Regions" value={stats?.regions ?? "—"} tone="warning" icon={Mountain} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_200px]">
        <input type="search" aria-label="Search destinations" placeholder="Search destinations" value={search} onChange={(e) => reset(setSearch)(e.target.value)} className={`${field} w-full`} />
        <select aria-label="Filter by category" value={category} onChange={(e) => reset(setCategory)(e.target.value)} className={field}>
          <option value="">All categories</option>
          {(data?.categories ?? [...DESTINATION_CATEGORIES]).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load destinations.</p>}

      <div className={`overflow-hidden border border-neutral-200 bg-white ${isFetching && !isLoading ? "opacity-70" : ""}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              <tr><th className="w-14 px-4 py-3.5">S.No</th><th className="px-4 py-3.5">Image</th><th className="px-4 py-3.5">Name</th><th className="px-4 py-3.5">Category</th><th className="px-4 py-3.5">Rating</th><th className="px-4 py-3.5">Engagement</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5">Actions</th></tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => <tr key={i} className="border-t border-neutral-200"><td colSpan={8} className="px-4 py-5"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td></tr>)}
              {!isLoading && rows.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-neutral-500">{search || category ? "No destinations match this filter." : "No destinations yet — add your first one."}</td></tr>}
              {rows.map((d, index) => (
                <tr key={d.id} className="border-t border-neutral-200 hover:bg-neutral-50/60">
                  <td className="px-4 py-4 text-neutral-600">{(page - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="px-4 py-4">
                    {d.featuredImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.featuredImage} alt="" className="h-12 w-16 rounded-md object-cover" />
                    ) : (
                      <span className="flex h-12 w-16 items-center justify-center rounded-md bg-neutral-100 text-[10px] text-neutral-400">No image</span>
                    )}
                  </td>
                  <td className="px-4 py-4"><Link href={`/dashboard/destinations/${d.id}`} className="font-bold text-neutral-900 hover:underline">{d.title}</Link>{d.region && <div className="text-xs text-neutral-500">{d.region}</div>}</td>
                  <td className="px-4 py-4 text-neutral-700">{d.category ?? "-"}</td>
                  <td className="px-4 py-4 text-neutral-700"><span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-400" />{d.rating != null ? d.rating.toFixed(1) : "-"}<span className="text-xs text-neutral-400">({d.reviewCount})</span></span></td>
                  <td className="px-4 py-4 text-xs text-neutral-600"><div>Views: {d.engagement.views}</div><div>Saves: {d.engagement.saves}</div></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button type="button" role="switch" aria-checked={d.published} aria-label={`Published: ${d.title}`} disabled={toggle.isPending} onClick={() => toggle.mutate({ d, key: "published" })} className={`flex h-6 w-11 items-center rounded-full p-0.5 transition disabled:opacity-50 ${d.published ? "bg-primary-900" : "bg-neutral-200"}`}><span className={`h-5 w-5 rounded-full bg-white shadow transition ${d.published ? "translate-x-5" : ""}`} /></button>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${d.published ? "bg-success-50 text-success-700" : "bg-neutral-100 text-neutral-600"}`}><span className={`h-1.5 w-1.5 rounded-full ${d.published ? "bg-success-600" : "bg-neutral-400"}`} />{d.published ? "Published" : "Draft"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/dashboard/destinations/${d.id}`} aria-label={`View ${d.title}`} title="View" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition hover:bg-primary-100"><Eye className="h-4 w-4" /></Link>
                      <Link href={`/dashboard/destinations/${d.id}/edit`} aria-label={`Edit ${d.title}`} title="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-warning-50 text-warning-700 transition hover:bg-warning-100"><Pencil className="h-4 w-4" /></Link>
                      <button type="button" aria-label={d.featured ? `Remove ${d.title} from featured` : `Feature ${d.title}`} title={d.featured ? "Featured — click to remove" : "Feature this destination"} disabled={toggle.isPending} onClick={() => toggle.mutate({ d, key: "featured" })} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition hover:bg-amber-50 disabled:opacity-50"><Star className={`h-4 w-4 ${d.featured ? "fill-amber-400 text-amber-500" : ""}`} /></button>
                      <button type="button" aria-label={`Delete ${d.title}`} title="Delete" onClick={() => setRemoving(d)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-danger-50 text-danger-700 transition hover:bg-danger-100"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination currentPage={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={removing !== null} onClose={() => setRemoving(null)} title="Delete this destination?" size="sm">
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
