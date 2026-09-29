"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Crown, Eye, Mail, MapPin, Pencil, Phone, ShieldCheck, Trash2, UserRound } from "lucide-react";

import { BookingStatusBadge } from "@/components/agency/bookings/BookingStatusBadge";
import { EditCustomerModal, RemoveCustomerModal } from "@/components/agency/customers/CustomerModals";
import { useMoney } from "@/hooks/useAgencyDashboard";
import { useAddCustomerNote, useCustomerNotes, useCustomerProfile } from "@/hooks/useAgencyCustomers";
import type { ApiError } from "@/lib/api/client";

const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

const btn = "inline-flex items-center gap-2 border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50";
const strip = "bg-neutral-50 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-600";

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="border border-neutral-200 bg-white">
      <div className={`${strip} flex items-center justify-between gap-3`}>
        <h2>{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Row({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-b border-neutral-100 py-2.5 text-sm last:border-b-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="break-words font-semibold text-neutral-900">{children}</p>
      </div>
    </div>
  );
}

export default function CustomerDetailPage() {
  const { id: rawId } = useParams<{ id: string }>();
  const id = (() => { try { return decodeURIComponent(rawId); } catch { return rawId; } })();
  const router = useRouter();
  const money = useMoney();
  const { data: profile, isLoading, isError, error } = useCustomerProfile(id);
  const notes = useCustomerNotes(id);
  const addNote = useAddCustomerNote(id);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);

  if (isLoading) return <div className="mx-auto h-48 max-w-6xl animate-pulse border border-neutral-200 bg-white" />;
  if (isError || !profile) {
    const st = (error as unknown as ApiError | undefined)?.status;
    return (
      <div className="mx-auto max-w-6xl space-y-3 border border-neutral-200 bg-white p-6">
        <p className="text-sm text-neutral-700">{st === 404 || st === 400 ? "This customer hasn't booked with your agency (or doesn't exist)." : "Couldn't load this customer."}</p>
        <Link href="/dashboard/customers" className="text-sm font-semibold text-primary-700 hover:underline">← Back to customers</Link>
      </div>
    );
  }

  const { customer, stats, bookingHistory } = profile;
  const name = customer.fullName ?? "Unnamed customer";
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  const noteList = notes.data ?? profile.notes ?? [];
  const asRow = { trekkerId: id, fullName: customer.fullName, email: customer.user.email, phone: customer.phone, country: customer.country };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    addNote.mutate(text.trim(), {
      onSuccess: () => { setText(""); toast.success(`Note added to ${name}`); },
      onError: (err) => toast.error((err as unknown as ApiError).message || "Couldn't add the note."),
    });
  }

  const tiles: Array<[string, string, string?]> = [
    ["Total spent", money(stats.totalSpent)],
    ["Bookings", String(stats.visitCount), stats.visitCount > 1 ? "Repeat customer" : "First-time customer"],
    ["Average booking", money(stats.averageBookingValue)],
    ["Last booking", fmt(stats.lastBookingDate), `First: ${fmt(stats.firstBookingDate)}`],
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 py-2 sm:py-4">
      <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link>
            <span className="text-neutral-300">/</span>
            <Link href="/dashboard/customers" className="hover:text-neutral-900">Customers</Link>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-primary-900">Details</span>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-900 text-lg font-bold text-white">{initials || "?"}</div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-neutral-900">{name}</h1>
                {stats.badge && <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800"><Crown className="h-3 w-3" />{stats.badge}</span>}
                {customer.isGuest && <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-xs font-semibold text-neutral-600">guest</span>}
              </div>
              <p className="text-sm text-neutral-500">{customer.user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setEditing(true)} className={btn}><Pencil className="h-4 w-4" /> Edit</button>
          <button type="button" onClick={() => setRemoving(true)} className="inline-flex items-center gap-2 bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700"><Trash2 className="h-4 w-4" /> Delete</button>
        </div>
      </div>

      <div className="grid gap-px border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(([label, value, hint]) => (
          <div key={label} className="bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-neutral-900">{value}</p>
            {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
          </div>
        ))}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="border border-neutral-200 bg-white">
            <h2 className={strip}>Booking history{bookingHistory.length ? ` · ${bookingHistory.length}` : ""}</h2>
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                <tr className="border-b border-neutral-100">
                  <th className="w-14 px-4 py-3">S.No</th><th className="px-4 py-3">Package</th><th className="px-4 py-3">Booked on</th><th className="px-4 py-3">Group</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookingHistory.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-500">No bookings found.</td></tr>}
                {bookingHistory.map((b, i) => (
                  <tr key={b.id} className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50">
                    <td className="px-4 py-3 text-neutral-500">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-neutral-900">{b.package?.title ?? "Trek"}</td>
                    <td className="px-4 py-3 text-neutral-700">{fmt(b.createdAt)}</td>
                    <td className="px-4 py-3 text-neutral-700">{b.groupSize}</td>
                    <td className="px-4 py-3 text-right font-semibold text-neutral-900">{money(Number(b.totalPrice))}</td>
                    <td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td>
                    <td className="px-4 py-3"><Link href={`/dashboard/bookings/${b.id}`} aria-label={`View booking of ${b.package?.title ?? "trek"}`} title="View booking" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100"><Eye className="h-4 w-4" /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <Panel title="Private notes">
            {customer.isGuest ? (
              <p className="border border-warning-200 bg-warning-50 px-3 py-2 text-xs text-warning-800">This traveller booked without a Funtush account, so notes aren&apos;t available.</p>
            ) : (
              <>
                <p className="text-xs text-neutral-500">Only your agency&apos;s staff can see these.</p>
                <form onSubmit={submit} className="mt-3 space-y-2">
                  <textarea aria-label="New note" rows={3} value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} placeholder="Preferences, follow-ups…" className="w-full border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
                  <button type="submit" disabled={addNote.isPending || !text.trim()} className="bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{addNote.isPending ? "Saving…" : "Add note"}</button>
                </form>
                <ul className="mt-4 divide-y divide-neutral-100">
                  {noteList.length === 0 && <li className="py-2 text-sm text-neutral-500">No notes yet.</li>}
                  {noteList.map((n) => (
                    <li key={n.id} className="py-3 text-sm first:pt-0"><p className="whitespace-pre-wrap text-neutral-800">{n.noteText}</p><p className="mt-1 text-xs text-neutral-500">{fmt(n.createdAt)}</p></li>
                  ))}
                </ul>
              </>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Contact" action={<button type="button" onClick={() => setEditing(true)} className="text-[11px] font-semibold normal-case tracking-normal text-primary-700 hover:underline">Edit</button>}>
            <Row icon={Mail} label="Email">{customer.user.email}</Row>
            <Row icon={Phone} label="Phone">{customer.phone ?? "—"}</Row>
            <Row icon={MapPin} label="Country">{customer.country ?? "—"}</Row>
            {customer.nationality && <Row icon={UserRound} label="Nationality">{customer.nationality}</Row>}
            <Row icon={Phone} label="Emergency contact">{customer.emergencyContactName ? `${customer.emergencyContactName}${customer.emergencyContactPhone ? ` · ${customer.emergencyContactPhone}` : ""}` : "—"}</Row>
          </Panel>

          <Panel title="Account">
            <Row icon={ShieldCheck} label="Funtush account">{customer.isGuest ? "No — booked as a guest" : customer.isEmailVerified ? "Yes · email verified" : "Yes · email not verified"}</Row>
            <Row icon={UserRound} label="Customer since">{fmt(stats.firstBookingDate)}</Row>
            <p className="mt-3 text-xs text-neutral-500">Changes you make here are only visible to your agency. The traveller&apos;s own account isn&apos;t changed.</p>
          </Panel>
        </div>
      </div>

      <EditCustomerModal customer={editing ? asRow : null} onClose={() => setEditing(false)} />
      <RemoveCustomerModal customer={removing ? asRow : null} onClose={() => setRemoving(false)} onRemoved={() => router.replace("/dashboard/customers")} />
    </div>
  );
}
