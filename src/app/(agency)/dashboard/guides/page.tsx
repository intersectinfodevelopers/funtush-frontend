"use client";

// Removed unused Image import to satisfy eslint no-unused-vars
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Compass, Footprints, CheckCircle2, AlertTriangle, Eye, Edit3, Trash2 } from "lucide-react";
import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { Pagination } from "@/components/ui/pagination";
import guidesData from "@/../data/guides.json";

type Guide = (typeof guidesData)[number];

export default function GuidesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const rows = useMemo<Guide[]>(() => {
    return guidesData.map((g) => ({ ...g }));
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const onTrek = rows.filter((r) => r.status === "on_trek").length;
    const available = rows.filter((r) => r.status === "available").length;
    const expiring = rows.filter((r) => r.certifications.some((c: { expiry: string }) => {
      const exp = new Date(c.expiry);
      const diff = (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 30;
    })).length;
    return { total, onTrek, available, expiring };
  }, [rows]);

  const filtered = useMemo(() => {
    return rows
        .filter((r) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q || r.name.toLowerCase().includes(q) || (r.phone || "").toLowerCase().includes(q);
        const matchesStatus = statusFilter === "all" ? true : r.status === statusFilter;
        const matchesLang =
          languageFilter === "all" ? true : (r.languages || []).includes(languageFilter);
        return matchesSearch && matchesStatus && matchesLang;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rows, search, statusFilter, languageFilter]);

  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  return (
    <div className="space-y-4 w-full min-h-screen">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <button type="button" onClick={() => router.push('/dashboard')} className="transition hover:text-neutral-900">Dashboard</button>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">All Guides</span>
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900">Guides</h1>
          <p className="text-sm leading-6 text-neutral-600">Manage trek guide profiles, certifications, and availability.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/guides/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">
            <Plus size={20} /> Add Guide
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <AnalyticsSummaryCard label="Total Guides" value={stats.total} tone="primary" icon={Compass} />
        <AnalyticsSummaryCard label="On Trek" value={stats.onTrek} tone="primary" icon={Footprints} />
        <AnalyticsSummaryCard label="Available" value={stats.available} tone="success" icon={CheckCircle2} />
        <AnalyticsSummaryCard label="Certs Expiring" value={stats.expiring} tone="danger" icon={AlertTriangle} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px_180px]">
        <label className="relative block">
          <input
            className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-4 pr-3 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            placeholder="Search guides"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </label>

        <select className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
          <option value="all">All status</option>
          <option value="available">Available</option>
          <option value="on_trek">On Trek</option>
          <option value="unavailable">Unavailable</option>
        </select>

        <select className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900" value={languageFilter} onChange={(e) => { setLanguageFilter(e.target.value); setCurrentPage(1); }}>
          <option value="all">All languages</option>
          {Array.from(new Set(rows.flatMap((r) => r.languages || []))).map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      <section className="overflow-x-auto border-t border-neutral-200 bg-white">
        <table className="min-w-full border-collapse text-left text-sm text-neutral-700">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">S.NO</th>
              <th className="px-4 py-3">Guide</th>
              <th className="px-4 py-3">Languages</th>
              <th className="px-4 py-3">Certifications</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-500">No guides match your filters.</td>
              </tr>
            ) : (
              paginated.map((guide, idx) => (
                <tr key={guide.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-700">{(safePage - 1) * perPage + idx + 1}</td>
                  <td className="px-4 py-3 text-neutral-900">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-semibold">
                        {guide.name.split(" ").map((p: string) => p[0]).slice(0,2).join("")}
                      </div>
                      <div>
                        <div className="font-semibold">{guide.name}</div>
                        <div className="text-xs text-neutral-500">{guide.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{(guide.languages || []).join(', ')}</td>
                  <td className="px-4 py-3">
                    {guide.certifications && guide.certifications.length > 0 ? (
                      <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                        <div>{guide.certifications[0].name}</div>
                        <div className="text-xs text-neutral-400">{guide.certifications[0].number}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-400">—</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{guide.rating ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-sm font-semibold ${guide.status === 'available' ? 'text-emerald-700 bg-emerald-50' : guide.status === 'on_trek' ? 'text-sky-700 bg-sky-50' : 'text-rose-700 bg-rose-50'}`}>
                      <span>{guide.status === 'available' ? 'Available' : guide.status === 'on_trek' ? 'On Trek' : 'Unavailable'}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Preview ${guide.name}`}
                        onClick={() => { /* view */ }}
                        className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition hover:bg-primary-100"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Edit ${guide.name}`}
                        onClick={() => router.push(`/dashboard/guides/${guide.id}/edit`)}
                        className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-md bg-warning-50 text-warning-700 transition hover:bg-warning-100"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${guide.name}`}
                        onClick={() => { /* delete */ }}
                        className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-md bg-danger-50 text-danger-700 transition hover:bg-danger-100"
                      >
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