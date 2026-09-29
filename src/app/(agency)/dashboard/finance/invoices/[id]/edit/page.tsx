"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import InvoiceForm from "@/components/agency/finance/InvoiceForm";
import { useInvoice } from "@/hooks/useAgencyFinance";

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useInvoice(id);
  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (!data) return <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm">This invoice doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/finance/invoices">Back to invoices</Link></div>;
  if (data.status === "Paid" || data.status === "Void") return <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm">A {data.status.toLowerCase()} invoice can&apos;t be edited. <Link className="font-semibold text-primary-700 hover:underline" href={`/dashboard/finance/invoices/${id}`}>Back to the invoice</Link></div>;
  return <div className="space-y-4"><Link href={`/dashboard/finance/invoices/${id}`} className="text-sm text-neutral-500 hover:text-neutral-900">← {data.invoiceNumber}</Link><h2 className="text-xl font-bold text-neutral-900">Edit invoice</h2><InvoiceForm invoice={data} /></div>;
}
