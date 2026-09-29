"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, FileDown, FilterX, MapPin, Trophy } from "lucide-react";
import toast from "react-hot-toast";

import { Pagination } from "@/components/ui/pagination";
import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { exportToPdf } from "@/lib/exportToPdf";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useBookingList, useDashboardSummary, useMoney } from "@/hooks/useAgencyDashboard";
import { useAssignableGuides } from "@/hooks/useAgencyBookings";
import { BookingStatusBadge } from "@/components/agency/bookings/BookingStatusBadge";
import { listBookings, type ApiBookingStatus } from "@/lib/api/agency/bookings";

/**
 * Each tab is one or more of the API's 9 booking statuses. `statuses` is what
 * GET /bookings?status= receives; the count comes from the dashboard summary.
 */
const TABS: Array<{ key: string; label: string; statuses?: ApiBookingStatus[] }> = [
  { key: "all", label: "All" }, // no status filter: every booking
  { key: "inquiry", label: "Inquiries", statuses: ["INQUIRY", "ALTERNATIVE_PROPOSED"] },
  // Accepted bookings: waiting for payment, paid, and confirmed — everything between "accepted" and "trek started".
  { key: "confirmed", label: "Confirmed", statuses: ["PAYMENT_PENDING", "PAID", "CONFIRMED"] },
  { key: "active", label: "Active", statuses: ["ACTIVE"] },
  { key: "completed", label: "Completed", statuses: ["COMPLETED"] },
  { key: "cancelled", label: "Cancelled", statuses: ["CANCELLED", "REJECTED"] },
];

const PAGE_SIZE = 20;
const EXPORT_MAX = 1000;

const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—");

