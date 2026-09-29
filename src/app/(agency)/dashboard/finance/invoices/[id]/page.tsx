"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { financeKey, useInvoice } from "@/hooks/useAgencyFinance";
import { useMoney } from "@/hooks/useAgencyDashboard";
import { deleteInvoice, setInvoiceStatus, type InvoiceStatus } from "@/lib/api/agency/finance";
import type { ApiError } from "@/lib/api/client";


const STYLE: Record<InvoiceStatus, string> = { Draft: "bg-neutral-100 text-neutral-700", Sent: "bg-primary-50 text-primary-700", Paid: "bg-success-50 text-success-700", Overdue: "bg-danger-50 text-danger-700", Void: "bg-neutral-100 text-neutral-500" };
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "—");

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const money = useMoney();
  const { data: inv, isLoading } = useInvoice(id);
  const [error, setError] = useState<string | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: financeKey });
  const fail = (e: unknown) => setError((e as ApiError).message || "That didn't work — please try again.");
  const act = useMutation({ mutationFn: (a: "send" | "mark-paid" | "void") => setInvoiceStatus(id, a), onSuccess: () => { setError(null); toast.success("Invoice updated"); void refresh(); }, onError: fail });
  const del = useMutation({ mutationFn: () => deleteInvoice(id), onSuccess: () => { toast.success("Invoice deleted"); void refresh(); router.push("/dashboard/finance/invoices"); }, onError: fail });

  if (isLoading) return <div className="h-48 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (!inv) return <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm">This invoice doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/finance/invoices">Back to invoices</Link></div>;
  const editable = inv.status === "Draft" || inv.status === "Sent" || inv.status === "Overdue";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/dashboard/finance/invoices" className="text-sm text-neutral-500 hover:text-neutral-900">← Invoices</Link>
      <article aria-label="Invoice" className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-neutral-900">{inv.invoiceNumber}</h2><p className="text-sm text-neutral-500">Issued {fmt(inv.issueDate)} · Due {fmt(inv.dueDate)}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${STYLE[inv.status]}`}>{inv.status}</span></div>
        <div className="text-sm"><p className="font-semibold text-neutral-900">{inv.trekkerName}</p>{inv.trekkerEmail && <p className="text-neutral-600">{inv.trekkerEmail}</p>}{inv.packageName && <p className="text-neutral-600">{inv.packageName}</p>}</div>
        <table className="w-full text-left text-sm"><thead className="text-[10px] uppercase tracking-[0.2em] text-neutral-500"><tr><th className="py-2">Item</th><th className="py-2">Qty</th><th className="py-2">Price</th><th className="py-2 text-right">Amount</th></tr></thead>
          <tbody>{inv.lineItems.map((l, i) => <tr key={i} className="border-t border-neutral-100"><td className="py-2">{l.description}</td><td className="py-2">{l.quantity}</td><td className="py-2">{money(l.unitPrice)}</td><td className="py-2 text-right">{money(l.quantity * l.unitPrice)}</td></tr>)}</tbody></table>
        <dl className="ml-auto w-64 space-y-1 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{money(inv.subtotal)}</dd></div>{inv.discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>−{money(inv.discount)}</dd></div>}<div className="flex justify-between border-t border-neutral-300 pt-1 font-bold"><dt>Total</dt><dd>{money(inv.total)}</dd></div></dl>
        {inv.notes && <p className="rounded-xl bg-neutral-50 p-3 text-sm text-neutral-600">{inv.notes}</p>}
      </article>
      {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {inv.status === "Draft" && <button type="button" disabled={act.isPending} onClick={() => act.mutate("send")} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">Mark as sent</button>}
        {(inv.status === "Sent" || inv.status === "Overdue") && <button type="button" disabled={act.isPending} onClick={() => act.mutate("mark-paid")} className="rounded-xl bg-success-600 px-4 py-2 text-sm font-semibold text-white hover:bg-success-700 disabled:opacity-50">Mark as paid</button>}
        {editable && <Link href={`/dashboard/finance/invoices/${id}/edit`} className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Edit</Link>}
        {editable && <button type="button" disabled={act.isPending} onClick={() => { if (window.confirm("Void this invoice? This can't be undone.")) act.mutate("void"); }} className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Void</button>}
        {inv.status !== "Paid" && <button type="button" disabled={del.isPending} onClick={() => { if (window.confirm("Delete this invoice?")) del.mutate(); }} className="rounded-xl border border-danger-200 px-4 py-2 text-sm font-semibold text-danger-600 hover:bg-danger-50">Delete</button>}
      </div>
    </div>
  );
}
