"use client";

import { useMemo, useState, useEffect } from "react";
// Link not used here
import { useRouter } from "next/navigation";
import destinationsJson from "@/../data/destinations.json";
import { AnalyticsSummaryCard } from '@/components/shared/AnalyticsSummaryCard';
import Toggle from '@/components/ui/Toggle';
import { Compass, Mountain, Star, Eye, Edit3, Trash2 } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';

interface Destination {
  id: string;
  title: string;
  slug?: string;
  category?: string;
  shortDesc?: string;
  longDesc?: string;
  region?: string;
  difficulty?: string;
  maxAltitude?: string | number;
  bestSeason?: string;
  featured?: boolean;
  published?: boolean;
  image?: { url?: string; width?: number; height?: number };
  gallery?: Array<{ url: string; caption?: string; order?: number }>;
  rating?: number;
  reviewCount?: number;
  activities?: string[];
  duration?: { min?: number; max?: number };
  altitude?: { min?: number; max?: number };
  bestTime?: string;
  routes?: Array<Record<string, unknown>>;
  engagement?: { views?: number; saves?: number };
  createdAt?: string;
  updatedAt?: string;
}

const destinationRows: Destination[] = (destinationsJson as Destination[])
  .slice()
  .sort((a, b) => (a.title || '').localeCompare(b.title || ''));