export default function BookingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [exportingPdf, setExportingPdf] = useState(false);
  const debouncedSearch = useDebouncedValue(search.trim());
  const money = useMoney();

  const statuses = TABS.find((t) => t.key === activeTab)?.statuses;
  const filters = useMemo(
    () => ({
      status: statuses?.join(","),
      search: debouncedSearch || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
    }),
    [statuses, debouncedSearch, fromDate, toDate],
  );

  const { data, isLoading, isError, isFetching } = useBookingList({ ...filters, page, limit: PAGE_SIZE });
  const summary = useDashboardSummary();
  const guides = useAssignableGuides();
  const guideName = useMemo(() => new Map((guides.data?.guides ?? []).map((g) => [g.guideRef, g.name])), [guides.data]);

  // Exact per-tab counts for the whole agency (independent of the current search/date filters).
  const byStatus = summary.data?.stats.bookingsByStatus ?? {};
  const countFor = (key: string) => {
    const tab = TABS.find((t) => t.key === key);
    if (!tab?.statuses) return summary.data?.stats.totalBookings;
    return summary.data ? tab.statuses.reduce((n, st) => n + (byStatus[st] ?? 0), 0) : undefined;
  };

  // "% from last month": bookings created this month vs last month, among those now in this tab's statuses. Real counts only.
  const changeFor = (key: string): string | undefined => {
    const tab = TABS.find((t) => t.key === key);
    const m = summary.data?.stats.bookingsCreatedByStatus;
    if (!tab?.statuses || !m) return undefined;
    const sum = (o: Record<string, number>) => tab.statuses!.reduce((n, st) => n + (o[st] ?? 0), 0);
    const now = sum(m.thisMonth), before = sum(m.lastMonth);
    if (before === 0) return now === 0 ? "0%" : `${now} new`;
    const pct = ((now - before) / before) * 100;
    return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
  };

  const bookings = data?.bookings ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const hasFilters = Boolean(search || fromDate || toDate);
  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  // Every booking matching the current filters (up to EXPORT_MAX), not just the visible page.
  async function collectExportRows() {
    const found: Awaited<ReturnType<typeof listBookings>>["bookings"] = [];
    for (let p = 1; found.length < EXPORT_MAX; p++) {
      const res = await listBookings({ ...filters, page: p, limit: 100 });
      found.push(...res.bookings);
      if (res.bookings.length < 100 || found.length >= res.total) break;
    }
    return found.slice(0, EXPORT_MAX);
  }

  async function handleExportPdf() {
    setExportingPdf(true);
    try {
      const found = await collectExportRows();
      if (found.length === 0) return void toast("Nothing to export for this filter.");
      const tab = TABS.find((t) => t.key === activeTab)?.label ?? "";
      const bits = [`Tab: ${tab}`, search.trim() && `Search: “${search.trim()}”`, fromDate && `From ${fromDate}`, toDate && `To ${toDate}`].filter(Boolean);
      await exportToPdf({
        title: "Booking Approval",
        subtitle: `${found.length} booking${found.length === 1 ? "" : "s"} · ${bits.join(" · ")}`,
        columns: ["S.No", "Trekker", "Email", "Package", "Departure", "Group", "Amount", "Guide", "Status"],
        rows: found.map((b, i) => [
          i + 1,
          b.trekkerName,
          b.trekkerEmail,
          b.package?.title ?? "—",
          b.departureDate?.startDate?.split("T")[0] ?? "—",
          b.groupSize,
          money(Number(b.totalPrice), b.package?.currency),
          b.assignedGuideId ? (guideName.get(b.assignedGuideId) ?? "Assigned") : "Not assigned",
          b.status.replace(/_/g, " "),
        ]),
        rightAlign: [6],
        filename: `bookings-${new Date().toISOString().split("T")[0]}`,
      });
      toast.success(`Exported ${found.length} booking${found.length === 1 ? "" : "s"} to PDF`);
    } catch {
      toast.error("Couldn't create the PDF. Try again.");
    } finally {
      setExportingPdf(false);
    }
  }

  const inputCls =
    "w-full border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <Link href="/dashboard" className="transition hover:text-neutral-900">Dashboard</Link>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">All Bookings</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Booking Approval</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-900 transition hover:bg-primary-50 disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" />
            {exportingPdf ? "Creating PDF…" : "Export PDF"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/bookings/new")}
            className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
          >
            + Create
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsSummaryCard label="Pending" change={changeFor("inquiry")} value={countFor("inquiry") ?? "—"} tone="warning" icon={Clock3} />
        <AnalyticsSummaryCard label="Confirmed" change={changeFor("confirmed")} value={countFor("confirmed") ?? "—"} tone="success" icon={CheckCircle2} />
        <AnalyticsSummaryCard label="Active Treks" change={changeFor("active")} value={countFor("active") ?? "—"} tone="primary" icon={MapPin} />
        <AnalyticsSummaryCard label="Completed" change={changeFor("completed")} value={countFor("completed") ?? "—"} tone="success" icon={Trophy} />
      </div>

      <div className="mt-5 overflow-x-auto border-b border-neutral-200">
        <div role="tablist" className="flex min-w-max items-center gap-5 px-1 sm:gap-8 sm:px-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
              className={`inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? "border-primary-900 text-primary-900"
                  : "border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
              }`}
            >
              <span>{tab.label}</span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-500">{countFor(tab.key) ?? "…"}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <input
          type="search"
          placeholder="Search trekker name or email…"
          aria-label="Search bookings"
          value={search}
          onChange={(e) => reset(setSearch)(e.target.value)}
          className={inputCls}
        />
        <input type="date" aria-label="Departing from" title="Departing from" value={fromDate} max={toDate || undefined} onChange={(e) => reset(setFromDate)(e.target.value)} className={inputCls} />
        <input type="date" aria-label="Departing to" title="Departing to" value={toDate} min={fromDate || undefined} onChange={(e) => reset(setToDate)(e.target.value)} className={inputCls} />
        <button
          type="button"
          disabled={!hasFilters}
          onClick={() => {
            setSearch("");
            setFromDate("");
            setToDate("");
            setPage(1);
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary-900 bg-white px-4 py-3 text-sm font-semibold text-primary-900 transition hover:bg-primary-50 disabled:border-neutral-200 disabled:text-neutral-400 disabled:hover:bg-white"
        >
          <FilterX className="h-4 w-4" />
          Clear filters
        </button>
      </div>

      {isError && (
        <p role="alert" className="border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          Couldn&apos;t load bookings. Please try again.
        </p>
      )}

      <div className={`overflow-hidden border border-neutral-200 bg-white shadow-sm ${isFetching && !isLoading ? "opacity-70" : ""}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
              <tr><th className="w-14 px-4 py-3">S.No</th>
                <th className="px-4 py-3 font-medium">Trekker</th>
                <th className="px-4 py-3 font-medium">Package</th>
                <th className="px-4 py-3 font-medium">Departure</th>
                <th className="px-4 py-3 text-center font-medium">Group</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Guide</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-center font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-neutral-200">
                    <td colSpan={9} className="px-4 py-4"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td>
                  </tr>
                ))}
              {!isLoading && bookings.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-neutral-500">
                    {hasFilters ? "No bookings match this filter." : activeTab === "all" ? "No bookings yet." : "Nothing in this tab yet."}
                  </td>
                </tr>
              )}
              {bookings.map((b, index) => (
                <tr key={b.id} className="border-t border-neutral-200 hover:bg-neutral-50"><td className="px-4 py-3 text-neutral-500">{(safePage - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-900">{b.trekkerName}</div>
                    <div className="text-xs text-neutral-500">{b.trekkerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{b.package?.title ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">{fmtDate(b.departureDate?.startDate)}</td>
                  <td className="px-4 py-3 text-center text-neutral-700">{b.groupSize}</td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-900">{money(Number(b.totalPrice), b.package?.currency)}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {b.assignedGuideId ? (guideName.get(b.assignedGuideId) ?? "Assigned") : "Not assigned"}
                  </td>
                  <td className="px-4 py-3 text-center"><BookingStatusBadge status={b.status} /></td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/dashboard/bookings/${b.id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination square currentPage={safePage} totalPages={totalPages} onPageChange={setPage} className="border-t border-neutral-200" />
    </div>
  );
}
