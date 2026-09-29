"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CalendarDays, CheckCircle2, Eye, Pencil, Plus, Tag, Trash2, XCircle } from "lucide-react";

import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { Modal } from "@/components/ui/modal";
import { useCategoryList } from "@/hooks/useAgencyBlog";
import { deleteCategory, type BlogCategory } from "@/lib/api/agency/blog";
import type { ApiError } from "@/lib/api/client";

const field = "rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const SORTS = {
  newest: { label: "Newest", fn: (a: BlogCategory, b: BlogCategory) => b.createdAt.localeCompare(a.createdAt) },
  oldest: { label: "Oldest", fn: (a: BlogCategory, b: BlogCategory) => a.createdAt.localeCompare(b.createdAt) },
  name: { label: "Name (A–Z)", fn: (a: BlogCategory, b: BlogCategory) => a.name.localeCompare(b.name) },
  order: { label: "Display order", fn: (a: BlogCategory, b: BlogCategory) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name) },
  posts: { label: "Most posts", fn: (a: BlogCategory, b: BlogCategory) => b.postCount - a.postCount },
} as const;
type SortKey = keyof typeof SORTS;
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function CategoriesPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useCategoryList();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [removing, setRemoving] = useState<BlogCategory | null>(null);
  const stats = data?.stats;

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.data ?? []).filter((c) => !q || c.name.toLowerCase().includes(q) || c.slug.includes(q) || (c.description ?? "").toLowerCase().includes(q)).sort(SORTS[sort].fn);
  }, [data, search, sort]);

  // "% from last month": categories now vs when this month began — real counts only.
  const growth = !stats ? undefined : stats.totalBeforeMonth === 0 ? (stats.total > 0 ? `${stats.total} new` : undefined) : `${stats.total >= stats.totalBeforeMonth ? "+" : ""}${(((stats.total - stats.totalBeforeMonth) / stats.totalBeforeMonth) * 100).toFixed(1)}%`;
  const share = (n?: number) => (n === undefined || !stats?.total ? undefined : `${Math.round((n / stats.total) * 1000) / 10}%`);

  const remove = useMutation({
    mutationFn: (c: BlogCategory) => deleteCategory(c.id),
    onSuccess: (_r, c) => { toast.success(`“${c.name}” was deleted`); setRemoving(null); void qc.invalidateQueries({ queryKey: ["agency", "categories"] }); },
    onError: (e, c) => { setRemoving(null); toast.error((e as unknown as ApiError).message || `Couldn't delete “${c.name}”.`, { duration: 7000 }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-neutral-500"><Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span><span className="font-semibold text-neutral-900">Categories</span></div>
          <h1 className="text-2xl font-bold text-neutral-900">Categories</h1>
          <p className="text-sm text-neutral-600">Manage blog sections and topic groups used across the site.</p>
        </div>
        <Link href="/dashboard/categories/new" className="inline-flex items-center gap-2 self-start rounded-full bg-primary-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-800"><Plus className="h-4 w-4" /> Add category</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <AnalyticsSummaryCard label="Total Categories" value={stats?.total ?? "—"} tone="primary" icon={Tag} change={growth} />
        <AnalyticsSummaryCard label="Active" value={stats?.active ?? "—"} tone="success" icon={CheckCircle2} change={share(stats?.active)} note="of all categories" />
        <AnalyticsSummaryCard label="Inactive" value={stats?.inactive ?? "—"} tone="warning" icon={XCircle} change={share(stats?.inactive)} note="of all categories" />
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_200px]">
        <input type="search" aria-label="Search categories" placeholder="Search categories" value={search} onChange={(e) => setSearch(e.target.value)} className={`${field} w-full`} />
        <select aria-label="Sort categories" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={field}>
          {(Object.keys(SORTS) as SortKey[]).map((k) => <option key={k} value={k}>{SORTS[k].label}</option>)}
        </select>
      </div>

      {isError && <p role="alert" className="border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load categories.</p>}

      <div className="overflow-hidden border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              <tr><th className="w-14 px-4 py-3.5">S.No</th><th className="px-4 py-3.5">Name</th><th className="px-4 py-3.5">Slug</th><th className="px-4 py-3.5">Description</th><th className="px-4 py-3.5">Posts</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5">Updated</th><th className="px-4 py-3.5 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => <tr key={i} className="border-t border-neutral-200"><td colSpan={8} className="px-4 py-5"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td></tr>)}
              {!isLoading && rows.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-neutral-500">{search ? "No categories match your search." : "No categories yet — add your first one."}</td></tr>}
              {rows.map((c, i) => (
                <tr key={c.id} className="border-t border-neutral-200 hover:bg-neutral-50/60">
                  <td className="px-4 py-4 text-neutral-600">{i + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: c.color }} aria-hidden="true" />
                      <div><Link href={`/dashboard/categories/${c.id}`} className="font-bold text-neutral-900 hover:underline">{c.name}</Link><div className="text-xs text-neutral-500">Order #{c.displayOrder}</div></div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><span className="inline-block rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">{c.slug}</span></td>
                  <td className="max-w-xs px-4 py-4 text-neutral-700"><p className="line-clamp-3">{c.description || "—"}</p></td>
                  <td className="px-4 py-4 font-bold text-neutral-900">{c.postCount}</td>
                  <td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${c.isActive ? "bg-success-50 text-success-700" : "bg-neutral-100 text-neutral-600"}`}>{c.isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}{c.isActive ? "Active" : "Inactive"}</span></td>
                  <td className="px-4 py-4 text-neutral-700"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-neutral-400" />{fmt(c.updatedAt)}</span></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/dashboard/categories/${c.id}`} aria-label={`View ${c.name}`} title="View" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition hover:bg-primary-100"><Eye className="h-4 w-4" /></Link>
                      <Link href={`/dashboard/categories/${c.id}/edit`} aria-label={`Edit ${c.name}`} title="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-warning-50 text-warning-700 transition hover:bg-warning-100"><Pencil className="h-4 w-4" /></Link>
                      <button type="button" aria-label={`Delete ${c.name}`} title="Delete" onClick={() => setRemoving(c)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-danger-50 text-danger-700 transition hover:bg-danger-100"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={removing !== null} onClose={() => setRemoving(null)} title="Delete this category?" size="sm">
        <div className="space-y-4 p-4">
          <p className="text-sm text-neutral-600">“{removing?.name}” will be removed.{removing && removing.postCount > 0 ? ` It is used by ${removing.postCount} post${removing.postCount === 1 ? "" : "s"}, so the server will refuse — mark it inactive instead.` : " This can't be undone."}</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRemoving(null)} className="border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Cancel</button>
            <button type="button" disabled={remove.isPending} onClick={() => removing && remove.mutate(removing)} className="bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">{remove.isPending ? "Deleting…" : "Delete"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