export default function DestinationsPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [destinations, setDestinations] = useState<Destination[]>(destinationRows);
  const [actionDialog, setActionDialog] = useState<null | { type: 'delete' | 'edit' | 'feature'; destination: Destination }>(null);
  const [previewDest, setPreviewDest] = useState<Destination | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem("destinations");
      if (!stored) return;
      const parsed = JSON.parse(stored) as Destination[];
      // defer setState to avoid synchronous state update inside effect
      setTimeout(() => setDestinations(parsed.sort((a, b) => (a.title || '').localeCompare(b.title || ''))), 0);
    } catch {
      // ignore and use defaults
    }
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(destinations.map((d) => d.category).filter(Boolean))) as string[];
  }, [destinations]);

  const filtered = useMemo(() => {
    return destinations
      .filter((d) => {
        const matchesSearch =
          (d.title || '').toLowerCase().includes(search.toLowerCase()) ||
          (d.shortDesc || '').toLowerCase().includes(search.toLowerCase()) ||
          (d.region || '').toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory ? d.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }, [destinations, search, selectedCategory]);

  

  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, safePage]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <button type="button" onClick={() => router.push('/dashboard')} className="transition hover:text-neutral-900">Dashboard</button>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">Destinations</span>
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900">Destinations</h1>
          <p className="text-sm leading-6 text-neutral-600">Manage trekking destinations and seasonal information.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard/destinations/new')}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800 shadow-sm"
          >
            + New Destination
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <AnalyticsSummaryCard label="Total Destinations" value={destinations.length} tone="primary" icon={Compass} />
        <AnalyticsSummaryCard label="Published" value={destinations.filter((d) => d.published).length} tone="accent" icon={Eye} />
        <AnalyticsSummaryCard label="Featured" value={destinations.filter((d) => d.featured).length} tone="success" icon={Star} />
        <AnalyticsSummaryCard label="Regions" value={new Set(destinations.map((d) => d.region)).size} tone="warning" icon={Mountain} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px]">
        <label className="relative block">
          <input
            className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-4 pr-3 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            placeholder="Search destinations"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </label>
        <select
          className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto border-t border-neutral-200 bg-white/90">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Engagement</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-500">No destinations found.</td>
              </tr>
            ) : (
              paginated.map((d) => (
                <tr key={d.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    {d.image?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.image.url} alt={d.title} className="h-10 w-16 object-cover rounded" />
                    ) : (
                      <div className="h-10 w-16 bg-neutral-100 flex items-center justify-center rounded text-xs text-neutral-400">No image</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-900">
                    <div className="font-semibold">{d.title}</div>
                    {d.shortDesc && <div className="text-xs text-neutral-500 mt-1">{d.shortDesc}</div>}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{d.category ?? '-'}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <div className="text-sm">{typeof d.rating === 'number' ? (d.rating as number).toFixed(1) : (d.rating ? String(d.rating) : '-')}</div>
                      <div className="text-xs text-neutral-400">({d.reviewCount ?? 0})</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    <div className="text-xs">Views: {d.engagement?.views ?? 0}</div>
                    <div className="text-xs">Saves: {d.engagement?.saves ?? 0}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center gap-2">
                        <Toggle
                          checked={!!d.published}
                          onChange={() => {
                            const updated = destinations.map((item) => (item.id === d.id ? { ...item, published: !d.published } : item));
                            setDestinations(updated);
                            try { localStorage.setItem('destinations', JSON.stringify(updated)); } catch {}
                          }}
                        />
                        <span className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-sm font-semibold ${d.published ? 'text-green-700 bg-green-50' : 'text-neutral-700 bg-neutral-100'}`}>
                          <span className={`h-2 w-2 rounded-full ${d.published ? 'bg-green-600' : 'bg-neutral-400'}`} />
                          <span>{d.published ? 'Published' : 'Draft'}</span>
                        </span>
                      </div>
                      {/* Featured indicated by star action in Actions column; no text label here */}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Preview ${d.title}`}
                        onClick={() => { setPreviewDest(d); }}
                        className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition hover:bg-primary-100"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Edit ${d.title}`}
                        onClick={() => router.push(`/dashboard/destinations/${d.id}/edit`)}
                        className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-md bg-warning-50 text-warning-700 transition hover:bg-warning-100"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title={d.featured ? 'Unfeature destination' : 'Feature destination'}
                        onClick={() => setActionDialog({ type: 'feature', destination: d })}
                        className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-md transition"
                      >
                        <Star className={`h-4 w-4 ${d.featured ? 'text-amber-500' : 'text-neutral-400'}`} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${d.title}`}
                        onClick={() => setActionDialog({ type: 'delete', destination: d })}
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
      </div>

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {actionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-neutral-900">
              {actionDialog.type === 'delete' ? 'Delete destination?' : actionDialog.type === 'feature' ? (actionDialog.destination.featured ? 'Remove featured status?' : 'Feature destination?') : 'Edit destination?'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {actionDialog.type === 'delete' ?
                `This will remove ${actionDialog.destination.title} from your destinations list. This action cannot be undone.` :
                actionDialog.type === 'feature' ?
                  (actionDialog.destination.featured ? `Are you sure you want to remove ${actionDialog.destination.title} from featured destinations?` : `Are you sure you want to feature ${actionDialog.destination.title}?`) :
                  `Open ${actionDialog.destination.title} in the destination editor?`}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActionDialog(null)}
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!actionDialog) return;
                  if (actionDialog.type === 'edit') {
                    router.push(`/dashboard/destinations/${actionDialog.destination.id}/edit`);
                  } else if (actionDialog.type === 'feature') {
                    const dest = actionDialog.destination;
                    const updated = destinations.map((item) => (item.id === dest.id ? { ...item, featured: !dest.featured } : item));
                    setDestinations(updated);
                    try { localStorage.setItem('destinations', JSON.stringify(updated)); } catch {}
                  } else {
                    const next = destinations.filter((item) => item.id !== actionDialog.destination.id);
                    setDestinations(next);
                    try { localStorage.setItem('destinations', JSON.stringify(next)); } catch {}
                  }
                  setActionDialog(null);
                }}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold text-white ${actionDialog?.type === 'delete' ? 'bg-danger-600 hover:bg-danger-700' : 'bg-primary-900 hover:bg-primary-800'}`}
              >
                {actionDialog?.type === 'delete' ? 'Delete destination' : actionDialog?.type === 'feature' ? (actionDialog.destination.featured ? 'Remove feature' : 'Feature destination') : 'Continue to edit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">{previewDest.title}</h2>
              <button onClick={() => setPreviewDest(null)} className="text-neutral-500">Close</button>
            </div>
            {previewDest.image?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewDest.image.url} alt={previewDest.title} className="w-full h-48 object-cover rounded" />
            )}
            <div className="mt-4 space-y-3">
              <p className="text-sm text-neutral-700">{previewDest.shortDesc}</p>
              {previewDest.longDesc && <p className="text-sm text-neutral-500">{previewDest.longDesc}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-neutral-500">Rating</p>
                  <p className="text-sm">{(previewDest.rating ?? 0).toFixed(1)} ({previewDest.reviewCount ?? 0})</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500">Difficulty</p>
                  <p className="text-sm">{previewDest.difficulty ?? '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
