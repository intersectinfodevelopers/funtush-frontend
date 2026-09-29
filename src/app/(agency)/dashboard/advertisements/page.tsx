"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, Megaphone, MousePointerClick, Pencil, Plus, Trash2 } from "lucide-react";

import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAdList, useAdPositions } from "@/hooks/useAgencyAds";
import { deleteAd, type SiteAd } from "@/lib/api/agency/ads";
import type { ApiError } from "@/lib/api/client";

const PAGE_SIZE = 20;
const field = "rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const TABS = ["All", "Active", "Paused"] as const;
type Tab = (typeof TABS)[number];

export default function AdvertisementsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("All");
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState<SiteAd | null>(null);
  const debounced = useDebouncedValue(search.trim());
  const positions = useAdPositions();
  const { data, isLoading, isError, isFetching } = useAdList({ status: tab === "All" ? undefined : tab.toLowerCase(), search: debounced || undefined, page, limit: PAGE_SIZE });
  const rows = data?.ads ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const stats = data?.stats;
  // Real numbers only: "% from last month" compares against ads that existed before this month began.
  const growth = !stats ? undefined : stats.totalBeforeMonth === 0 ? (stats.total > 0 ? `${stats.total} new` : undefined) : `${stats.total >= stats.totalBeforeMonth ? "+" : ""}${(((stats.total - stats.totalBeforeMonth) / stats.totalBeforeMonth) * 100).toFixed(1)}%`;
  const share = (n?: number) => (n === undefined || !stats?.total ? undefined : `${Math.round((n / stats.total) * 1000) / 10}%`);
  const counts = useMemo(() => ({ All: stats?.total ?? 0, Active: stats?.active ?? 0, Paused: stats?.paused ?? 0 }), [stats]);
  const label = (id: string) => positions.data?.find((p) => p.id === id)?.label ?? id;

  const refresh = () => qc.invalidateQueries({ queryKey: ["agency", "ads"] });
  const remove = useMutation({
    mutationFn: (a: SiteAd) => deleteAd(a.id),
    onSuccess: (_r, a) => { toast.success(`“${a.title}” was deleted`); setRemoving(null); void refresh(); },
    onError: (e, a) => { setRemoving(null); toast.error((e as unknown as ApiError).message || `Couldn't delete “${a.title}”.`); },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-neutral-500"><Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span><span className="font-semibold text-neutral-900">Advertisements</span></div>
          <h1 className="text-2xl font-bold text-neutral-900">Manage Advertisements</h1>
          <p className="text-sm text-neutral-600">Manage site advertisements and placements.</p>
        </div>
        <Link href="/dashboard/advertisements/new" className="inline-flex items-center gap-2 self-start rounded-full bg-primary-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-800"><Plus className="h-4 w-4" /> Add Advertisement</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsSummaryCard label="Total Advertisements" value={stats ? stats.total : "—"} tone="primary" icon={Megaphone} change={growth} />
        <AnalyticsSummaryCard label="Active" value={stats ? stats.active : "—"} tone="success" icon={Eye} change={share(stats?.active)} note="of all ads" />
        <AnalyticsSummaryCard label="Total Clicks" value={stats ? stats.totalClicks.toLocaleString() : "—"} tone="warning" icon={MousePointerClick} />
        <AnalyticsSummaryCard label="Total Impressions" value={stats ? stats.totalImpressions.toLocaleString() : "—"} tone="accent" icon={Eye} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_200px]">
        <input type="search" aria-label="Search advertisements" placeholder="Search advertisements" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className={`${field} w-full`} />
        <select aria-label="Filter by status" value={tab} onChange={(e) => { setTab(e.target.value as Tab); setPage(1); }} className={field}>
          {TABS.map((t) => <option key={t} value={t}>{t === "All" ? "All status" : t}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-6 border-b border-neutral-200">
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => { setTab(t); setPage(1); }} className={`flex items-center gap-1.5 border-b-2 pb-2.5 text-sm font-semibold transition ${tab === t ? "border-primary-900 text-primary-900" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}>
            {t}<span className={`rounded-full px-1.5 py-0.5 text-xs ${tab === t ? "bg-primary-50 text-primary-900" : "bg-neutral-100 text-neutral-500"}`}>{stats ? counts[t] : "—"}</span>
          </button>
        ))}
      </div>

      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load advertisements.</p>}

      <div className={`overflow-hidden rounded-2xl border border-neutral-200 bg-white ${isFetching && !isLoading ? "opacity-70" : ""}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              <tr><th className="w-14 px-4 py-3.5">S.No</th><th className="px-4 py-3.5">Advertisement</th><th className="px-4 py-3.5">Position</th><th className="px-4 py-3.5">Clicks</th><th className="px-4 py-3.5">Impressions</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => <tr key={i} className="border-t border-neutral-200"><td colSpan={7} className="px-4 py-5"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td></tr>)}
              {!isLoading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-500">{search || tab !== "All" ? "No advertisements match this filter." : "No advertisements yet — add your first one."}</td></tr>}
              {rows.map((a, index) => (
                <tr key={a.id} className="border-t border-neutral-200 hover:bg-neutral-50/60">
                  <td className="px-4 py-4 text-neutral-600">{(page - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.image} alt="" className="h-12 w-16 shrink-0 rounded-md object-cover" />
                      <Link href={`/dashboard/advertisements/${a.id}`} className="font-bold text-neutral-900 hover:underline">{a.title}</Link>
                    </div>
                  </td>
                  <td className="px-4 py-4"><span className="inline-block rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-800">{label(a.position)}</span></td>
                  <td className="px-4 py-4 text-neutral-700">{a.clicks.toLocaleString()}</td>
                  <td className="px-4 py-4 text-neutral-700">{a.impressions.toLocaleString()}</td>
                  <td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${a.status === "active" ? "bg-success-50 text-success-700" : "bg-neutral-100 text-neutral-600"}`}><span className={`h-1.5 w-1.5 rounded-full ${a.status === "active" ? "bg-success-600" : "bg-neutral-400"}`} />{a.status === "active" ? "Active" : "Paused"}</span></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/dashboard/advertisements/${a.id}`} aria-label={`View ${a.title}`} title="View" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition hover:bg-primary-100"><Eye className="h-4 w-4" /></Link>
                      <Link href={`/dashboard/advertisements/${a.id}/edit`} aria-label={`Edit ${a.title}`} title="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-warning-50 text-warning-700 transition hover:bg-warning-100"><Pencil className="h-4 w-4" /></Link>
                      <button type="button" aria-label={`Delete ${a.title}`} title="Delete" onClick={() => setRemoving(a)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-danger-50 text-danger-700 transition hover:bg-danger-100"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination currentPage={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={removing !== null} onClose={() => setRemoving(null)} title="Delete this advertisement?" size="sm">
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
