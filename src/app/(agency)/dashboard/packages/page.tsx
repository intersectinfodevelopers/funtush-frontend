"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { BarChart3, CheckCircle2, Eye, Package as PackageIcon, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMoney } from "@/hooks/useAgencyDashboard";
import { usePackageList } from "@/hooks/useAgencyPackages";
import {
  archivePackage,
  restorePackage,
  deletePackagePermanently,
  type PackageListItem,
  type PackageSort,
  type PackageStatus,
} from "@/lib/api/agency/packages";
import type { ApiError } from "@/lib/api/client";

const PAGE_SIZE = 20;

const TABS: Array<{ label: string; value: PackageStatus | "" }> = [
  { label: "All", value: "" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Archived", value: "ARCHIVED" },
];

const badgeFor = (s: PackageStatus) => (s === "PUBLISHED" ? "active" : s === "DRAFT" ? "draft" : "suspended");
/** Whole days from today to the departure (0 = today). */
const daysUntil = (iso: string) => {
  const d = new Date(iso);
  const start = new Date(); start.setHours(0, 0, 0, 0);
  return Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - start.getTime()) / 86_400_000);
};
/** More than 10 days left: green · 3 to 10: yellow · under 3: red. */
const leftTone = (n: number) => (n > 10 ? "text-success-700" : n >= 3 ? "text-warning-600" : "text-danger-600");
const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB") : "—");

const fieldCls =
  "border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100";

