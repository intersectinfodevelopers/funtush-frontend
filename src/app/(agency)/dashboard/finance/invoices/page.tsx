"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Pagination } from "@/components/ui/pagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useInvoiceList } from "@/hooks/useAgencyFinance";
import { useMoney } from "@/hooks/useAgencyDashboard";
import type { InvoiceStatus } from "@/lib/api/agency/finance";

const PAGE_SIZE = 20;
const STYLE: Record<InvoiceStatus, string> = { Draft: "bg-neutral-100 text-neutral-700", Sent: "bg-primary-50 text-primary-700", Paid: "bg-success-50 text-success-700", Overdue: "bg-danger-50 text-danger-700", Void: "bg-neutral-100 text-neutral-500" };
const field = "rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "—");

export default function InvoicesPage() {
  const money = useMoney();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebouncedValue(search.trim());
  const { data, isLoading, isError } = useInvoiceList({ search: debounced || undefined, status: status || undefined, page, limit: PAGE_SIZE });
  const rows = data?.invoices ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3"><input type="search" aria-label="Search invoices" placeholder="Search number, name, package…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className={`${field} w-72`} />
          <select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={field}><option value="">All statuses</option>{["draft", "sent", "paid", "overdue", "void"].map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}</select></div>
        <Link href="/dashboard/finance/invoices/new" className="inline-flex items-center gap-2 rounded-2xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"><Plus className="h-4 w-4" /> New invoice</Link>
      </div>
      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load invoices.</p>}
      <div className="overflow-x-auto border-t border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500"><tr><th className="w-14 px-4 py-3">S.No</th><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Trekker</th><th className="px-4 py-3">Issued</th><th className="px-4 py-3">Due</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Status</th></tr></thead>
          <tbody>
            {isLoading && Array.from({ length: 3 }).map((_, i) => <tr key={i} className="border-b border-neutral-200"><td colSpan={7} className="px-4 py-4"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td></tr>)}
            {!isLoading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-500">{search || status ? "No invoices match this filter." : "No invoices yet."}</td></tr>}
            {rows.map((i, index) => (
              <tr key={i.id} className="border-b border-neutral-200 hover:bg-neutral-50"><td className="px-4 py-3 text-neutral-500">{(page - 1) * PAGE_SIZE + index + 1}</td>
                <td className="px-4 py-3"><Link href={`/dashboard/finance/invoices/${i.id}`} className="font-semibold text-neutral-900 hover:underline">{i.invoiceNumber}</Link></td>
                <td className="px-4 py-3 text-neutral-700">{i.trekkerName}<div className="text-xs text-neutral-500">{i.packageName ?? ""}</div></td>
                <td className="px-4 py-3 text-neutral-700">{fmt(i.issueDate)}</td><td className="px-4 py-3 text-neutral-700">{fmt(i.dueDate)}</td>
                <td className="px-4 py-3 text-right font-semibold text-neutral-900">{money(i.total)}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STYLE[i.status]}`}>{i.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
