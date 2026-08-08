"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, AlertTriangle, Search, Compass, Footprints, CheckCircle2 } from "lucide-react";
import { VisibilityOutlined, EditOutlined, DeleteOutlined } from "@mui/icons-material";
import { Pagination } from "@/components/ui/pagination";
import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import guidesData from "../../../../../data/guides.json";

const isExpiringSoon = (expiry: string) => {
  const now = new Date();
  const exp = new Date(expiry);
  const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff > 0 && diff <= 30;
};

const statusMap: Record<string, { label: string; pill: string }> = {
  available: { label: "Available", pill: "bg-emerald-100 text-emerald-800" },
  on_trek: { label: "On Trek", pill: "bg-sky-100 text-sky-800" },
  unavailable: { label: "Unavailable", pill: "bg-rose-100 text-rose-800" },
};

const gpsLabel = (status: string) => {
  switch (status) {
    case "available":
      return "Online";
    case "on_trek":
      return "Tracking";
    default:
      return "Offline";
  }
};

const guideRows = guidesData.map((guide, index) => ({
  ...guide,
  treksDone: 16 + index * 3,
  gps: gpsLabel(guide.status),
  email: `${guide.name.toLowerCase().replace(/\s+/g, ".")}@funtush.com`,
}));

export default function GuidesPage() {
  const router = useRouter();
  const [guideRowsState, setGuideRowsState] = useState(guideRows);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialog, setDialog] = useState<{ type: "edit" | "delete"; guide: (typeof guideRows)[number] } | null>(null);

  const allLanguages = useMemo(() => {
    const langs = new Set<string>();
    guidesData.forEach((guide) => guide.languages.forEach((lang) => langs.add(lang)));
    return Array.from(langs);
  }, []);

  const stats = useMemo(() => {
    const total = guidesData.length;
    const available = guidesData.filter((guide) => guide.status === "available").length;
    const onTrek = guidesData.filter((guide) => guide.status === "on_trek").length;
    const expiring = guidesData.filter((guide) => guide.certifications.some((cert) => isExpiringSoon(cert.expiry))).length;
    return { total, available, onTrek, expiring };
  }, []);

  const filteredGuides = useMemo(() => {
    return guideRowsState.filter((guide) => {
      const matchesSearch = guide.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || guide.status === statusFilter;
      const matchesLanguage = languageFilter === "all" || guide.languages.includes(languageFilter);
      return matchesSearch && matchesStatus && matchesLanguage;
    });
  }, [search, statusFilter, languageFilter, guideRowsState]);

  const guidesPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredGuides.length / guidesPerPage));
  const paginatedGuides = filteredGuides.slice((currentPage - 1) * guidesPerPage, currentPage * guidesPerPage);

  const nextExpiry = guidesData
    .flatMap((guide) => guide.certifications.map((cert) => ({ guide: guide.name, ...cert })))
    .filter((cert) => isExpiringSoon(cert.expiry))
    .sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime())[0];

  return (
    <div className="space-y-4">
          <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Guides</h1>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-neutral-500"><button type="button" onClick={() => router.push("/dashboard")} className="hover:text-neutral-900">Dashboard</button><span className="text-neutral-300">/</span><span className="font-semibold text-neutral-900">All Guides</span></div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => router.push("/dashboard/guides/new")} className="inline-flex items-center gap-2 rounded-xl bg-primary-800 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800 shadow-sm">
            <Plus className="h-4 w-4" />
            Add Guide
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-amber-950">Upcoming renewal alert</p>
              <p className="text-sm text-amber-800">
                {nextExpiry ? `${nextExpiry.guide}'s certification expires on ${new Date(nextExpiry.expiry).toLocaleDateString()}.` : "No certifications expiring soon."}
              </p>
            </div>
          </div>
        
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <AnalyticsSummaryCard label="Total Guides" value={stats.total} tone="primary" icon={Compass} />
        <AnalyticsSummaryCard label="On Trek" value={stats.onTrek} tone="primary" icon={Footprints} />
        <AnalyticsSummaryCard label="Available" value={stats.available} tone="success" icon={CheckCircle2} />
        <AnalyticsSummaryCard label="Certs Expiring" value={stats.expiring} tone="danger" icon={AlertTriangle} />
      </div>

      {/* <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            placeholder="Search guides"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <select
          className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All status</option>
          <option value="available">Available</option>
          <option value="on_trek">On Trek</option>
          <option value="unavailable">Unavailable</option>
        </select>

        <select
          className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
        >
          <option value="all">All languages</option>
          {allLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div> */}

      <div className="overflow-x-auto border-t border-neutral-200 bg-white/90">
          <table className="min-w-full text-left text-sm text-neutral-700">
            <thead>
              <tr className="border-b border-neutral-200 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                <th className="px-4 py-4">S.NO</th>
                <th className="px-4 py-4">Guide</th>
                <th className="px-4 py-4">Languages</th>
                <th className="px-4 py-4">Certifications</th>
                <th className="px-4 py-4">Rating</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedGuides.map((guide, index) => {
                const statusInfo = statusMap[guide.status] || statusMap.unavailable;
                const expiringCert = guide.certifications.find((cert) => isExpiringSoon(cert.expiry));
                return (
                  <tr key={guide.id} className="border-b border-neutral-200 transition hover:bg-slate-50">
                    <td className="px-4 py-4 font-semibold text-neutral-900">{String((currentPage - 1) * guidesPerPage + index + 1).padStart(2, "0")}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-sm font-bold text-white">
                          {guide.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900">{guide.name}</div>
                          <div className="text-xs text-neutral-500">{guide.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-neutral-600">{guide.languages.join(", ")}</td>
                    <td className="px-4 py-4 text-xs leading-5 text-neutral-600">
                      {guide.certifications.length > 0 ? (
                        guide.certifications.map((cert) => (
                          <div key={cert.number} className="mb-2 rounded-2xl bg-slate-50 px-3 py-2">
                            <div className="font-semibold text-neutral-900">{cert.name}</div>
                            <div className="text-[11px] text-neutral-500">{cert.number}</div>
                          </div>
                        ))
                      ) : (
                        <span className="text-neutral-400">No certs</span>
                      )}
                      {expiringCert && (
                        <div className="mt-1 text-[11px] text-rose-600">Expires {new Date(expiringCert.expiry).toLocaleDateString()}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-amber-600">{guide.rating.toFixed(1)}★</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.pill}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button type="button" title="View guide" onClick={() => router.push(`/dashboard/guides/${guide.id}`)} className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition hover:bg-primary-100">
                          <span className="sr-only">View</span>
                          <VisibilityOutlined sx={{ fontSize: 18 }} />
                        </button>
                        <button type="button" title="Edit guide" onClick={() => setDialog({ type: "edit", guide })} className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-md bg-warning-50 text-warning-700 transition hover:bg-warning-100">
                          <span className="sr-only">Edit</span>
                          <EditOutlined sx={{ fontSize: 18 }} />
                        </button>
                        <button type="button" title="Delete guide" onClick={() => setDialog({ type: "delete", guide })} className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-md bg-danger-50 text-danger-700 transition hover:bg-danger-100">
                          <span className="sr-only">Delete</span>
                          <DeleteOutlined sx={{ fontSize: 18 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

        {dialog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><h2 className="text-lg font-semibold text-neutral-900">{dialog.type === "delete" ? "Delete guide?" : "Edit guide?"}</h2><p className="mt-2 text-sm leading-6 text-neutral-600">{dialog.type === "delete" ? `Remove ${dialog.guide.name} from the guide list?` : `Open ${dialog.guide.name}'s profile to edit?`}</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setDialog(null)} className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900">Cancel</button><button type="button" onClick={() => { if (dialog.type === "edit") router.push(`/dashboard/guides/${dialog.guide.id}`); else setGuideRowsState((rows) => rows.filter((guide) => guide.id !== dialog.guide.id)); setDialog(null); }} className={`rounded-2xl px-4 py-2 text-sm font-semibold text-white ${dialog.type === "delete" ? "bg-danger-600" : "bg-primary-900"}`}>{dialog.type === "delete" ? "Delete guide" : "Continue"}</button></div></div></div>}
    </div>
  );
}

