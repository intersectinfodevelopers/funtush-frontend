"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2, Compass, Eye, Footprints, Pencil, Plus, Trash2 } from "lucide-react";

import GuideAvatar from "@/components/agency/guides/GuideAvatar";
import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useGuideList } from "@/hooks/useAgencyGuides";
import { languageList } from "@/lib/languages";
import { deactivateGuide, type Guide } from "@/lib/api/agency/guides";
import type { GuideStatus } from "@/lib/api/agency/dashboard";
import type { ApiError } from "@/lib/api/client";

const PAGE_SIZE = 20;
const field = "rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const STATUS_STYLE = { available: "bg-success-50 text-success-700", on_trek: "bg-sky-50 text-sky-700", unavailable: "bg-danger-50 text-danger-600" } as const;
const STATUS_LABEL = { available: "Available", on_trek: "On Trek", unavailable: "Unavailable" } as const;
const LANGS = [["en", "English"], ["ne", "Nepali"], ["hi", "Hindi"], ["de", "German"], ["fr", "French"], ["es", "Spanish"], ["zh", "Chinese"], ["ja", "Japanese"]] as const;
const pct = (n: number, of: number) => (of > 0 ? `${Math.round((n / of) * 1000) / 10}%` : "0%");

export default function GuidesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<GuideStatus | "all">("all");
  const [language, setLanguage] = useState("all");
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState<Guide | null>(null);
  const debounced = useDebouncedValue(search.trim());

  const { data, isLoading, isError, isFetching } = useGuideList({ status, language, search: debounced || undefined, page, limit: PAGE_SIZE });
  const stats = data?.stats;
  const rows = data?.guides ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };

  // "% from last month" is real: how many guides the agency has now vs when this month began.
  const growth = !stats ? undefined : stats.totalBeforeMonth === 0 ? (stats.total > 0 ? `${stats.total} new` : undefined) : `${stats.total >= stats.totalBeforeMonth ? "+" : ""}${(((stats.total - stats.totalBeforeMonth) / stats.totalBeforeMonth) * 100).toFixed(1)}%`;

  const remove = useMutation({
    mutationFn: () => deactivateGuide(removing!.id),
    onSuccess: () => {
      toast.success(`“${removing?.name}” was removed from your guides`);
      setRemoving(null);
      void qc.invalidateQueries({ queryKey: ["agency", "guides"] });
      void qc.invalidateQueries({ queryKey: ["agency", "summary"] });
    },
    onError: (e) => { const name = removing?.name; setRemoving(null); toast.error(`Couldn't remove “${name}”: ${(e as unknown as ApiError).message || "please try again."}`); },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-neutral-500"><Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span><span className="font-semibold text-neutral-900">All Guides</span></div>
          <h1 className="text-2xl font-bold text-neutral-900">Guides</h1>
          <p className="text-sm text-neutral-600">Manage trek guide profiles, certifications, and availability.</p>
        </div>
        <Link href="/dashboard/guides/new" className="inline-flex items-center gap-2 self-start rounded-xl bg-primary-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-800"><Plus className="h-4 w-4" /> Add Guide</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsSummaryCard label="Total Guides" value={stats?.total ?? "—"} tone="primary" icon={Compass} change={growth} />
        <AnalyticsSummaryCard label="On Trek" value={stats?.onTrek ?? "—"} tone="primary" icon={Footprints} change={stats ? pct(stats.onTrek, stats.total) : undefined} note="of all guides" />
        <AnalyticsSummaryCard label="Available" value={stats?.available ?? "—"} tone="success" icon={CheckCircle2} change={stats ? pct(stats.available, stats.total) : undefined} note="of all guides" />
        <AnalyticsSummaryCard label="Certs Expiring" value={stats?.certsExpiring ?? "—"} tone="danger" icon={AlertTriangle} change={stats ? pct(stats.certsExpiring, stats.total) : undefined} note="of guides, within 30 days" />
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px_180px]">
        <input type="search" aria-label="Search guides" placeholder="Search guides" value={search} onChange={(e) => reset(setSearch)(e.target.value)} className={`${field} w-full`} />
        <select aria-label="Filter by status" value={status} onChange={(e) => reset(setStatus)(e.target.value as GuideStatus | "all")} className={field}><option value="all">All status</option><option value="available">Available</option><option value="on_trek">On Trek</option><option value="unavailable">Unavailable</option></select>
        <select aria-label="Filter by language" value={language} onChange={(e) => reset(setLanguage)(e.target.value)} className={field}><option value="all">All languages</option>{LANGS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select>
      </div>

      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load guides. Please try again.</p>}

      <div className={`overflow-hidden border border-neutral-200 bg-white ${isFetching && !isLoading ? "opacity-70" : ""}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              <tr><th className="w-14 px-4 py-3.5">S.No</th><th className="px-4 py-3.5">Guide</th><th className="px-4 py-3.5">Languages</th><th className="px-4 py-3.5">Certifications</th><th className="px-4 py-3.5">Rating</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5">Actions</th></tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 4 }).map((_, i) => <tr key={i} className="border-t border-neutral-200"><td colSpan={7} className="px-4 py-5"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td></tr>)}
              {!isLoading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-500">{search || status !== "all" || language !== "all" ? "No guides match your filters." : "No guides yet — add your first guide."}</td></tr>}
              {rows.map((g, index) => (
                <tr key={g.id} className="border-t border-neutral-200 hover:bg-neutral-50/60">
                  <td className="px-4 py-4 text-neutral-600">{(page - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <GuideAvatar name={g.name} photo={g.photo} />
                      <div className="min-w-0">
                        <Link href={`/dashboard/guides/${g.id}`} className="block font-bold text-neutral-900 hover:underline">{g.name}</Link>
                        <p className="text-xs text-neutral-500">{g.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-neutral-700">{languageList(g.languages) || "—"}</td>
                  <td className="px-4 py-4">
                    {g.certifications.length === 0 ? <span className="text-neutral-400">—</span> : (
                      <div className="flex flex-wrap gap-1.5">
                        {g.certifications.slice(0, 2).map((c) => (
                          <span key={c.id ?? c.number} className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs"><span className="font-semibold text-neutral-800">{c.name}</span><span className="text-neutral-400">{c.number}</span></span>
                        ))}
                        {g.certifications.length > 2 && <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500">+{g.certifications.length - 2}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-neutral-700">{g.rating != null ? g.rating.toFixed(1) : "—"}</td>
                  <td className="px-4 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[g.status]}`}>{STATUS_LABEL[g.status]}</span></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/dashboard/guides/${g.id}`} aria-label={`View ${g.name}`} title="View" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition hover:bg-primary-100"><Eye className="h-4 w-4" /></Link>
                      <Link href={`/dashboard/guides/${g.id}/edit`} aria-label={`Edit ${g.name}`} title="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-warning-50 text-warning-700 transition hover:bg-warning-100"><Pencil className="h-4 w-4" /></Link>
                      <button type="button" aria-label={`Delete ${g.name}`} title="Delete" onClick={() => setRemoving(g)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-danger-50 text-danger-700 transition hover:bg-danger-100"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination currentPage={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={removing !== null} onClose={() => setRemoving(null)} title="Delete this guide?" size="sm">
        {removing && (
          <div className="space-y-4 p-4">
            <p className="text-sm leading-6 text-neutral-600">“{removing.name}” is removed from your guides and can no longer be assigned to bookings. Past bookings keep their guide&apos;s name.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRemoving(null)} className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Cancel</button>
              <button type="button" disabled={remove.isPending} onClick={() => remove.mutate()} className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">{remove.isPending ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
