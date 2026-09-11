"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import usersData from "../../../../../../data/users.json";
import bookingsData from "../../../../../../data/bookings.json";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const customer = useMemo(() => (usersData as Array<{ id: string; role: string }>).find((user) => user.id === id && user.role === "trekker"), [id]);
  const bookings = (bookingsData as Array<{ id: string; trekker_id: string; status: string; total_price: number; departure_date: string }>).filter((booking) => booking.trekker_id === id);

  if (!customer) return <div className="p-6 text-sm text-neutral-500">Customer not found.</div>;

  const details = customer as typeof customer & { name: string; email: string; country: string; phone: string; member_since: string };
  return <div className="space-y-4">
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <button type="button" onClick={() => router.push("/dashboard/customers")} className="text-sm font-medium text-primary-900 hover:underline">← Back to customers</button>
      <div className="mt-4 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-900">{details.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div><h1 className="text-2xl font-bold text-neutral-900">{details.name}</h1><p className="text-sm text-neutral-500">{details.email}</p></div></div>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Country", details.country], ["Phone", details.phone], ["Member since", details.member_since], ["Bookings", String(bookings.length)]].map(([label, value]) => <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{label}</p><p className="mt-2 text-sm font-semibold text-neutral-900">{value}</p></div>)}</div>
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"><div className="border-b border-neutral-200 px-4 py-3"><h2 className="font-semibold text-neutral-900">Booking history</h2></div><div className="divide-y divide-neutral-200">{bookings.length ? bookings.map((booking) => <div key={booking.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm"><span className="font-medium text-neutral-900">{booking.id}</span><span className="capitalize text-neutral-600">{booking.status}</span><span className="text-neutral-600">{booking.departure_date}</span><span className="font-semibold text-neutral-900">Rs. {booking.total_price.toLocaleString("en-IN")}</span></div>) : <p className="px-4 py-6 text-sm text-neutral-500">No bookings found.</p>}</div></section>
  </div>;
}
