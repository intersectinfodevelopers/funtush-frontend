"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";

import { financeKey } from "@/hooks/useAgencyFinance";
import { useMoney } from "@/hooks/useAgencyDashboard";
import { listBookings } from "@/lib/api/agency/bookings";
import { createInvoice, updateInvoice, type Invoice, type LineItem } from "@/lib/api/agency/finance";
import type { ApiError } from "@/lib/api/client";

const field = "mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50";
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const blank = (): LineItem => ({ description: "", quantity: 1, unitPrice: 0 });

export default function InvoiceForm({ invoice }: { invoice?: Invoice }) {
  const router = useRouter();
  const qc = useQueryClient();
  const money = useMoney();
  const bookings = useQuery({ queryKey: ["agency", "bookings", "for-invoice"], queryFn: () => listBookings({ limit: 50 }), enabled: !invoice });
  const [bookingId, setBookingId] = useState(invoice?.bookingId ?? "");
  const [name, setName] = useState(invoice?.trekkerName ?? "");
  const [email, setEmail] = useState(invoice?.trekkerEmail ?? "");
  const [pkg, setPkg] = useState(invoice?.packageName ?? "");
  const [items, setItems] = useState<LineItem[]>(invoice?.lineItems.length ? invoice.lineItems : [blank()]);
  const [discount, setDiscount] = useState(String(invoice?.discount ?? 0));
  const [issue, setIssue] = useState(invoice?.issueDate ?? new Date().toISOString().slice(0, 10));
  const [due, setDue] = useState(invoice?.dueDate ?? "");
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);
  const save = useMutation({
    mutationFn: () => {
      const body = { trekkerName: name.trim() || undefined, trekkerEmail: email.trim() || null, packageName: pkg.trim() || null, lineItems: items.filter((i) => i.description.trim()), discount: Number(discount) || 0, issueDate: issue || null, dueDate: due || null, notes: notes.trim() || null };
      return invoice ? updateInvoice(invoice.id, body) : createInvoice({ ...body, bookingId: bookingId || null });
    },
    onSuccess: (inv) => { toast.success(invoice ? "Invoice saved" : "Invoice created"); void qc.invalidateQueries({ queryKey: financeKey }); router.push(`/dashboard/finance/invoices/${inv.id}`); },
    onError: (e) => setError((e as unknown as ApiError).message || "Couldn't save the invoice."),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fromBooking = Boolean(bookingId) && !invoice;
    if (!fromBooking && !name.trim()) return setError("Enter the trekker's name.");
    if (email.trim() && !EMAIL_RE.test(email.trim())) return setError("Enter a valid email address, or leave it blank.");
    const filled = items.filter((i) => i.description.trim());
    if (!fromBooking && filled.length === 0) return setError("Add at least one line item.");
    if (filled.some((i) => !(Number(i.quantity) > 0) || !(Number(i.unitPrice) >= 0))) return setError("Every line needs a quantity above 0 and a price of 0 or more.");
    if (!(Number(discount) >= 0)) return setError("The discount can't be negative.");
    if (filled.length && Number(discount) > subtotal) return setError("The discount can't be more than the subtotal.");
    if (due && issue && due < issue) return setError("The due date can't be before the issue date.");
    save.mutate();
  }
  const setItem = (i: number, patch: Partial<LineItem>) => setItems(items.map((x, k) => (k === i ? { ...x, ...patch } : x)));

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      {!invoice && (
        <label className="block text-sm"><span className="font-semibold text-neutral-700">Create from a booking (optional)</span>
          <select aria-label="Booking" className={field} value={bookingId} onChange={(e) => setBookingId(e.target.value)}><option value="">— none, enter details —</option>{(bookings.data?.bookings ?? []).map((b) => <option key={b.id} value={b.id}>{b.trekkerName} · {b.id.slice(0, 8)}</option>)}</select>
          {bookingId && <span className="mt-1 block text-xs text-neutral-500">Name, package and price are filled from the booking. You can still override them below.</span>}</label>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm"><span className="font-semibold text-neutral-700">Trekker name</span><input aria-label="Trekker name" className={field} value={name} maxLength={120} onChange={(e) => setName(e.target.value)} /></label>
        <label className="block text-sm"><span className="font-semibold text-neutral-700">Trekker email</span><input aria-label="Trekker email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="block text-sm sm:col-span-2"><span className="font-semibold text-neutral-700">Package</span><input aria-label="Package" className={field} value={pkg} maxLength={150} onChange={(e) => setPkg(e.target.value)} /></label>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-neutral-700">Line items</p>
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-[1fr_80px_110px_auto] items-center gap-2">
            <input aria-label={`Item ${i + 1} description`} placeholder="Description" className={field} value={it.description} maxLength={200} onChange={(e) => setItem(i, { description: e.target.value })} />
            <input aria-label={`Item ${i + 1} quantity`} type="number" min={0} className={field} value={it.quantity} onChange={(e) => setItem(i, { quantity: Number(e.target.value) })} />
            <input aria-label={`Item ${i + 1} price`} type="number" min={0} className={field} value={it.unitPrice} onChange={(e) => setItem(i, { unitPrice: Number(e.target.value) })} />
            <button type="button" aria-label={`Remove item ${i + 1}`} onClick={() => setItems(items.filter((_, k) => k !== i))} disabled={items.length === 1} className="rounded-md p-1.5 text-danger-600 hover:bg-danger-50 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {items.length < 50 && <button type="button" onClick={() => setItems([...items, blank()])} className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-1.5 text-sm font-semibold hover:bg-neutral-50"><Plus className="h-4 w-4" /> Add line</button>}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm"><span className="font-semibold text-neutral-700">Discount</span><input aria-label="Discount" type="number" min={0} className={field} value={discount} onChange={(e) => setDiscount(e.target.value)} /></label>
        <label className="block text-sm"><span className="font-semibold text-neutral-700">Issue date</span><input aria-label="Issue date" type="date" className={field} value={issue} onChange={(e) => setIssue(e.target.value)} /></label>
        <label className="block text-sm"><span className="font-semibold text-neutral-700">Due date</span><input aria-label="Due date" type="date" className={field} value={due} onChange={(e) => setDue(e.target.value)} /></label>
      </div>
      <label className="block text-sm"><span className="font-semibold text-neutral-700">Notes</span><textarea aria-label="Notes" rows={2} className={field} value={notes} maxLength={1000} onChange={(e) => setNotes(e.target.value)} /></label>
      <p className="text-right text-sm text-neutral-600">Total: <strong className="text-neutral-900">{money(Math.max(0, subtotal - (Number(discount) || 0)))}</strong></p>
      {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
      <div className="flex justify-end gap-2"><Link href="/dashboard/finance/invoices" className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Cancel</Link><button type="submit" disabled={save.isPending} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{save.isPending ? "Saving…" : invoice ? "Save invoice" : "Create invoice"}</button></div>
    </form>
  );
}
