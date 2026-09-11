"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteOutlined, EditOutlined, VisibilityOutlined } from "@mui/icons-material";
import { CalendarCheck2, Globe2, Users } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import usersData from "../../../../../data/users.json";
import bookingsData from "../../../../../data/bookings.json";

type Customer = {
  id: string;
  name: string;
  email: string;
  country: string;
  phone: string;
  member_since: string;
};

const customers = (usersData as Array<Customer & { role: string }>).filter(
  (user) => user.role === "trekker",
);

export default function CustomersPage() {
  const router = useRouter();
  const [customerRows, setCustomerRows] = useState(customers);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialog, setDialog] = useState<{ type: "edit" | "delete"; customer: Customer } | null>(null);

  const countries = useMemo(() => Array.from(new Set(customers.map((customer) => customer.country))), []);
  const bookingCounts = useMemo(() => {
    return customers.reduce<Record<string, number>>((counts, customer) => {
      counts[customer.id] = (bookingsData as Array<{ trekker_id: string }>).filter(
        (booking) => booking.trekker_id === customer.id,
      ).length;
      return counts;
    }, {});
  }, []);
  const filteredCustomers = useMemo(
    () => customerRows.filter((customer) => {
      const query = search.toLowerCase();
      return (
        (customer.name.toLowerCase().includes(query) || customer.email.toLowerCase().includes(query)) &&
        (country === "all" || customer.country === country)
      );
    }),
    [country, customerRows, search],
  );
  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / perPage));
  const pageCustomers = filteredCustomers.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleDialogAction = () => {
    if (!dialog) return;
    if (dialog.type === "edit") router.push(`/dashboard/customers/${dialog.customer.id}`);
    if (dialog.type === "delete") setCustomerRows((rows) => rows.filter((customer) => customer.id !== dialog.customer.id));
    setDialog(null);
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <button type="button" onClick={() => router.push("/dashboard")} className="hover:text-neutral-900">Dashboard</button>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">All Customers</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Customers</h1>
          <p className="mt-1 text-sm text-neutral-600">Manage trekker profiles and booking history.</p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <AnalyticsSummaryCard label="Total Customers" value={customerRows.length} tone="primary" icon={Users} />
        <AnalyticsSummaryCard label="Countries" value={countries.length} tone="success" icon={Globe2} />
        <AnalyticsSummaryCard label="With Bookings" value={Object.values(bookingCounts).filter(Boolean).length} tone="warning" icon={CalendarCheck2} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px]">
        <input
          value={search}
          onChange={(event) => { setSearch(event.target.value); setCurrentPage(1); }}
          placeholder="Search customers"
          className="rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
        <select
          value={country}
          onChange={(event) => { setCountry(event.target.value); setCurrentPage(1); }}
          className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          <option value="all">All countries</option>
          {countries.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto border-t border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            <tr><th className="px-4 py-3">S.NO</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Country</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Bookings</th><th className="px-4 py-3">Member since</th><th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody>
            {pageCustomers.map((customer, index) => (
              <tr key={customer.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                <td className="px-4 py-3 font-semibold text-neutral-900">{(currentPage - 1) * perPage + index + 1}</td>
                <td className="px-4 py-3"><div className="font-semibold text-neutral-900">{customer.name}</div><div className="text-xs text-neutral-500">{customer.email}</div></td>
                <td className="px-4 py-3 text-neutral-700">{customer.country}</td>
                <td className="px-4 py-3 text-neutral-700">{customer.phone}</td>
                <td className="px-4 py-3 font-semibold text-neutral-900">{bookingCounts[customer.id] ?? 0}</td>
                <td className="px-4 py-3 text-neutral-700">{customer.member_since}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2">
                  <ActionButton label="View" tone="primary" onClick={() => router.push(`/dashboard/customers/${customer.id}`)}><VisibilityOutlined sx={{ fontSize: 18 }} /></ActionButton>
                  <ActionButton label="Edit" tone="warning" onClick={() => setDialog({ type: "edit", customer })}><EditOutlined sx={{ fontSize: 18 }} /></ActionButton>
                  <ActionButton label="Delete" tone="danger" onClick={() => setDialog({ type: "delete", customer })}><DeleteOutlined sx={{ fontSize: 18 }} /></ActionButton>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {pageCustomers.length === 0 && <p className="px-4 py-8 text-center text-sm text-neutral-500">No customers found.</p>}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {dialog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><h2 className="text-lg font-semibold text-neutral-900">{dialog.type === "delete" ? "Delete customer?" : "Edit customer?"}</h2><p className="mt-2 text-sm leading-6 text-neutral-600">{dialog.type === "delete" ? `Remove ${dialog.customer.name} from the customer list?` : `Open ${dialog.customer.name}'s profile?`}</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setDialog(null)} className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900">Cancel</button><button type="button" onClick={handleDialogAction} className={`rounded-2xl px-4 py-2 text-sm font-semibold text-white ${dialog.type === "delete" ? "bg-danger-600" : "bg-primary-900"}`}>{dialog.type === "delete" ? "Delete customer" : "Continue"}</button></div></div></div>}
    </div>
  );
}

function ActionButton({ label, tone, onClick, children }: { label: string; tone: "primary" | "warning" | "danger"; onClick: () => void; children: React.ReactNode }) {
  const styles = { primary: "bg-primary-50 text-primary-700 hover:bg-primary-100", warning: "bg-warning-50 text-warning-700 hover:bg-warning-100", danger: "bg-danger-50 text-danger-700 hover:bg-danger-100" };
  return <button type="button" aria-label={label} title={label} onClick={onClick} className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${styles[tone]}`}>{children}</button>;
}
