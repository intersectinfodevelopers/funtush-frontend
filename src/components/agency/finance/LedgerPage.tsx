"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { financeKey, useTransactions } from "@/hooks/useAgencyFinance";
import { useMoney } from "@/hooks/useAgencyDashboard";
import { EXPENSE_CATEGORIES, recordExpense, recordIncome } from "@/lib/api/agency/finance";
import type { ApiError } from "@/lib/api/client";

const PAGE_SIZE = 20;
const field = "mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50";
const today = () => new Date().toISOString().slice(0, 10);

export function EntryForm({ kind, onDone }: { kind: "income" | "expense"; onDone: () => void }) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today());
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0][0]);
  const [account, setAccount] = useState("1010");
  const [revenue, setRevenue] = useState("4000");
  const [error, setError] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: () => {
      const base = { amount: Number(amount), description: description.trim() || undefined, entryDate: date };
      return kind === "income" ? recordIncome({ ...base, depositAccountCode: account, revenueAccountCode: revenue }) : recordExpense({ ...base, category, paymentAccountCode: account });
    },
    onSuccess: () => { toast.success(kind === "income" ? "Income recorded" : "Expense recorded"); void qc.invalidateQueries({ queryKey: financeKey }); onDone(); },
    onError: (e) => setError((e as unknown as ApiError).message || "Couldn't record this entry."),
  });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const n = Number(amount);
    if (!amount.trim() || !Number.isFinite(n) || n <= 0) return setError("Enter an amount greater than 0.");
    if (!date) return setError("Choose a date.");
    if (description.length > 200) return setError("Keep the description under 200 characters.");
    save.mutate();
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-3 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm"><span className="font-semibold text-neutral-700">Amount</span><input aria-label="Amount" type="number" min={0} step="0.01" className={field} value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
        <label className="block text-sm"><span className="font-semibold text-neutral-700">Date</span><input aria-label="Date" type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} /></label>
        {kind === "expense" && <label className="block text-sm"><span className="font-semibold text-neutral-700">Category</span><select aria-label="Category" className={field} value={category} onChange={(e) => setCategory(e.target.value)}>{EXPENSE_CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>}
        {kind === "income" && <label className="block text-sm"><span className="font-semibold text-neutral-700">Type of income</span><select aria-label="Type of income" className={field} value={revenue} onChange={(e) => setRevenue(e.target.value)}><option value="4000">Trek package</option><option value="4100">Add-ons</option><option value="4900">Other income</option></select></label>}
        <label className="block text-sm"><span className="font-semibold text-neutral-700">{kind === "income" ? "Paid into" : "Paid from"}</span><select aria-label="Account" className={field} value={account} onChange={(e) => setAccount(e.target.value)}><option value="1010">Cash on hand</option><option value="1020">Bank account</option></select></label>
      </div>
      <label className="block text-sm"><span className="font-semibold text-neutral-700">Note (optional)</span><input aria-label="Note" className={field} value={description} maxLength={200} onChange={(e) => setDescription(e.target.value)} /></label>
      {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
      <div className="flex justify-end gap-2"><button type="button" onClick={onDone} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Cancel</button><button type="submit" disabled={save.isPending} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{save.isPending ? "Saving…" : "Save"}</button></div>
    </form>
  );
}

export default function LedgerPage({ kind }: { kind: "income" | "expense" }) {
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const money = useMoney();
  const { data, isLoading, isError } = useTransactions({ type: kind === "income" ? "REVENUE" : "EXPENSE", page, limit: PAGE_SIZE });
  const rows = data?.data ?? [];
  const totalPages = Math.max(1, data?.pagination.totalPages ?? 1);
  const label = kind === "income" ? "Income" : "Expenses";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-600">{kind === "income" ? "Money received from bookings and other sources." : "Money your agency has spent."}</p>
        <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-2 rounded-2xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"><Plus className="h-4 w-4" /> Add {kind === "income" ? "income" : "expense"}</button>
      </div>
      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load {label.toLowerCase()}.</p>}
      <div className="overflow-x-auto border-t border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500"><tr><th className="w-14 px-4 py-3">S.No</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">{kind === "income" ? "Type" : "Category"}</th><th className="px-4 py-3 text-right">Amount</th></tr></thead>
          <tbody>
            {isLoading && Array.from({ length: 3 }).map((_, i) => <tr key={i} className="border-b border-neutral-200"><td colSpan={5} className="px-4 py-4"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td></tr>)}
            {!isLoading && rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-500">No {label.toLowerCase()} recorded yet.</td></tr>}
            {rows.map((l, index) => (
              <tr key={l.id} className="border-b border-neutral-200 hover:bg-neutral-50"><td className="px-4 py-3 text-neutral-500">{(page - 1) * PAGE_SIZE + index + 1}</td>
                <td className="px-4 py-3 text-neutral-700">{new Date(l.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</td>
                <td className="px-4 py-3 font-semibold text-neutral-900">{l.description}</td>
                <td className="px-4 py-3 text-neutral-700">{l.account.name}</td>
                <td className={`px-4 py-3 text-right font-semibold ${kind === "income" ? "text-success-700" : "text-danger-700"}`}>{money(Number(kind === "income" ? l.credit : l.debit))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} />
      <Modal isOpen={adding} onClose={() => setAdding(false)} title={kind === "income" ? "Record income" : "Record expense"} size="md">{adding && <EntryForm kind={kind} onDone={() => setAdding(false)} />}</Modal>
    </div>
  );
}
