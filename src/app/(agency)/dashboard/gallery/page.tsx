"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Eye, Edit3, Trash2 } from "lucide-react";
import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { Pagination } from "@/components/ui/pagination";
import galleryData from "@/../data/gallery.json";

type Gallery = (typeof galleryData)[number];

export default function GalleryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const rows = useMemo<Gallery[]>(() => galleryData.map((g) => ({ ...g })), []);

  const stats = useMemo(() => ({ total: rows.length, published: rows.filter((r) => r.status === 'published').length }), [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesSearch = !q || r.title.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' ? true : r.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
  }, [rows, search, statusFilter]);

  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  return (
    <div className="space-y-4 w-full min-h-screen">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Link href="/dashboard" className="transition hover:text-neutral-900">Dashboard</Link>
            <span className="text-neutral-300">/</span>
            <strong className="text-neutral-900">Manage Gallery</strong>
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900">Manage Gallery</h1>
          <p className="text-sm leading-6 text-neutral-600">Upload and manage photos used across the site.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/gallery/new" className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">
            <Plus size={18} /> Upload Image
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <AnalyticsSummaryCard label="Total Photos" value={stats.total} tone="primary" icon={() => null} />
        <AnalyticsSummaryCard label="Published" value={stats.published} tone="success" icon={() => null} />
        <AnalyticsSummaryCard label="Drafts" value={stats.total - stats.published} tone="warning" icon={() => null} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px_180px]">
        <label className="relative block">
          <input
            className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-4 pr-3 text-sm text-neutral-900 outline-none"
            placeholder="Search gallery"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </label>

        <select className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
          <option value="all">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <div />
      </div>

      <section className="overflow-x-auto border-t border-neutral-200 bg-white">
        <table className="min-w-full border-collapse text-left text-sm text-neutral-700">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">S.NO</th>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Engagement</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-500">No photos found.</td>
              </tr>
            ) : (
              paginated.map((item, idx) => (
                <tr key={item.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                  <td className="px-4 py-3">{(safePage - 1) * perPage + idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded bg-neutral-100 bg-cover" style={{ backgroundImage: `url(${item.image})` }} />
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-xs text-neutral-500">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3">Likes: {item.likes} · Views: {item.views}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button aria-label={`Preview ${item.title}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                        <Eye className="h-4 w-4" />
                      </button>
                      <Link href={`/dashboard/gallery/${item.id}/edit`} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-warning-50 text-warning-700">
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button aria-label={`Delete ${item.title}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-danger-50 text-danger-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <div className="flex items-center justify-end">
        <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
