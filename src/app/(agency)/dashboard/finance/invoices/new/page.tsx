"use client";

import Link from "next/link";
import InvoiceForm from "@/components/agency/finance/InvoiceForm";

export default function NewInvoicePage() {
  return <div className="space-y-4"><Link href="/dashboard/finance/invoices" className="text-sm text-neutral-500 hover:text-neutral-900">← Invoices</Link><h2 className="text-xl font-bold text-neutral-900">New invoice</h2><InvoiceForm /></div>;
}
