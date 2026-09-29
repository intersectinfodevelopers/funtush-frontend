"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { EntryForm } from "@/components/agency/finance/LedgerPage";

const TABS = [
  { href: "/dashboard/finance", label: "Overview" },
  { href: "/dashboard/finance/income", label: "Income" },
  { href: "/dashboard/finance/expenses", label: "Expenses" },
  { href: "/dashboard/finance/payroll", label: "Payroll" },
  { href: "/dashboard/finance/invoices", label: "Invoices" },
  { href: "/dashboard/finance/reports", label: "Reports" },
];

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [recording, setRecording] = useState(false);
  const tabLabel = TABS.find((t) => (t.href === "/dashboard/finance" ? path === t.href : path.startsWith(t.href)))?.label ?? "Overview";
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500"><Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span><Link href="/dashboard/finance" className="hover:text-neutral-900">Finance</Link><span className="text-neutral-300">/</span><span className="font-semibold text-neutral-900">{tabLabel}</span></div>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Finance</h1>
        </div>
        <button type="button" onClick={() => setRecording(true)} className="inline-flex items-center gap-2 self-start rounded-full bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-800"><Plus className="h-4 w-4" /> Record income</button>
      </div>
      <nav aria-label="Finance sections" className="flex flex-wrap gap-1 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-sm">
        {TABS.map((t) => {
          const active = t.href === "/dashboard/finance" ? path === t.href : path.startsWith(t.href);
          return <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined} className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${active ? "bg-primary-900 text-white shadow-sm" : "text-neutral-600 hover:bg-neutral-100"}`}>{t.label}</Link>;
        })}
      </nav>
      {children}
      <Modal isOpen={recording} onClose={() => setRecording(false)} title="Record income" size="md">{recording && <EntryForm kind="income" onDone={() => setRecording(false)} />}</Modal>
    </div>
  );
}
