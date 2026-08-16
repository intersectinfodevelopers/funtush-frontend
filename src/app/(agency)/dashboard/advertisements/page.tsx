"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { AnalyticsSummaryCard } from '@/components/shared/AnalyticsSummaryCard';
import { Pagination } from '@/components/ui/pagination';
import adsData from '@/../data/advertisements.json';

type Ad = (typeof adsData)[number];

export default function Page() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const rows = useMemo<Ad[]>(() => adsData.map((a) => ({ ...a })), []);

  const stats = useMemo(
    () => ({ total: rows.length, active: rows.filter((r) => r.status === 'active').length }),
    [rows]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((r) => {
        const matchesSearch = !q || r.title.toLowerCase().includes(q) || r.position.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'all' ? true : r.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
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
            <strong className="text-neutral-900">Advertisements</strong>
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900">Advertisements</h1>
          <p className="text-sm leading-6 text-neutral-600">Manage site advertisements and placements.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/advertisements/new" className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">
            Add New Ad
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <AnalyticsSummaryCard label="Total Ads" value={stats.total} tone="primary" icon={() => null} />
        <AnalyticsSummaryCard label="Active" value={stats.active} tone="success" icon={() => null} />
        <AnalyticsSummaryCard label="Paused" value={stats.total - stats.active} tone="warning" icon={() => null} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px_180px]">
        <label className="relative block">
          <input
            className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-4 pr-3 text-sm text-neutral-900 outline-none"
            placeholder="Search ads by title or position"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </label>

        <select className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>

        <div />
      </div>

      <section className="overflow-x-auto border-t border-neutral-200 bg-white">
        <table className="min-w-full border-collapse text-left text-sm text-neutral-700">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">S.NO</th>
              <th className="px-4 py-3">Ad</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Engagement</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-500">No advertisements found.</td>
              </tr>
            ) : (
              paginated.map((item, idx) => (
                <tr key={item.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                  <td className="px-4 py-3">{(safePage - 1) * perPage + idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-20 rounded bg-neutral-100 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-xs text-neutral-500">{item.startDate} → {item.endDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.position}</td>
                  <td className="px-4 py-3">Clicks: {item.clicks} · Impr: {item.impressions}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`#`} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700">
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