export default function PackagesPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const money = useMoney();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PackageStatus | "">("");
  const [sort, setSort] = useState<PackageSort>("newest");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ kind: "archive" | "delete" | "restore"; pkg: PackageListItem } | null>(null);
  const debounced = useDebouncedValue(search.trim());

  const { data, isLoading, isError, isFetching } = usePackageList({
    status: status || undefined,
    search: debounced || undefined,
    sort,
    page,
    limit: PAGE_SIZE,
  });
  const rows = data?.data ?? [];
  const counts = data?.counts;
  const totalPages = Math.max(1, data?.meta.pages ?? 1);
  const safePage = Math.min(page, totalPages);
  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  const refresh = () => {
    setTimeout(() => void qc.invalidateQueries({ queryKey: ["agency", "package-activity"] }), 900); // the bell shows who just did this (written just after the response)
    void qc.invalidateQueries({ queryKey: ["agency", "packages"] });
    void qc.invalidateQueries({ queryKey: ["agency", "package"] });
    void qc.invalidateQueries({ queryKey: ["agency", "summary"] });
  };

  const run = useMutation({
    mutationFn: async ({ kind, pkg }: { kind: "archive" | "delete" | "restore"; pkg: PackageListItem }) => {
      if (kind === "archive") await archivePackage(pkg.id);
      else if (kind === "restore") await restorePackage(pkg.id);
      else await deletePackagePermanently(pkg.id);
    },
    onSuccess: (_r, { kind, pkg }) => {
      toast.success(kind === "restore" ? `“${pkg.title}” was restored as a draft — review it, then publish` : kind === "delete" ? `“${pkg.title}” was permanently deleted` : `“${pkg.title}” was deleted — you can still find it under Archived`);
      setConfirm(null);
      refresh();
    },
    onError: (e, { pkg, kind }) => toast.error(`Couldn't ${kind === "restore" ? "restore" : "delete"} “${pkg.title}”: ${(e as unknown as ApiError).message || "please try again."}`),
  });

  const total = useMemo(() => (counts ? counts.DRAFT + counts.PUBLISHED + counts.ARCHIVED : undefined), [counts]);
  // Real numbers only: growth = packages added since this month began, relative to what the agency had then.
  const before = data?.totalBeforeMonth;
  const growth = total === undefined || before === undefined ? undefined : before === 0 ? (total > 0 ? `${total} new` : undefined) : `${total >= before ? "+" : ""}${(((total - before) / before) * 100).toFixed(1)}%`;
  const share = (n?: number) => (n === undefined || !total ? undefined : `${((n / total) * 100).toFixed(1)}%`);
  const tabCount = (v: PackageStatus | "") => (v === "" ? total : counts?.[v]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <Link href="/dashboard" className="transition hover:text-neutral-900">Dashboard</Link>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">All Packages</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Agency Packages</h1>
          <p className="text-sm leading-6 text-neutral-600">Create, publish and manage your trek packages.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/packages/new")}
          className="inline-flex items-center gap-2 self-start rounded-2xl bg-primary-900 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-800"
        >
          <Plus className="h-4 w-4" /> Create Package
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsSummaryCard label="Total Packages" value={total ?? "—"} tone="primary" icon={PackageIcon} change={growth} />
        <AnalyticsSummaryCard label="Published" value={counts?.PUBLISHED ?? "—"} tone="success" icon={CheckCircle2} change={share(counts?.PUBLISHED)} note="of all packages" />
        <AnalyticsSummaryCard label="Draft" value={counts?.DRAFT ?? "—"} tone="warning" icon={BarChart3} change={share(counts?.DRAFT)} note="of all packages" />
        <AnalyticsSummaryCard label="Archived" value={counts?.ARCHIVED ?? "—"} tone="accent" icon={Eye} change={share(counts?.ARCHIVED)} note="of all packages" />
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px]">
        <input
          type="search"
          aria-label="Search packages"
          placeholder="Search by title, destination, region or category…"
          value={search}
          onChange={(e) => reset(setSearch)(e.target.value)}
          className={`${fieldCls} w-full`}
        />
        <select aria-label="Sort packages" value={sort} onChange={(e) => reset(setSort)(e.target.value as PackageSort)} className={fieldCls}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title_asc">Title: A to Z</option>
          <option value="title_desc">Title: Z to A</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="duration">Duration: shortest first</option>
          <option value="duration_desc">Duration: longest first</option>
        </select>
      </div>

      <div className="border-b border-neutral-200">
        <div role="tablist" className="flex flex-wrap items-center gap-x-5 gap-y-1 sm:gap-x-8">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={status === tab.value}
              onClick={() => reset(setStatus)(tab.value)}
              className={`inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition ${
                status === tab.value ? "border-primary-900 text-primary-900" : "border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
              }`}
            >
              {tab.label}
              <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">{tabCount(tab.value) ?? "…"}</span>
            </button>
          ))}
        </div>
      </div>

      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load packages. Please try again.</p>}

      <div className={`border-t border-neutral-200 bg-white ${isFetching && !isLoading ? "opacity-70" : ""}`}>
        <table className="w-full table-auto border-collapse text-left text-sm">
          <thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            <tr>
              <th className="w-14 px-4 py-3">S.No</th>
              <th className="px-4 py-3">Package Name</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Group Size</th>
              <th className="px-4 py-3">Start Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-neutral-200"><td colSpan={8} className="px-4 py-4"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td></tr>
              ))}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-neutral-500">
                  {search || status ? "No packages match this filter." : "No packages yet — create your first one."}
                </td>
              </tr>
            )}
            {rows.map((pkg, index) => {
              const next = pkg.nextDeparture;
              return (
                <tr key={pkg.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-500">{(safePage - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="px-4 py-3 text-neutral-900">
                    <Link href={`/dashboard/packages/${pkg.id}`} className="font-bold hover:underline">{pkg.title}</Link>
                    {(pkg.region || pkg.destination || pkg.category) && <div className="text-xs text-neutral-500">{pkg.region || pkg.destination || pkg.category}</div>}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{pkg.durationDays} days</td>
                  <td className="px-4 py-3 text-neutral-900">{money(Number(pkg.pricePerPerson), pkg.currency)}</td>
                  <td className="px-4 py-3 text-neutral-700">{pkg.maxGroupSize}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {next ? (
                      <>
                        {fmtDate(next.startDate)}
                        {(() => { const n = Math.max(0, daysUntil(next.startDate)); return <div className={`text-xs font-semibold ${leftTone(n)}`}>{n === 0 ? "Departs today" : `${n} ${n === 1 ? "day" : "days"} left`}</div>; })()}
                      </>
                    ) : (
                      <span className="text-neutral-400">None scheduled</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><Badge variant={badgeFor(pkg.status)}>{pkg.status.toLowerCase()}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/dashboard/packages/${pkg.id}`} aria-label={`View ${pkg.title}`} title="View" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition hover:bg-primary-100"><Eye className="h-4 w-4" /></Link>
                                              <Link href={`/dashboard/packages/${pkg.id}/edit`} aria-label={`Edit ${pkg.title}`} title="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-warning-50 text-warning-700 transition hover:bg-warning-100"><Pencil className="h-4 w-4" /></Link>
                                              {pkg.status === "ARCHIVED" && <button type="button" aria-label={`Restore ${pkg.title}`} title="Restore as draft" disabled={run.isPending} onClick={() => run.mutate({ kind: "restore", pkg })} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-success-50 text-success-700 transition hover:bg-success-100 disabled:opacity-50"><RotateCcw className="h-4 w-4" /></button>}
                      <button type="button" aria-label={`Delete ${pkg.title}`} title="Delete" onClick={() => setConfirm({ kind: pkg.status === "ARCHIVED" ? "delete" : "archive", pkg })} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-danger-50 text-danger-700 transition hover:bg-danger-100"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />

      <Modal
        isOpen={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm?.kind === "delete" ? "Delete permanently?" : "Delete this package?"}
        size="sm"
      >
        {confirm && (
          <div className="space-y-4 p-4">
            <p className="text-sm leading-6 text-neutral-600">
              {confirm.kind === "delete"
                ? `“${confirm.pkg.title}” is removed for good and can't be restored. (Packages that have bookings can't be deleted — they stay archived.)`
                : `“${confirm.pkg.title}” is removed from your site and the marketplace and moved to Archived. Existing bookings are kept.`}
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setConfirm(null)} className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Cancel</button>
              <button
                type="button"
                disabled={run.isPending}
                onClick={() => run.mutate(confirm)}
                className="rounded-2xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50"
              >
                {run.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
