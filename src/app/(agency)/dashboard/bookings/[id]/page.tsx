"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Copy, Mail, Phone } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { BookingStatusBadge } from "@/components/agency/bookings/BookingStatusBadge";
import { useMoney } from "@/hooks/useAgencyDashboard";
import { useAssignableGuides, useBooking, useBookingAction, useGuidesForTrek } from "@/hooks/useAgencyBookings";
import { allowedActions, type AcceptResult, type ApiBookingStatus, type BookingAction } from "@/lib/api/agency/bookings";
import type { ApiError } from "@/lib/api/client";

/** The happy path, in order. Cancelled/rejected bookings leave the path and show a banner instead. */
const STEPS: Array<{ status: ApiBookingStatus; label: string }> = [
  { status: "INQUIRY", label: "Inquiry" },
  { status: "PAYMENT_PENDING", label: "Payment" },
  { status: "PAID", label: "Paid" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "ACTIVE", label: "On trek" },
  { status: "COMPLETED", label: "Completed" },
];

const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "—");

const btn = {
  primary: "rounded-2xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:opacity-50",
  ghost: "rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-50",
  danger: "rounded-2xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger-700 disabled:opacity-50",
};

type Dialog = null | "reject" | "propose" | "cancel" | "assign" | "stage";

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: booking, isLoading, isError, error } = useBooking(id);
  const act = useBookingAction(id);
  const guides = useAssignableGuides();
  const money = useMoney();

  const [dialog, setDialog] = useState<Dialog>(null);
  const [reason, setReason] = useState("");
  const [proposedDate, setProposedDate] = useState("");
  const [guideRef, setGuideRef] = useState("");
  const [targetStep, setTargetStep] = useState<(typeof STEPS)[number] | null>(null);
  const trekGuides = useGuidesForTrek(booking?.departureDateId, id, dialog === "assign");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  function run(action: BookingAction, body?: Record<string, unknown>, done?: string, after?: (data: unknown) => void) {
    act.mutate(
      { action, body },
      {
        onSuccess: (res) => {
          if (done) toast.success(done);
          after?.((res as { data: unknown }).data);
          setDialog(null);
          setReason("");
        },
        onError: (e) => toast.error((e as unknown as ApiError).message || "That didn't work — please try again."),
      },
    );
  }

  if (isLoading) return <div className="h-48 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (isError || !booking) {
    const notFound = (error as unknown as ApiError | undefined)?.status === 404;
    return (
      <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-6">
        <p className="text-sm text-neutral-700">{notFound ? "This booking doesn't exist (or belongs to another agency)." : "Couldn't load this booking."}</p>
        <Link href="/dashboard/bookings" className="text-sm font-semibold text-primary-700 hover:underline">← Back to bookings</Link>
      </div>
    );
  }

  const status = booking.status;
  const actions = allowedActions(status);
  const stepIndex = STEPS.findIndex((s) => s.status === status);
  const offPath = stepIndex === -1; // ALTERNATIVE_PROPOSED / CANCELLED / REJECTED
  const guide = guides.data?.guides.find((g) => g.guideRef === booking.assignedGuideId);
  const payLink = paymentUrl ?? (booking.paymentLink?.urlToken ? `${window.location.origin}/pay/${booking.paymentLink.urlToken}` : null);
  const busy = act.isPending;

  const has = (a: BookingAction) => actions.includes(a);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link href="/dashboard/bookings" className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700">
            ← Back to bookings
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Booking details</h1>
          <p className="text-sm text-neutral-600">Review the traveller, package and schedule, then take the next step.</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <BookingStatusBadge status={status} />
          <p className="text-xs text-neutral-500">Booking ID: {booking.id}</p>
        </div>
      </div>

      {offPath ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            status === "ALTERNATIVE_PROPOSED" ? "border-warning-200 bg-warning-50 text-warning-800" : "border-danger-200 bg-danger-50 text-danger-800"
          }`}
        >
          {status === "ALTERNATIVE_PROPOSED" && <>Waiting for the traveller to respond to the proposed date{booking.proposedDate ? ` (${fmtDate(booking.proposedDate)})` : ""}.</>}
          {status === "CANCELLED" && <>This booking was cancelled. Its seats were released.</>}
          {status === "REJECTED" && <>This inquiry was rejected{booking.rejectionReason ? `: “${booking.rejectionReason}”` : ""}.</>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
          <ol className="flex w-full items-center gap-1 sm:gap-3">
            {STEPS.map((step, idx) => {
              const reached = idx <= stepIndex;
              const current = idx === stepIndex;
              return (
                <li key={step.status} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-3" aria-current={current ? "step" : undefined}>
                  <button
                    type="button"
                    disabled={current || busy}
                    onClick={() => { setTargetStep(step); setDialog("stage"); }}
                    title={current ? `Current step: ${step.label}` : `Move this booking to “${step.label}”`}
                    aria-label={current ? `${step.label} (current step)` : `Move to ${step.label}`}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition sm:h-9 sm:w-9 ${
                      current ? "bg-primary-900 text-white" : `${reached ? "bg-primary-200 text-primary-900" : "bg-neutral-50 text-neutral-500"} cursor-pointer hover:ring-2 hover:ring-primary-400`
                    }`}
                  >
                    {idx + 1}
                  </button>
                  <span className={`hidden text-sm font-medium sm:block ${current ? "text-neutral-900" : "text-neutral-600"}`}>{step.label}</span>
                  {idx < STEPS.length - 1 && <span className={`h-1 min-w-1 flex-1 ${idx < stepIndex ? "bg-primary-900" : "bg-neutral-200"}`} />}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">Booking summary</p>
                <h2 className="text-base font-semibold text-neutral-900">{booking.package?.title ?? "Package"}</h2>
              </div>
              <span className="text-lg font-semibold text-neutral-900">{money(Number(booking.totalPrice), booking.package?.currency)}</span>
            </div>
            <dl className="grid gap-x-6 gap-y-3 px-4 py-4 text-sm sm:grid-cols-2">
              <div><dt className="text-neutral-500">Departure</dt><dd className="font-medium text-neutral-900">{fmtDate(booking.departureDate?.startDate)}</dd></div>
              <div><dt className="text-neutral-500">Group size</dt><dd className="font-medium text-neutral-900">{booking.groupSize} traveller{booking.groupSize === 1 ? "" : "s"}</dd></div>
              <div><dt className="text-neutral-500">Requested on</dt><dd className="font-medium text-neutral-900">{fmtDate(booking.createdAt)}</dd></div>
              <div>
                <dt className="text-neutral-500">Assigned guide</dt>
                <dd className="font-medium text-neutral-900">{booking.assignedGuideId ? (guide?.name ?? "Assigned") : "Not assigned"}</dd>
              </div>
              {(booking.addOns?.length ?? 0) > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-neutral-500">Add-ons</dt>
                  <dd className="font-medium text-neutral-900">
                    {booking.addOns!.map((a) => a.addOn?.name ?? a.name).filter(Boolean).join(", ")}
                  </dd>
                </div>
              )}
              {booking.specialRequests && (
                <div className="sm:col-span-2">
                  <dt className="text-neutral-500">Special requests</dt>
                  <dd className="whitespace-pre-wrap font-medium text-neutral-900">{booking.specialRequests}</dd>
                </div>
              )}
            </dl>
          </section>

          {status === "PAYMENT_PENDING" && (
            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-4 text-sm">
              <h2 className="font-semibold text-primary-900">Waiting for payment</h2>
              {payLink ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-2 text-xs text-neutral-700">{payLink}</code>
                  <button
                    type="button"
                    className={btn.ghost}
                    onClick={() => navigator.clipboard.writeText(payLink).then(() => toast.success("Payment link copied"), () => toast.error("Couldn't copy"))}
                  >
                    <Copy className="mr-1 inline h-4 w-4" /> Copy
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-neutral-600">A payment link was sent to the traveller.</p>
              )}
              {booking.paymentLink?.expiresAt && <p className="mt-2 text-xs text-neutral-600">Link expires {fmtDate(booking.paymentLink.expiresAt)}. Unpaid bookings expire automatically.</p>}
            </section>
          )}
        </div>

        <div className="space-y-3">
          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">Traveller</p>
            <h2 className="mt-1 text-base font-semibold text-neutral-900">{booking.trekkerName}</h2>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-neutral-400" /><a className="truncate hover:underline" href={`mailto:${booking.trekkerEmail}`}>{booking.trekkerEmail}</a></li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-neutral-400" /><a className="hover:underline" href={`tel:${booking.trekkerPhone}`}>{booking.trekkerPhone}</a></li>
              {booking.trekkerCountry && <li className="text-neutral-500">{booking.trekkerCountry}</li>}
            </ul>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">Next step</p>
            {actions.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-600">No action needed{status === "ALTERNATIVE_PROPOSED" ? " until the traveller replies." : "."}</p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {has("accept") && (
                  <button type="button" disabled={busy} className={btn.primary} onClick={() => run("accept", undefined, "Accepted — payment link created", (d) => setPaymentUrl((d as AcceptResult).paymentUrl))}>
                    Accept & request payment
                  </button>
                )}
                {has("confirm") && <button type="button" disabled={busy} className={btn.primary} onClick={() => run("confirm", undefined, "Booking confirmed")}>Confirm booking</button>}
                {has("assign-guide") && <button type="button" disabled={busy} className={btn.ghost} onClick={() => { setGuideRef(booking.assignedGuideId ?? ""); setDialog("assign"); }}>{booking.assignedGuideId ? "Change guide" : "Assign guide"}</button>}
                {has("check-in") && <button type="button" disabled={busy} className={btn.primary} onClick={() => run("check-in", undefined, "Trek started")}>Check in (start trek)</button>}
                {has("check-out") && <button type="button" disabled={busy} className={btn.primary} onClick={() => run("check-out", undefined, "Trek completed")}>Check out (complete)</button>}
                {has("propose-date") && <button type="button" disabled={busy} className={btn.ghost} onClick={() => setDialog("propose")}>Propose another date</button>}
                {has("reject") && <button type="button" disabled={busy} className={btn.ghost} onClick={() => setDialog("reject")}>Reject inquiry</button>}
                {has("cancel") && <button type="button" disabled={busy} className={btn.danger} onClick={() => setDialog("cancel")}>Cancel booking</button>}
              </div>
            )}
          </section>
        </div>
      </div>

      <Modal isOpen={dialog === "reject"} onClose={() => setDialog(null)} title="Reject this inquiry" size="sm">
        <div className="space-y-3 p-4">
          <p className="text-sm text-neutral-600">The traveller is told why. A reason is required.</p>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} aria-label="Reason" className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-500" />
          <div className="flex justify-end gap-2">
            <button type="button" className={btn.ghost} onClick={() => setDialog(null)}>Keep</button>
            <button type="button" disabled={busy || !reason.trim()} className={btn.danger} onClick={() => run("reject", { reason: reason.trim() }, "Inquiry rejected")}>Reject</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={dialog === "cancel"} onClose={() => setDialog(null)} title="Cancel this booking" size="sm">
        <div className="space-y-3 p-4">
          <p className="text-sm text-neutral-600">This releases the traveller&apos;s seats. It can&apos;t be undone.</p>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason (optional)" aria-label="Reason" className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-500" />
          <div className="flex justify-end gap-2">
            <button type="button" className={btn.ghost} onClick={() => setDialog(null)}>Keep booking</button>
            <button type="button" disabled={busy} className={btn.danger} onClick={() => run("cancel", reason.trim() ? { reason: reason.trim() } : undefined, "Booking cancelled")}>Cancel booking</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={dialog === "propose"} onClose={() => setDialog(null)} title="Propose another date" size="sm">
        <div className="space-y-3 p-4">
          <p className="text-sm text-neutral-600">The traveller is asked to accept the new date.</p>
          <input type="date" value={proposedDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setProposedDate(e.target.value)} aria-label="Proposed date" className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-500" />
          <div className="flex justify-end gap-2">
            <button type="button" className={btn.ghost} onClick={() => setDialog(null)}>Close</button>
            <button type="button" disabled={busy || !proposedDate} className={btn.primary} onClick={() => run("propose-date", { proposedDate }, "New date proposed")}>Send proposal</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={dialog === "stage" && targetStep !== null} onClose={() => setDialog(null)} title={`Move to “${targetStep?.label ?? ""}”?`} size="sm">
        {targetStep && (
          <div className="space-y-3 p-4">
            <p className="text-sm text-neutral-700">This changes the booking from <strong>{STEPS.find((x) => x.status === status)?.label}</strong> to <strong>{targetStep.label}</strong>.</p>
            <ul className="list-disc space-y-1 pl-5 text-xs text-neutral-600">
              {status === "INQUIRY" && <li>The seats are reserved for this group (it fails if the trek doesn&apos;t have room).</li>}
              {targetStep.status === "INQUIRY" && <li>The seats are released and the payment link is removed.</li>}
              {targetStep.status === "PAYMENT_PENDING" && <li>{status === "INQUIRY" ? "A payment link is created and the traveller is emailed." : "A fresh 48-hour payment link is created."}</li>}
              {["PAID", "CONFIRMED", "ACTIVE", "COMPLETED"].includes(targetStep.status) && <li>Any open payment link is marked as paid.</li>}
              {targetStep.status === "ACTIVE" && <li>A guide must already be assigned.</li>}
              <li>The traveller gets a notification in the app.</li>
            </ul>
            <div className="flex justify-end gap-2">
              <button type="button" className={btn.ghost} onClick={() => setDialog(null)}>Cancel</button>
              <button type="button" disabled={busy} className={btn.primary} onClick={() => run("set-stage", { stage: targetStep.status }, `Moved to “${targetStep.label}”`, (d) => { const url = (d as { paymentUrl?: string } | null)?.paymentUrl; if (url) setPaymentUrl(url); })}>{busy ? "Moving…" : `Move to ${targetStep.label}`}</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={dialog === "assign"} onClose={() => setDialog(null)} title="Assign a guide" size="sm">
        <div className="space-y-3 p-4">
          {(trekGuides.data ?? []).length === 0 && !trekGuides.isLoading ? (
            <p className="text-sm text-neutral-600">
              No guides yet. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/guides/new">Add a guide</Link> first.
            </p>
          ) : (
            <>
              <select value={guideRef} onChange={(e) => setGuideRef(e.target.value)} aria-label="Guide" className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-500">
                <option value="">{trekGuides.isLoading ? "Loading guides…" : "Select a guide…"}</option>
                {(trekGuides.data ?? []).map((g) => (
                  <option key={g.guideRef} value={g.guideRef} disabled={!g.assignable}>
                    {g.name}{g.assignable ? (g.status === "on_trek" ? " — already on this trek" : "") : g.status === "unavailable" ? " — unavailable" : " — busy on another trek"}
                  </option>
                ))}
              </select>
              {(trekGuides.data ?? []).some((g) => !g.assignable) && (
                <p className="text-xs text-neutral-500">Guides on a different trek (or marked unavailable) can&apos;t be chosen until they&apos;re free. To free one, open <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/guides">Guides</Link> → Edit → set them to Available.</p>
              )}
            </>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" className={btn.ghost} onClick={() => setDialog(null)}>Close</button>
            <button type="button" disabled={busy || !guideRef} className={btn.primary} onClick={() => run("assign-guide", { guideRef }, "Guide assigned")}>Assign</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
