"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, FileText, Pencil, Plus, Trash2 } from "lucide-react";

import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { Modal } from "@/components/ui/modal";
import { useBlogs, useCategories } from "@/hooks/useAgencyBlog";
import { deleteBlog, type BlogPost } from "@/lib/api/agency/blog";
import type { ApiError } from "@/lib/api/client";

const field = "rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const TABS = ["All", "Published", "Draft", "Scheduled"] as const;
type Tab = (typeof TABS)[number];
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export default function BlogPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useBlogs();
  const categories = useCategories();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [tab, setTab] = useState<Tab>("All");
  const [removing, setRemoving] = useState<BlogPost | null>(null);

  const posts = data?.data ?? [];
  const counts = useMemo(() => ({
    All: posts.length,
    Published: posts.filter((p) => p.status === "PUBLISHED").length,
    Draft: posts.filter((p) => (p.status ?? "DRAFT") === "DRAFT").length,
    Scheduled: posts.filter((p) => p.status === "SCHEDULED").length,
  }), [posts]);
  const totalViews = useMemo(() => posts.reduce((sum, p) => sum + p.views, 0), [posts]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) =>
      (tab === "All" || (tab === "Draft" ? (p.status ?? "DRAFT") === "DRAFT" : p.status === tab.toUpperCase())) &&
      (!status || p.status === status) &&
      (!category || p.category?.id === category) &&
      (!q || p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)));
  }, [posts, search, status, category, tab]);

  const remove = useMutation({
    mutationFn: (p: BlogPost) => deleteBlog(p.id),
    onSuccess: (_r, p) => { toast.success(`“${p.title}” was deleted`); setRemoving(null); void qc.invalidateQueries({ queryKey: ["agency", "blogs"] }); },
    onError: (e, p) => { setRemoving(null); toast.error((e as unknown as ApiError).message || `Couldn't delete “${p.title}”.`); },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-neutral-500"><Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span><span className="font-semibold text-neutral-900">All Blogs</span></div>
          <h1 className="text-2xl font-bold text-neutral-900">All Blogs</h1>
          <p className="text-sm text-neutral-600">Manage and organize all your blog posts.</p>
        </div>
        <Link href="/dashboard/blog/new" className="inline-flex items-center gap-2 self-start rounded-full bg-primary-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-800"><Plus className="h-4 w-4" /> Add new Blog</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsSummaryCard label="Total Blogs" value={data ? counts.All : "—"} tone="primary" icon={FileText} />
        <AnalyticsSummaryCard label="Published" value={data ? counts.Published : "—"} tone="success" icon={FileText} />
        <AnalyticsSummaryCard label="Draft" value={data ? counts.Draft : "—"} tone="warning" icon={FileText} />
        <AnalyticsSummaryCard label="Total Views" value={data ? totalViews.toLocaleString() : "—"} tone="accent" icon={Eye} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_200px_200px]">
        <input type="search" aria-label="Search blogs" placeholder="Search blogs" value={search} onChange={(e) => setSearch(e.target.value)} className={`${field} w-full`} />
        <select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)} className={field}><option value="">All categories</option>{(categories.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className={field}><option value="">All status</option><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="SCHEDULED">Scheduled</option></select>
      </div>

      <div className="flex items-center gap-6 border-b border-neutral-200">
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`flex items-center gap-1.5 border-b-2 pb-2.5 text-sm font-semibold transition ${tab === t ? "border-primary-900 text-primary-900" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}>
            {t}<span className={`rounded-full px-1.5 py-0.5 text-xs ${tab === t ? "bg-primary-50 text-primary-900" : "bg-neutral-100 text-neutral-500"}`}>{data ? counts[t] : "—"}</span>
          </button>
        ))}
      </div>

      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load posts.</p>}

      <div className="overflow-hidden border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              <tr><th className="w-14 px-4 py-3.5">S.No</th><th className="px-4 py-3.5">Blog</th><th className="px-4 py-3.5">Category</th><th className="px-4 py-3.5">Published Date</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5">Views</th><th className="px-4 py-3.5 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => <tr key={i} className="border-t border-neutral-200"><td colSpan={7} className="px-4 py-5"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td></tr>)}
              {!isLoading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-500">{search || status || category || tab !== "All" ? "No posts match this filter." : "No posts yet — write your first one."}</td></tr>}
              {rows.map((p, index) => (
                <tr key={p.id} className="border-t border-neutral-200 hover:bg-neutral-50/60">
                  <td className="px-4 py-4 text-neutral-600">{index + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {p.photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photos[0]} alt="" className="h-12 w-16 shrink-0 rounded-md object-cover" />
                      ) : (
                        <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-[10px] text-neutral-400">No image</span>
                      )}
                      <Link href={`/dashboard/blog/${p.id}`} className="font-bold text-neutral-900 hover:underline">{p.title}</Link>
                    </div>
                  </td>
                  <td className="px-4 py-4">{p.category ? <span className="inline-block rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-800">{p.category.name}</span> : <span className="text-neutral-400">—</span>}</td>
                  <td className="px-4 py-4 text-neutral-700">{fmt(p.status === "SCHEDULED" && p.publishAt ? p.publishAt : p.createdAt)}</td>
                  <td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${p.status === "PUBLISHED" ? "bg-success-50 text-success-700" : p.status === "SCHEDULED" ? "bg-accent-50 text-accent-700" : "bg-neutral-100 text-neutral-600"}`}><span className={`h-1.5 w-1.5 rounded-full ${p.status === "PUBLISHED" ? "bg-success-600" : p.status === "SCHEDULED" ? "bg-accent-600" : "bg-neutral-400"}`} />{p.status === "PUBLISHED" ? "Published" : p.status === "SCHEDULED" ? "Scheduled" : "Draft"}</span></td>
                  <td className="px-4 py-4 font-semibold text-neutral-900">{p.views.toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/dashboard/blog/${p.id}`} aria-label={`View ${p.title}`} title="View" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition hover:bg-primary-100"><Eye className="h-4 w-4" /></Link>
                      <Link href={`/dashboard/blog/${p.id}/edit`} aria-label={`Edit ${p.title}`} title="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-warning-50 text-warning-700 transition hover:bg-warning-100"><Pencil className="h-4 w-4" /></Link>
                      <button type="button" aria-label={`Delete ${p.title}`} title="Delete" onClick={() => setRemoving(p)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-danger-50 text-danger-700 transition hover:bg-danger-100"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {data && data.meta.total > posts.length && <p className="text-xs text-neutral-500">Showing the latest {posts.length} of {data.meta.total} posts.</p>}

      <Modal isOpen={removing !== null} onClose={() => setRemoving(null)} title="Delete this post?" size="sm">
        <div className="space-y-4 p-4">
          <p className="text-sm text-neutral-600">“{removing?.title}” is removed and can&apos;t be restored.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRemoving(null)} className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Cancel</button>
            <button type="button" disabled={remove.isPending} onClick={() => removing && remove.mutate(removing)} className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">{remove.isPending ? "Deleting…" : "Delete"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
