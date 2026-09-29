"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { useGuideList } from "@/hooks/useAgencyGuides";
import { useStaffList } from "@/hooks/useAgencyTeam";
import { financeKey, usePayroll } from "@/hooks/useAgencyFinance";
import { useMoney } from "@/hooks/useAgencyDashboard";
import { createPayroll, markPayrollPaid, type PayrollRecord } from "@/lib/api/agency/finance";
import type { ApiError } from "@/lib/api/client";

const PAGE_SIZE = 20;
const field = "mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50";
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function NewPayroll({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const guides = useGuideList({ limit: 100 });
  const staff = useStaffList();
  const [payee, setPayee] = useState("");
  const [start, setStart] = useState(today());
  const [end, setEnd] = useState(today());
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: () => {
      const [kind, id] = payee.split(":");
      return createPayroll({ ...(kind === "guide" ? { guideId: id } : { staffId: id }), periodStart: start, periodEnd: end, amount: Number(amount), notes: notes.trim() || undefined });
    },
    onSuccess: () => { toast.success("Payroll entry created"); void qc.invalidateQueries({ queryKey: financeKey }); onDone(); },
    onError: (e) => setError((e as unknown as ApiError).message || "Couldn't create the entry."),
  });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!payee) return setError("Choose who is being paid.");
    if (!amount.trim() || !(Number(amount) > 0)) return setError("Enter an amount greater than 0.");
    if (!start || !end) return setError("Choose the pay period.");
    if (end < start) return setError("The period can't end before it starts.");
    save.mutate();
  }
  const guideRows = guides.data?.guides ?? [];
  return (
    <form onSubmit={submit} noValidate className="space-y-3 p-4">
      <label className="block text-sm"><span className="font-semibold text-neutral-700">Pay to</span>
        <select aria-label="Pay to" className={field} value={payee} onChange={(e) => setPayee(e.target.value)}><option value="">Choose…</option>
          {guideRows.length > 0 && <optgroup label="Guides">{guideRows.map((g) => <option key={g.id} value={`guide:${g.guideRef ?? g.id}`}>{g.name}</option>)}</optgroup>}
          {(staff.data ?? []).filter((s) => s.isActive).length > 0 && <optgroup label="Staff">{(staff.data ?? []).filter((s) => s.isActive).map((s) => <option key={s.id} value={`staff:${s.id}`}>{s.name ?? s.user.user.email}</option>)}</optgroup>}
        </select></label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm"><span className="font-semibold text-neutral-700">Period start</span><input aria-label="Period start" type="date" className={field} value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label className="block text-sm"><span className="font-semibold text-neutral-700">Period end</span><input aria-label="Period end" type="date" className={field} value={end} onChange={(e) => setEnd(e.target.value)} /></label>
        <label className="block text-sm"><span className="font-semibold text-neutral-700">Amount</span><input aria-label="Amount" type="number" min={0} step="0.01" className={field} value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
      </div>
      <label className="block text-sm"><span className="font-semibold text-neutral-700">Notes (optional)</span><input aria-label="Notes" className={field} value={notes} maxLength={300} onChange={(e) => setNotes(e.target.value)} /></label>
      {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
      <div className="flex justify-end gap-2"><button type="button" onClick={onDone} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Cancel</button><button type="submit" disabled={save.isPending} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{save.isPending ? "Saving…" : "Create entry"}</button></div>
    </form>
  );
}

