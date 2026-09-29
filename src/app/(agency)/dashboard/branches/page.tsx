"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Building2, Plus, Trash2, UserCheck } from "lucide-react";

import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { useBranchList } from "@/hooks/useAgencyBranches";
import { deleteBranch, type Branch } from "@/lib/api/agency/branches";
import type { ApiError } from "@/lib/api/client";

const PAGE_SIZE = 10;

export default function BranchesPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useBranchList();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState<Branch | null>(null);
  const remove = useMutation({
    mutationFn: (b: Branch) => deleteBranch(b.id),
    onSuccess: () => { toast.success("Branch deleted"); setRemoving(null); void qc.invalidateQueries({ queryKey: ["agency", "branches"] }); },
    onError: (e) => { setRemoving(null); toast.error((e as unknown as ApiError).message || "Couldn't delete the branch."); },
  });
  const all = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(() => { const q = search.trim().toLowerCase(); return q ? all.filter((b) => `${b.name} ${b.address}`.toLowerCase().includes(q)) : all; }, [all, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="flex items-center gap-2 text-sm text-neutral-500"><Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span><span className="font-semibold text-neutral-900">Branches</span></div><h1 className="mt-2 text-2xl font-bold text-neutral-900">Branches</h1><p className="mt-1 text-sm text-neutral-600">Your offices, their managers and how each one is performing.</p></div>
        <Link href="/dashboard/branches/new" className="inline-flex items-center gap-2 self-start rounded-2xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"><Plus className="h-4 w-4" /> Add branch</Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <AnalyticsSummaryCard label="Branches" value={data ? all.length : "—"} tone="primary" icon={Building2} />
        <AnalyticsSummaryCard label="With a manager" value={data ? all.filter((b) => b.managerStaff).length : "—"} tone="success" icon={UserCheck} />
        <AnalyticsSummaryCard label="No manager" value={data ? all.filter((b) => !b.managerStaff).length : "—"} tone="warning" icon={UserCheck} />
      </div>
      <input type="search" aria-label="Search branches" placeholder="Search branches…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 sm:max-w-sm" />
      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load branches.</p>}
      <div className="overflow-x-auto border-t border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500"><tr><th className="w-14 px-4 py-3">S.No</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Manager</th><th className="px-4 py-3">Guides</th><th className="px-4 py-3">Bookings</th><th className="px-4 py-3" /></tr></thead>
          <tbody>
            {isLoading && Array.from({ length: 2 }).map((_, i) => <tr key={i} className="border-b border-neutral-200"><td colSpan={7} className="px-4 py-4"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td></tr>)}
            {!isLoading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-500">{search ? "No branches match this search." : "No branches yet."}</td></tr>}
            {rows.map((b, index) => (
              <tr key={b.id} className="border-b border-neutral-200 hover:bg-neutral-50"><td className="px-4 py-3 text-neutral-500">{(page - 1) * PAGE_SIZE + index + 1}</td>
                <td className="px-4 py-3"><Link href={`/dashboard/branches/${b.id}`} className="font-semibold text-neutral-900 hover:underline">{b.name}</Link>{b.isHeadOffice && <span className="ml-2 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">Head office</span>}<div className="text-xs text-neutral-500">{b.address}</div></td>
                <td className="px-4 py-3 text-neutral-700">{b.phone}{b.whatsapp && <div className="text-xs text-neutral-500">WhatsApp {b.whatsapp}</div>}</td>
                <td className="px-4 py-3 text-neutral-700">{b.managerStaff ? (b.managerStaff.name ?? "Unnamed") : "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{b._count.guides}</td>
                <td className="px-4 py-3 text-neutral-700">{b._count.bookings}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><Link href={`/dashboard/branches/${b.id}`} className="rounded-xl bg-primary-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-800">Open</Link><button type="button" aria-label={`Delete ${b.name}`} onClick={() => setRemoving(b)} className="rounded-md p-1.5 text-danger-600 hover:bg-danger-50"><Trash2 className="h-4 w-4" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} />
      <Modal isOpen={removing !== null} onClose={() => setRemoving(null)} title="Delete this branch?" size="sm">
        <div className="space-y-4 p-4"><p className="text-sm text-neutral-600">“{removing?.name}” is removed. Guides assigned to it become unassigned. A branch with bookings can&apos;t be deleted.</p><div className="flex justify-end gap-2"><button type="button" onClick={() => setRemoving(null)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Cancel</button><button type="button" disabled={remove.isPending} onClick={() => removing && remove.mutate(removing)} className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">{remove.isPending ? "Deleting…" : "Delete"}</button></div></div>
      </Modal>
    </div>
  );
}
