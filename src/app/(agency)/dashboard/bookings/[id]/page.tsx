"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";

import bookingsData from "../../../../../../data/bookings.json";
import guidesData from "../../../../../../data/guides.json";
import packagesData from "../../../../../../data/packages.json";
import usersData from "../../../../../../data/users.json";
import reviewsData from "../../../../../../data/reviews.json";

type AddOn = {
  name: string;
  price: number;
};

type Booking = {
  id: string;
  package_id: string;
  trekker_id: string;
  agency_id: string;
  guide_id?: string | null;
  departure_date: string;
  group_size: number;
  add_ons: AddOn[];
  services?: string[];
  payment_due_date?: string;
  total_price: number;
  status: string;
  created_at: string;
  proposed_date?: string;
  reject_reason?: string;
  payment_received_at?: string;
  check_in_at?: string;
  check_out_at?: string;
};

type Guide = {
  id: string;
  name: string;
  status: string;
  rating: number;
};

type Package = {
  id: string;
  title?: string;
  name?: string;
  destination?: string;
};

type User = {
  id: string;
  name: string;
  email?: string;
};

type Review = {
  id: string;
  booking_id?: string;
  package_id: string;
  agency_id: string;
  trekker_name: string;
  rating: number;
  title: string;
  text: string;
  guide_rating: number;
  created_at: string;
};

const statusSteps = ["inquiry", "payment", "confirmed", "active", "completed"];
const stepperSteps = [...statusSteps, "review"];

function BookingStatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();

  const variants: Record<string, string> = {
    inquiry: "border border-amber-200 bg-amber-50 text-amber-700",
    payment: "border border-primary-200 bg-primary-50 text-primary-700",
    confirmed: "border border-success-200 bg-success-50 text-success-700",
    active: "border border-success-600 bg-success-600 text-white",
    completed: "border border-success-700 bg-success-700 text-white",
    cancelled: "border border-danger-200 bg-danger-50 text-danger-700",
    rejected: "border border-danger-500 bg-danger-500 text-white",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
        variants[normalizedStatus] ??
        "border border-neutral-200 bg-neutral-100 text-neutral-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function BookingDetailPage() {
  const params = useParams();

  const id = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(() => {
    try {
      const stored =
        typeof window !== "undefined" ? localStorage.getItem("bookings") : null;
      const allBookings: Booking[] = stored
        ? (JSON.parse(stored) as Booking[])
        : (bookingsData as Booking[]);
      return allBookings.find((item) => item.id === id) ?? null;
    } catch (e) {
      return null;
    }
  });
  // booking is initialized lazily from localStorage (client-only) above,
  // so no synchronous setState is required here.
  const [showReject, setShowReject] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [alternativeDate, setAlternativeDate] = useState("");
  const [newService, setNewService] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>(
    booking?.total_price?.toString() ?? "",
  );
  const [paymentDueDate, setPaymentDueDate] = useState<string>(
    booking?.payment_due_date ?? "",
  );
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showAssignGuideModal, setShowAssignGuideModal] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [svcTransport, setSvcTransport] = useState(false);
  const [svcLodging, setSvcLodging] = useState(false);
  const [svcMeals, setSvcMeals] = useState(false);
  const [otherServicesText, setOtherServicesText] = useState("");
  const [reviewRating, setReviewRating] = useState<number>(() => {
    try {
      if (!booking || booking.status.toLowerCase() !== "completed") return 0;
      const storedReviews =
        typeof window !== "undefined" ? localStorage.getItem("reviews") : null;
      const reviews: Review[] = storedReviews
        ? (JSON.parse(storedReviews) as Review[])
        : (reviewsData as Review[]);
      const existingReview = reviews.find((review) => review.booking_id === id);
      return existingReview ? existingReview.rating : 0;
    } catch {
      return 0;
    }
  });
  const [reviewTitle, setReviewTitle] = useState<string>(() => {
    try {
      if (!booking || booking.status.toLowerCase() !== "completed") return "";
      const storedReviews =
        typeof window !== "undefined" ? localStorage.getItem("reviews") : null;
      const reviews: Review[] = storedReviews
        ? (JSON.parse(storedReviews) as Review[])
        : (reviewsData as Review[]);
      const existingReview = reviews.find((review) => review.booking_id === id);
      return existingReview ? existingReview.title : "";
    } catch {
      return "";
    }
  });
  const [reviewText, setReviewText] = useState<string>(() => {
    try {
      if (!booking || booking.status.toLowerCase() !== "completed") return "";
      const storedReviews =
        typeof window !== "undefined" ? localStorage.getItem("reviews") : null;
      const reviews: Review[] = storedReviews
        ? (JSON.parse(storedReviews) as Review[])
        : (reviewsData as Review[]);
      const existingReview = reviews.find((review) => review.booking_id === id);
      return existingReview ? existingReview.text : "";
    } catch {
      return "";
    }
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasReview, setHasReview] = useState<boolean>(() => {
    try {
      if (!booking || booking.status.toLowerCase() !== "completed")
        return false;
      const storedReviews =
        typeof window !== "undefined" ? localStorage.getItem("reviews") : null;
      const reviews: Review[] = storedReviews
        ? (JSON.parse(storedReviews) as Review[])
        : (reviewsData as Review[]);
      return !!reviews.find((review) => review.booking_id === id);
    } catch {
      return false;
    }
  });

  // Undo toast state for accidental Cancel
  const [showUndoToast, setShowUndoToast] = useState<boolean>(() => {
    try {
      const snapshotRaw =
        typeof window !== "undefined"
          ? localStorage.getItem(`booking_undo_snapshot_${id}`)
          : null;
      return !!snapshotRaw;
    } catch {
      return false;
    }
  });
  const [undoAction, setUndoAction] = useState<"assign" | "services" | null>(
    () => {
      try {
        const snapshotRaw =
          typeof window !== "undefined"
            ? localStorage.getItem(`booking_undo_snapshot_${id}`)
            : null;
        const snap = snapshotRaw ? JSON.parse(snapshotRaw) : null;
        return snap?.action ?? null;
      } catch {
        return null;
      }
    },
  );
  const [undoData, setUndoData] = useState<unknown>(() => {
    try {
      const snapshotRaw =
        typeof window !== "undefined"
          ? localStorage.getItem(`booking_undo_snapshot_${id}`)
          : null;
      const snap = snapshotRaw ? JSON.parse(snapshotRaw) : null;
      return snap?.data ?? null;
    } catch {
      return null;
    }
  });
  const undoTimerRef = useRef<number | null>(null);
  const router = useRouter();
  const [confirmAction, setConfirmAction] = useState<
    "back" | "payment" | "restore" | "cancel" | null
  >(null);

  const updateBooking = (data: Partial<Booking>) => {
    const stored = localStorage.getItem("bookings");

    const allBookings: Booking[] = stored ? JSON.parse(stored) : bookingsData;

    // Prevent reverting status once booking has reached 'active' or later
    const currentIndex = Math.max(
      statusSteps.findIndex((s) => s === booking?.status?.toLowerCase()),
      0,
    );
    const newIndex = data.status
      ? Math.max(
          statusSteps.findIndex((s) => s === data.status?.toLowerCase()),
          0,
        )
      : currentIndex;

    const sanitizedData = { ...data } as Partial<Booking>;
    const isCancellation =
      data.status === "cancelled" || data.status === "rejected";
    if (
      booking &&
      !isCancellation &&
      currentIndex >= statusSteps.findIndex((s) => s === "active") &&
      newIndex < currentIndex
    ) {
      // Disallow lowering status after active
      delete (sanitizedData as Partial<Booking>).status;
    }

    const updated = allBookings.map((item) =>
      item.id === id
        ? {
            ...item,
            ...sanitizedData,
          }
        : item,
    );

    localStorage.setItem("bookings", JSON.stringify(updated));

    setBooking((previous) =>
      previous
        ? {
            ...previous,
            ...sanitizedData,
          }
        : null,
    );
  };

  // trigger undo toast with data snapshot
  function triggerUndo(action: "assign" | "services", data: unknown) {
    setUndoAction(action);
    setUndoData(data);
    setShowUndoToast(true);

    // persist snapshot for this booking (no expiry) until user dismisses or uses Undo
    try {
      const snap = { action, data };
      localStorage.setItem(`booking_undo_snapshot_${id}`, JSON.stringify(snap));
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    };
  }, []);

  // load any existing snapshot for this booking (no expiry)
  // Snapshot for undo is read during initial render (lazy initializers above).

  if (!booking) {
    return (
      <div className="p-6 text-sm text-neutral-500">
        Loading booking details...
      </div>
    );
  }

  const packageDetails = (packagesData as Package[]).find(
    (item) => item.id === booking.package_id,
  );

  const trekker = (usersData as User[]).find(
    (item) => item.id === booking.trekker_id,
  );

  const assignedGuide = (guidesData as Guide[]).find(
    (item) => item.id === booking.guide_id,
  );

  const availableGuides = (guidesData as Guide[]).filter(
    (guide) => guide.status === "available",
  );

  const currentStepIndex = Math.max(
    booking.status.toLowerCase() === "completed" && hasReview
      ? stepperSteps.length - 1
      : stepperSteps.findIndex((step) => step === booking.status.toLowerCase()),
    0,
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:p-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex min-h-11 items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
              onClick={() => router.push("/dashboard/bookings")}
            >
              ← Back to bookings
            </button>
            <span className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-700">
              Booking overview
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-neutral-900 sm:text-2xl">
              Booking details
            </h1>
            <p className="text-sm text-neutral-600">
              Review traveler, package, schedule, and next actions for this
              request.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <BookingStatusBadge status={booking.status} />
          <p className="text-sm text-neutral-500">Booking ID: {booking.id}</p>
        </div>
      </div>

      {/* Stepper: shows booking progress steps */}
      <div className="my-3">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
          <div className="flex w-full items-center gap-0.5 sm:gap-3">
            {stepperSteps.map((step, idx) => {
              const active = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step}
                  className="flex min-w-0 flex-1 items-center gap-1 sm:gap-3"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold sm:h-9 sm:w-9 ${
                      isCurrent
                        ? "bg-primary-900 text-white"
                        : active
                          ? "bg-primary-200 text-primary-900"
                          : "bg-neutral-50 text-neutral-500"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div
                    className={`hidden sm:block text-sm font-medium ${isCurrent ? "text-neutral-900" : "text-neutral-600"} capitalize`}
                  >
                    {step}
                  </div>
                  {idx < stepperSteps.length - 1 && (
                    <div
                      className={`h-1 min-w-1 flex-1 ${idx < currentStepIndex ? "bg-primary-900" : "bg-neutral-200"}`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                Booking summary
              </p>
              <h2 className="text-base font-semibold text-neutral-900">
                {packageDetails?.title ?? packageDetails?.name ?? "Package"}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <BookingStatusBadge status={booking.status} />
              <span className="text-sm text-neutral-500">
                Rs. {booking.total_price.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {/* Quick actions */}
            <button
              className="min-h-11 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 sm:w-auto"
              onClick={() => {
                // prefill modal with existing services
                setSvcTransport((booking.services ?? []).includes("transport"));
                setSvcLodging((booking.services ?? []).includes("lodging"));
                setSvcMeals((booking.services ?? []).includes("meals"));
                setOtherServicesText(
                  (booking.services ?? [])
                    .filter(
                      (s) => !["transport", "lodging", "meals"].includes(s),
                    )
                    .join(", "),
                );
                setShowServicesModal(true);
              }}
            >
              Services
            </button>
            {booking.status.toLowerCase() === "completed" && (
              <button
                type="button"
                className="min-h-11 w-full rounded-2xl bg-primary-900 px-3 py-2 text-sm font-semibold text-white sm:w-auto"
                onClick={() => setShowReviewModal(true)}
              >
                Review & rating
              </button>
            )}
            {booking.status.toLowerCase() === "inquiry" && (
              <>
                <button
                  className="min-h-11 w-full rounded-2xl bg-primary-900 px-3 py-2 text-sm font-semibold text-white sm:w-auto"
                  onClick={() => setShowPaymentModal(true)}
                >
                  Request payment
                </button>
                <button
                  className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900"
                  onClick={() => {
                    updateBooking({
                      status: "rejected",
                      reject_reason: "Rejected by agency",
                    });
                  }}
                >
                  Reject
                </button>
              </>
            )}

            {booking.status.toLowerCase() === "payment" && (
              <>
                <button
                  className="min-h-11 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 sm:w-auto"
                  onClick={() => setConfirmAction("payment")}
                >
                  Mark payment received
                </button>
                <button
                  className="min-h-11 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 sm:w-auto"
                  onClick={() => setShowPaymentModal(true)}
                >
                  Edit payment request
                </button>
              </>
            )}

            {(booking.status.toLowerCase() === "cancelled" ||
              booking.status.toLowerCase() === "rejected") && (
              <button
                className="rounded-2xl bg-primary-900 px-3 py-2 text-sm font-semibold text-white"
                onClick={() => setConfirmAction("restore")}
              >
                Restore & confirm
              </button>
            )}

            {booking.status.toLowerCase() === "confirmed" && (
              <>
                <button
                  className="rounded-2xl bg-success-600 px-3 py-2 text-sm font-semibold text-white"
                  onClick={() => {
                    // if no guide assigned, open assign modal, otherwise start trek
                    if (!booking.guide_id) {
                      setSelectedGuideId(null);
                      setSvcTransport(false);
                      setSvcLodging(false);
                      setSvcMeals(false);
                      setShowAssignGuideModal(true);
                    } else {
                      updateBooking({
                        status: "active",
                        check_in_at: new Date().toISOString(),
                      });
                    }
                  }}
                >
                  Check in / Start trek
                </button>
                <button
                  className="rounded-2xl border border-danger-200 bg-danger-50 px-3 py-2 text-sm font-semibold text-danger-700"
                  onClick={() => setConfirmAction("cancel")}
                >
                  Cancel booking
                </button>
              </>
            )}

            {booking.status.toLowerCase() === "active" && (
              <>
                <button
                  className="rounded-2xl bg-success-700 px-3 py-2 text-sm font-semibold text-white"
                  onClick={() =>
                    updateBooking({
                      status: "completed",
                      check_out_at: new Date().toISOString(),
                    })
                  }
                >
                  Check out / Complete
                </button>
                <button
                  className="rounded-2xl border border-danger-200 bg-danger-50 px-3 py-2 text-sm font-semibold text-danger-700"
                  onClick={() => setConfirmAction("cancel")}
                >
                  Cancel booking
                </button>
              </>
            )}
          </div>
        </div>

        <div className="divide-y divide-neutral-200">
          <section className="px-4 py-3">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                Traveler & trip details
              </p>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                    Trekker
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">
                    {trekker?.name ?? booking.trekker_id}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">
                    {trekker?.email ?? "No email available"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                    Departure
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">
                    {booking.departure_date}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                    Package details
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">
                    {packageDetails?.title ??
                      packageDetails?.name ??
                      booking.package_id}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">
                    Destination: {packageDetails?.destination ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                    Group size
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">
                    {booking.group_size} travelers
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                    Guide
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">
                    {assignedGuide ? (
                      <Link
                        href={`/dashboard/guides/${assignedGuide.id}`}
                        className="text-primary-900 hover:underline"
                      >
                        {assignedGuide.name}
                      </Link>
                    ) : (
                      <span className="text-neutral-500">Not assigned</span>
                    )}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                    Created on
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">
                    {booking.created_at}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Status timeline removed per request */}

          {booking.add_ons.length > 0 && (
            <section className="px-4 py-3">
              <h3 className="text-sm font-semibold text-neutral-900">
                Add-ons
              </h3>
              <div className="mt-3 space-y-2">
                {booking.add_ons.map((addon) => (
                  <div
                    key={addon.name}
                    className="flex flex-col gap-1 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-sm text-neutral-700">
                      {addon.name}
                    </span>
                    <span className="text-sm font-medium text-neutral-900">
                      Rs. {addon.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
                {/* static add-on example as requested */}
                <div className="flex flex-col gap-1 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-neutral-700">Hot Shower</span>
                  <span className="text-sm font-medium text-neutral-900">
                    Rs. 20
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Undo toast for accidental cancels */}
          {showUndoToast && (
            <div className="fixed inset-x-4 bottom-4 z-50 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow sm:inset-x-auto sm:bottom-6 sm:right-6 sm:flex-row sm:items-center">
              <div className="text-sm text-neutral-800">
                Closed — changes not saved.
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  className="rounded-2xl bg-primary-900 px-3 py-1.5 text-sm font-semibold text-white"
                  onClick={() => {
                    // Revert booking to inquiry state and navigate back to bookings list
                    updateBooking({
                      status: "inquiry",
                      payment_due_date: undefined,
                      payment_received_at: undefined,
                      guide_id: null,
                      check_in_at: undefined,
                      check_out_at: undefined,
                    });
                    try {
                      localStorage.removeItem(`booking_undo_snapshot_${id}`);
                    } catch {}
                    setShowUndoToast(false);
                    setUndoAction(null);
                    setUndoData(null);
                    router.push("/dashboard/bookings");
                  }}
                >
                  Undo (revert to inquiry)
                </button>
                <button
                  className="rounded-2xl border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-900"
                  onClick={() => {
                    try {
                      localStorage.removeItem(`booking_undo_snapshot_${id}`);
                    } catch {}
                    setShowUndoToast(false);
                    setUndoAction(null);
                    setUndoData(null);
                    if (undoTimerRef.current) {
                      window.clearTimeout(undoTimerRef.current);
                      undoTimerRef.current = null;
                    }
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <section className="px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
              Payment summary
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">
                  Status
                </p>
                <p className="mt-2 text-sm font-semibold text-neutral-900">
                  {booking.status}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">
                  Amount
                </p>
                <p className="mt-2 text-sm font-semibold text-neutral-900">
                  {booking.status.toLowerCase() === "inquiry"
                    ? "-"
                    : `Rs. ${booking.total_price.toLocaleString("en-IN")}`}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">
                  Due date
                </p>
                <p className="mt-2 text-sm font-semibold text-neutral-900">
                  {booking.payment_due_date ?? "Not set"}
                </p>
              </div>
            </div>
          </section>

          {booking.status.toLowerCase() === "completed" && showReviewModal && (
            <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
              <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                        Review & rating
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-neutral-900">
                        Record trekker feedback
                      </h3>
                    </div>
                    <button
                      type="button"
                      className="min-h-11 min-w-11 rounded-full border border-neutral-200 px-3 py-1 text-sm font-semibold text-neutral-700"
                      onClick={() => setShowReviewModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-neutral-900">Rating</p>
                  <div
                    className="mt-2 flex items-center gap-1"
                    aria-label="Select rating"
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        aria-label={`${star} star${star === 1 ? "" : "s"}`}
                        className={`min-h-11 min-w-11 text-2xl leading-none ${star <= reviewRating ? "text-amber-500" : "text-neutral-300"}`}
                        onClick={() => setReviewRating(star)}
                      >
                        {star <= reviewRating ? "★" : "☆"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(event) => setReviewTitle(event.target.value)}
                    placeholder="Review title"
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                  />
                  <textarea
                    value={reviewText}
                    onChange={(event) => setReviewText(event.target.value)}
                    placeholder="Write the trekker's review"
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                  />
                </div>

                <button
                  type="button"
                  disabled={!reviewRating || !reviewText.trim()}
                  className="mt-3 rounded-2xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => {
                    const storedReviews = localStorage.getItem("reviews");
                    const reviews: Review[] = storedReviews
                      ? (JSON.parse(storedReviews) as Review[])
                      : (reviewsData as Review[]);
                    const trekkerName = trekker?.name ?? booking.trekker_id;
                    const nextReview: Review = {
                      id: `rv-${booking.id}`,
                      booking_id: booking.id,
                      package_id: booking.package_id,
                      agency_id: booking.agency_id,
                      trekker_name: trekkerName,
                      rating: reviewRating,
                      title: reviewTitle.trim() || "Trek review",
                      text: reviewText.trim(),
                      guide_rating: reviewRating,
                      created_at: new Date().toISOString(),
                    };
                    const nextReviews = [
                      ...reviews.filter(
                        (review) => review.booking_id !== booking.id,
                      ),
                      nextReview,
                    ];
                    localStorage.setItem(
                      "reviews",
                      JSON.stringify(nextReviews),
                    );
                    setHasReview(true);
                    setShowReviewModal(false);
                  }}
                >
                  Save review
                </button>
              </div>
            </section>
          )}

          {/* Booking services removed per request; Add-ons remain above */}

          {booking.status.toLowerCase() === "confirmed" && (
            <section className="px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                Manage services
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  placeholder="Add service (transport, lodging, meals...)"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none"
                />
                <button
                  className="min-h-11 w-full rounded-2xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white sm:w-auto"
                  onClick={() => {
                    if (!newService.trim()) return;
                    updateBooking({
                      services: [
                        ...(booking.services ?? []),
                        newService.trim(),
                      ],
                    });
                    setNewService("");
                  }}
                >
                  Add
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(booking.services ?? []).map((s, idx) => (
                  <span
                    key={`${s}-${idx}`}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm font-semibold text-neutral-700"
                  >
                    {s}
                  </span>
                ))}
                {!(booking.services ?? []).length && (
                  <span className="text-sm text-neutral-500">
                    No services added yet.
                  </span>
                )}
              </div>
            </section>
          )}

          <section className="px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
              Guide
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">
              {assignedGuide ? (
                <Link
                  href={`/dashboard/guides/${assignedGuide.id}`}
                  className="text-primary-900 hover:underline"
                >
                  {assignedGuide.name}
                </Link>
              ) : (
                <span className="text-neutral-500">
                  Not assigned (assigned at start)
                </span>
              )}
            </p>
          </section>

          {showReject && (
            <section className="px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                Reject reason
              </p>
              <textarea
                className="mt-3 min-h-24 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Add a short reason for rejecting this booking"
              />

              <button
                className="mt-3 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                onClick={() => {
                  updateBooking({
                    status: "cancelled",
                    reject_reason: rejectReason,
                  });
                  setShowReject(false);
                }}
              >
                Save rejection
              </button>
            </section>
          )}

          {confirmAction && (
            <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6">
              <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl sm:p-6">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Are you sure?
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  {confirmAction === "back"
                    ? "Go back to the bookings list? Any unsaved changes will be lost."
                    : confirmAction === "payment"
                      ? "Mark this booking's payment as received and confirm the booking?"
                      : confirmAction === "restore"
                        ? "Restore this cancelled booking and confirm it because payment has been received?"
                        : "Cancel this confirmed booking at the customer's request? Payment details will be preserved."}
                </p>
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="min-h-11 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900"
                    onClick={() => setConfirmAction(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="min-h-11 rounded-2xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white"
                    onClick={() => {
                      if (confirmAction === "back") {
                        setConfirmAction(null);
                        router.push("/dashboard/bookings");
                        return;
                      }

                      if (confirmAction === "restore") {
                        updateBooking({
                          status: "confirmed",
                          payment_received_at:
                            booking.payment_received_at ??
                            new Date().toISOString(),
                          reject_reason: undefined,
                        });
                        setConfirmAction(null);
                        return;
                      }

                      if (confirmAction === "cancel") {
                        updateBooking({
                          status: "cancelled",
                          reject_reason: "Cancelled by customer",
                        });
                        setConfirmAction(null);
                        return;
                      }

                      updateBooking({
                        status: "confirmed",
                        payment_received_at: new Date().toISOString(),
                      });
                      setConfirmAction(null);
                    }}
                  >
                    Yes, continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment modal (simple inline modal) */}
          {showPaymentModal && (
            <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6">
              <div className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Request payment
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Send a payment request to the trekker.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-600">
                      Amount (Rs.)
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-neutral-600">
                      Due date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                      value={paymentDueDate}
                      onChange={(e) => setPaymentDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    className="min-h-11 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="min-h-11 w-full rounded-2xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white sm:w-auto"
                    onClick={() => {
                      const amt = Number(paymentAmount) || booking.total_price;
                      updateBooking({
                        status: "payment",
                        payment_due_date: paymentDueDate || undefined,
                        total_price: amt,
                      });
                      setShowPaymentModal(false);
                    }}
                  >
                    Send request
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDate && (
            <section className="px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                Alternative date
              </p>
              <input
                type="date"
                className="mt-3 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                value={alternativeDate}
                onChange={(e) => setAlternativeDate(e.target.value)}
              />

              <button
                className="mt-3 rounded-2xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
                onClick={() => {
                  updateBooking({ proposed_date: alternativeDate });
                  setShowDate(false);
                }}
              >
                Save date
              </button>
            </section>
          )}

          {/* Services modal */}
          {showServicesModal && (
            <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6">
              <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Services
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Select additional services for this booking.
                </p>

                <div className="mt-4 space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={svcTransport}
                      onChange={(e) => setSvcTransport(e.target.checked)}
                    />
                    <span className="text-sm">Transport</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={svcLodging}
                      onChange={(e) => setSvcLodging(e.target.checked)}
                    />
                    <span className="text-sm">Lodging</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={svcMeals}
                      onChange={(e) => setSvcMeals(e.target.checked)}
                    />
                    <span className="text-sm">Meals</span>
                  </label>
                  <div>
                    <label className="mb-1 block text-sm text-neutral-600">
                      Other (comma separated)
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none"
                      placeholder="e.g. porter, permits"
                      value={otherServicesText}
                      onChange={(e) => setOtherServicesText(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    className="min-h-11 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900"
                    onClick={() => {
                      // save current modal state for undo and close
                      triggerUndo("services", {
                        svcTransport,
                        svcLodging,
                        svcMeals,
                        otherServicesText,
                      });
                      setShowServicesModal(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="min-h-11 w-full rounded-2xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white sm:w-auto"
                    onClick={() => {
                      const other = otherServicesText || "";
                      const otherList = other
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const services = [
                        ...(svcTransport ? ["transport"] : []),
                        ...(svcLodging ? ["lodging"] : []),
                        ...(svcMeals ? ["meals"] : []),
                        ...otherList,
                      ];
                      updateBooking({ services });
                      try {
                        localStorage.removeItem(`booking_undo_snapshot_${id}`);
                      } catch (e) {}
                      setShowServicesModal(false);
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Assign guide modal (asks guide + services) */}
          {showAssignGuideModal && (
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6">
              <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Assign guide & confirm start
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Please assign a guide and confirm required services before
                  starting the trek.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-sm text-neutral-900">
                      Select Guide
                    </label>
                    <select
                      className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900"
                      value={selectedGuideId ?? ""}
                      onChange={(e) =>
                        setSelectedGuideId(e.target.value || null)
                      }
                    >
                      <option value="">Select guide</option>
                      {availableGuides.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} · {g.rating}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-900">Confirm services</p>
                    <label className="mt-2 flex items-center gap-2 text-neutral-900">
                      <input
                        className="accent-primary-900"
                        type="checkbox"
                        checked={svcTransport}
                        onChange={(e) => setSvcTransport(e.target.checked)}
                      />{" "}
                      <span className="text-sm">Transport</span>
                    </label>
                    <label className="mt-1 flex items-center gap-2 text-neutral-900">
                      <input
                        className="accent-primary-900"
                        type="checkbox"
                        checked={svcLodging}
                        onChange={(e) => setSvcLodging(e.target.checked)}
                      />{" "}
                      <span className="text-sm">Lodging</span>
                    </label>
                    <label className="mt-1 flex items-center gap-2 text-neutral-900">
                      <input
                        className="accent-primary-900"
                        type="checkbox"
                        checked={svcMeals}
                        onChange={(e) => setSvcMeals(e.target.checked)}
                      />{" "}
                      <span className="text-sm">Meals</span>
                    </label>
                  </div>
                </div>

                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    className="min-h-11 rounded-2xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white"
                    onClick={() => {
                      // save current assign modal state for undo and close
                      triggerUndo("assign", {
                        selectedGuideId,
                        svcTransport,
                        svcLodging,
                        svcMeals,
                      });
                      setShowAssignGuideModal(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded-2xl bg-success-600 px-4 py-2 text-sm font-semibold text-white"
                    onClick={() => {
                      // apply guide and services then start trek
                      const services = [
                        ...(svcTransport ? ["transport"] : []),
                        ...(svcLodging ? ["lodging"] : []),
                        ...(svcMeals ? ["meals"] : []),
                        ...(booking.services ?? []).filter(
                          (s) => !["transport", "lodging", "meals"].includes(s),
                        ),
                      ];
                      updateBooking({
                        guide_id: selectedGuideId,
                        services,
                        status: "active",
                        check_in_at: new Date().toISOString(),
                      });
                      try {
                        localStorage.removeItem(`booking_undo_snapshot_${id}`);
                      } catch {}
                      setShowAssignGuideModal(false);
                    }}
                  >
                    Assign & Start
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
