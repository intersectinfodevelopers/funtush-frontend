"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck2, Eye, Pencil, Repeat, Trash2, UserPlus, Users } from "lucide-react";

import { EditCustomerModal, RemoveCustomerModal } from "@/components/agency/customers/CustomerModals";
import { Pagination } from "@/components/ui/pagination";
import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMoney } from "@/hooks/useAgencyDashboard";
import { useCustomerAnalytics, useCustomerList } from "@/hooks/useAgencyCustomers";
import type { CustomerListParams, CustomerRow } from "@/lib/api/agency/customers";

const PAGE_SIZE = 20;
const field = "rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const SORTS: Array<{ label: string; sortBy: NonNullable<CustomerListParams["sortBy"]>; sortOrder: "asc" | "desc" }> = [
  { label: "Most recent booking", sortBy: "lastBookingDate", sortOrder: "desc" },
  { label: "Highest spending", sortBy: "totalSpending", sortOrder: "desc" },
  { label: "Most bookings", sortBy: "totalBookings", sortOrder: "desc" },
  { label: "Oldest booking first", sortBy: "lastBookingDate", sortOrder: "asc" },
];

export default function CustomersPage() {
  const money = useMoney();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"" | "new" | "repeat">("");
  const [sort, setSort] = useState(0);
  const [page, setPage] = useState(1);
  const debounced = useDebouncedValue(search.trim());
  const [editing, setEditing] = useState<CustomerRow | null>(null);
  const [removing, setRemoving] = useState<CustomerRow | null>(null);

  const params: CustomerListParams = {
    search: debounced || undefined,
    customerType: type || undefined,
    sortBy: SORTS[sort].sortBy,
    sortOrder: SORTS[sort].sortOrder,
    page,
    limit: PAGE_SIZE,
  };
  const { data, isLoading, isError, isFetching } = useCustomerList(params);
  const analytics = useCustomerAnalytics();
  const rows = data?.data ?? [];
  const totalPages = Math.max(1, data?.meta.totalPages ?? 1);
  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };
  const a = analytics.data;

  return (
    <div className="space-y-4">
      <header>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link>
          <span className="text-neutral-300">/</span>
          <span className="font-semibold text-neutral-900">All Customers</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Customers</h1>
        <p className="mt-1 text-sm text-neutral-600">Travellers who have booked with you, and guests who completed a trek. Edit or remove anyone from your list.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsSummaryCard label="Total Customers" value={a?.totalCustomers ?? "—"} tone="primary" icon={Users} />
        <AnalyticsSummaryCard label="New (1 booking)" value={a?.newCustomers ?? "—"} tone="success" icon={UserPlus} />
        <AnalyticsSummaryCard label="Returning" value={a?.returningCustomers ?? "—"} tone="warning" icon={CalendarCheck2} />
        <AnalyticsSummaryCard label="Repeat rate" value={a ? `${Math.round(a.repeatRate * 100) / 100}%` : "—"} tone="accent" icon={Repeat} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px_200px]">
        <input type="search" aria-label="Search customers" placeholder="Search by name, email or phone…" value={search} onChange={(e) => reset(setSearch)(e.target.value)} className={`${field} w-full`} />
        <select aria-label="Customer type" value={type} onChange={(e) => reset(setType)(e.target.value as "" | "new" | "repeat")} className={field}>
          <option value="">All customers</option>
          <option value="new">New</option>
          <option value="repeat">Repeat</option>
        </select>
        <select aria-label="Sort customers" value={sort} onChange={(e) => reset(setSort)(Number(e.target.value))} className={field}>
          {SORTS.map((s, i) => <option key={s.label} value={i}>{s.label}</option>)}
        </select>
      </div>

      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load customers. Please try again.</p>}

      <div className={`overflow-x-auto border-t border-neutral-200 bg-white ${isFetching && !isLoading ? "opacity-70" : ""}`}>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            <tr><th className="w-14 px-4 py-3">S.No</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Country</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Bookings</th><th className="px-4 py-3">Total spent</th><th className="px-4 py-3">Last booking</th><th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b border-neutral-200"><td colSpan={8} className="px-4 py-4"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td></tr>)}
            {!isLoading && rows.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-neutral-500">{search || type ? "No customers match this filter." : "No customers yet — travellers appear here once they book, and guests once they complete a trek."}</td></tr>}
            {rows.map((c, index) => (
              <tr key={c.trekkerId} className="border-b border-neutral-200 hover:bg-neutral-50"><td className="px-4 py-3 text-neutral-500">{(page - 1) * PAGE_SIZE + index + 1}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/customers/${encodeURIComponent(c.trekkerId)}`} className="font-semibold text-neutral-900 hover:underline">{c.fullName ?? "Unnamed"}</Link>
                  <div className="text-xs text-neutral-500">{c.email}{c.isGuest && <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">guest</span>}</div>
                </td>
                <td className="px-4 py-3 text-neutral-700">{c.country ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 font-semibold text-neutral-900">{c.totalBookings}{c.repeatVisitor && <span className="ml-2 rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-semibold text-success-700">repeat</span>}{c.isNewCustomer && <span className="ml-2 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">new</span>}</td>
                <td className="px-4 py-3 text-neutral-900">{money(c.totalSpending)}</td>
                <td className="px-4 py-3 text-neutral-700">{new Date(c.lastBookingDate).toLocaleDateString("en-GB")}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Link href={`/dashboard/customers/${encodeURIComponent(c.trekkerId)}`} aria-label={`View ${c.fullName ?? "customer"}`} title="View" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition hover:bg-primary-100"><Eye className="h-4 w-4" /></Link>
                    <button type="button" aria-label={`Edit ${c.fullName ?? "customer"}`} title="Edit" onClick={() => setEditing(c)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-warning-50 text-warning-700 transition hover:bg-warning-100"><Pencil className="h-4 w-4" /></button>
                    <button type="button" aria-label={`Delete ${c.fullName ?? "customer"}`} title="Delete" onClick={() => setRemoving(c)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-danger-50 text-danger-700 transition hover:bg-danger-100"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <EditCustomerModal customer={editing} onClose={() => setEditing(null)} />
      <RemoveCustomerModal customer={removing} onClose={() => setRemoving(null)} />

      <Pagination currentPage={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
