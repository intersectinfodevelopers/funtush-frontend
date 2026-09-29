"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { BadgePercent, CheckCircle2, Pause, Pencil, Play, Plus, Ticket, Trash2 } from "lucide-react";

import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { Modal } from "@/components/ui/modal";
import { useCouponList } from "@/hooks/useAgencyCoupons";
import { deleteCoupon, updateCoupon, type Coupon } from "@/lib/api/agency/coupons";
import type { ApiError } from "@/lib/api/client";

const field = "rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function state(c: Coupon): "expired" | "paused" | "active" {
  if (c.isExpired || c.status === "EXPIRED") return "expired";
  return c.status === "PAUSED" ? "paused" : "active";
}
const TONE = { active: "bg-success-50 text-success-700", paused: "bg-warning-50 text-warning-700", expired: "bg-neutral-100 text-neutral-600" };

export default function CouponsPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useCouponList();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [removing, setRemoving] = useState<Coupon | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["agency", "coupons"] });
  const onError = (e: unknown) => toast.error((e as ApiError).message || "That didn't work — please try again.");
  const pause = useMutation({ mutationFn: (c: Coupon) => updateCoupon(c.id, { status: c.status === "PAUSED" ? "ACTIVE" : "PAUSED" }), onSuccess: () => void refresh(), onError });
  const remove = useMutation({ mutationFn: (c: Coupon) => deleteCoupon(c.id), onSuccess: () => { toast.success("Coupon deleted"); setRemoving(null); void refresh(); }, onError: (e) => { setRemoving(null); onError(e); } });

  const all = useMemo(() => data ?? [], [data]);
  const rows = useMemo(() => all.filter((c) => (!search.trim() || c.code.includes(search.trim().toUpperCase())) && (!filter || state(c) === filter)), [all, search, filter]);
  const active = all.filter((c) => state(c) === "active").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="flex items-center gap-2 text-sm text-neutral-500"><Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span><span className="font-semibold text-neutral-900">Coupons</span></div><h1 className="mt-2 text-2xl font-bold text-neutral-900">Coupons</h1><p className="mt-1 text-sm text-neutral-600">Discount codes trekkers can apply to a booking inquiry.</p></div>
        <Link href="/dashboard/coupons/new" className="inline-flex items-center gap-2 self-start rounded-2xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"><Plus className="h-4 w-4" /> New coupon</Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <AnalyticsSummaryCard label="Coupons" value={data ? all.length : "—"} tone="primary" icon={Ticket} />
        <AnalyticsSummaryCard label="Active now" value={data ? active : "—"} tone="success" icon={CheckCircle2} />
        <AnalyticsSummaryCard label="Times used" value={data ? all.reduce((n, c) => n + c.redemptionsUsed, 0) : "—"} tone="warning" icon={BadgePercent} />
      </div>
      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px]">
        <input type="search" aria-label="Search coupons" placeholder="Search by code…" value={search} onChange={(e) => setSearch(e.target.value)} className={`${field} w-full`} />
        <select aria-label="Filter by state" value={filter} onChange={(e) => setFilter(e.target.value)} className={field}><option value="">All</option><option value="active">Active</option><option value="paused">Paused</option><option value="expired">Expired</option></select>
      </div>
      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load coupons.</p>}
      <div className="overflow-x-auto border-t border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500"><tr><th className="w-14 px-4 py-3">S.No</th><th className="px-4 py-3">Code</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3">Valid</th><th className="px-4 py-3">Used</th><th className="px-4 py-3">State</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
          <tbody>
            {isLoading && Array.from({ length: 3 }).map((_, i) => <tr key={i} className="border-b border-neutral-200"><td colSpan={7} className="px-4 py-4"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td></tr>)}
            {!isLoading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-500">{search || filter ? "No coupons match this filter." : "No coupons yet."}</td></tr>}
            {rows.map((c, index) => {
              const s = state(c);
              return (
                <tr key={c.id} className="border-b border-neutral-200 hover:bg-neutral-50"><td className="px-4 py-3 text-neutral-500">{0 + index + 1}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-neutral-900">{c.code}<div className="font-sans text-xs font-normal text-neutral-500">{c.applicablePackages.length ? `${c.applicablePackages.length} package${c.applicablePackages.length === 1 ? "" : "s"}` : "All packages"}{c.firstTimeTrekkerOnly ? " · first-timers" : ""}</div></td>
                  <td className="px-4 py-3 text-neutral-700">{c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `Rs. ${c.discountValue.toLocaleString("en-US")}`}</td>
                  <td className="px-4 py-3 text-neutral-700">{fmt(c.validFrom)} – {fmt(c.validUntil)}</td>
                  <td className="px-4 py-3 text-neutral-700">{c.redemptionsUsed} / {c.maxRedemptions}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${TONE[s]}`}>{s}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {s !== "expired" && <button type="button" disabled={pause.isPending} aria-label={c.status === "PAUSED" ? `Resume ${c.code}` : `Pause ${c.code}`} title={c.status === "PAUSED" ? "Resume" : "Pause"} onClick={() => pause.mutate(c)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition hover:bg-primary-100 disabled:opacity-50">{c.status === "PAUSED" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</button>}
                      <Link href={`/dashboard/coupons/${c.id}/edit`} aria-label={`Edit ${c.code}`} title="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-warning-50 text-warning-700 transition hover:bg-warning-100"><Pencil className="h-4 w-4" /></Link>
                      <button type="button" aria-label={`Delete ${c.code}`} title="Delete" onClick={() => setRemoving(c)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-danger-50 text-danger-700 transition hover:bg-danger-100"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Modal isOpen={removing !== null} onClose={() => setRemoving(null)} title="Delete this coupon?" size="sm">
        <div className="space-y-4 p-4"><p className="text-sm text-neutral-600">{removing?.code} stops working immediately. This can&apos;t be undone.</p><div className="flex justify-end gap-2"><button type="button" onClick={() => setRemoving(null)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Cancel</button><button type="button" disabled={remove.isPending} onClick={() => removing && remove.mutate(removing)} className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">{remove.isPending ? "Deleting…" : "Delete"}</button></div></div>
      </Modal>
    </div>
  );
}