function PayForm({ rec, onDone }: { rec: PayrollRecord; onDone: () => void }) {
  const qc = useQueryClient();
  const money = useMoney();
  const [date, setDate] = useState(today());
  const [account, setAccount] = useState("1010");
  const [error, setError] = useState<string | null>(null);
  const pay = useMutation({ mutationFn: () => markPayrollPaid(rec.id, { paymentDate: date, paymentAccountCode: account }), onSuccess: () => { toast.success("Marked as paid"); void qc.invalidateQueries({ queryKey: financeKey }); onDone(); }, onError: (e) => setError((e as unknown as ApiError).message || "Couldn't mark this as paid.") });
  return (
    <div className="space-y-3 p-4">
      <p className="text-sm text-neutral-700">Pay <strong>{money(Number(rec.amount))}</strong> to <strong>{rec.payeeName ?? "this person"}</strong>. This is recorded as an expense.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm"><span className="font-semibold text-neutral-700">Payment date</span><input aria-label="Payment date" type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label className="block text-sm"><span className="font-semibold text-neutral-700">Paid from</span><select aria-label="Paid from" className={field} value={account} onChange={(e) => setAccount(e.target.value)}><option value="1010">Cash on hand</option><option value="1020">Bank account</option></select></label>
      </div>
      {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
      <div className="flex justify-end gap-2"><button type="button" onClick={onDone} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Cancel</button><button type="button" disabled={pay.isPending} onClick={() => { if (!date) return setError("Choose the payment date."); pay.mutate(); }} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{pay.isPending ? "Saving…" : "Confirm payment"}</button></div>
    </div>
  );
}

export default function PayrollPage() {
  const money = useMoney();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [paying, setPaying] = useState<PayrollRecord | null>(null);
  const { data, isLoading, isError } = usePayroll({ status: status || undefined, page, limit: PAGE_SIZE });
  const rows = data?.data ?? [];
  const totalPages = Math.max(1, data?.pagination.totalPages ?? 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-6 text-sm"><div><div className="text-[11px] text-neutral-500">Still to pay</div><div className="text-lg font-bold text-warning-700">{data ? money(data.summary.draftTotal) : "—"}</div></div><div><div className="text-[11px] text-neutral-500">Paid</div><div className="text-lg font-bold text-success-700">{data ? money(data.summary.paidTotal) : "—"}</div></div></div>
        <div className="flex items-center gap-3"><select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none"><option value="">All</option><option value="DRAFT">To pay</option><option value="PAID">Paid</option></select>
          <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-2 rounded-2xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"><Plus className="h-4 w-4" /> New payroll entry</button></div>
      </div>
      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load payroll.</p>}
      <div className="overflow-x-auto border-t border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500"><tr><th className="w-14 px-4 py-3">S.No</th><th className="px-4 py-3">Person</th><th className="px-4 py-3">Period</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead>
          <tbody>
            {isLoading && Array.from({ length: 3 }).map((_, i) => <tr key={i} className="border-b border-neutral-200"><td colSpan={6} className="px-4 py-4"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td></tr>)}
            {!isLoading && rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-500">{status ? "No entries match this filter." : "No payroll entries yet."}</td></tr>}
            {rows.map((r, index) => (
              <tr key={r.id} className="border-b border-neutral-200 hover:bg-neutral-50"><td className="px-4 py-3 text-neutral-500">{(page - 1) * PAGE_SIZE + index + 1}</td>
                <td className="px-4 py-3 font-semibold text-neutral-900">{r.payeeName ?? "Unknown"}<div className="text-xs font-normal text-neutral-500">{r.guideId ? "Guide" : "Staff"}{r.notes ? ` · ${r.notes}` : ""}</div></td>
                <td className="px-4 py-3 text-neutral-700">{fmt(r.periodStart)} – {fmt(r.periodEnd)}</td>
                <td className="px-4 py-3 text-neutral-900">{money(Number(r.amount))}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.status === "PAID" ? "bg-success-50 text-success-700" : "bg-warning-50 text-warning-700"}`}>{r.status === "PAID" ? "Paid" : "To pay"}</span></td>
                <td className="px-4 py-3">{r.status === "DRAFT" && <button type="button" aria-label={`Mark ${r.payeeName ?? "entry"} paid`} onClick={() => setPaying(r)} className="rounded-xl bg-primary-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-800">Mark paid</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} />
      <Modal isOpen={adding} onClose={() => setAdding(false)} title="New payroll entry" size="md">{adding && <NewPayroll onDone={() => setAdding(false)} />}</Modal>
      <Modal isOpen={paying !== null} onClose={() => setPaying(null)} title="Mark as paid" size="md">{paying && <PayForm rec={paying} onDone={() => setPaying(null)} />}</Modal>
    </div>
  );
}
