"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import bookingsData from "../../../../../../data/bookings.json";
import guidesData from "../../../../../../data/guides.json";
import packagesData from "../../../../../../data/packages.json";
import usersData from "../../../../../../data/users.json";

import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";

type AddOn = {
  name: string;
  price: number;
};

type Booking = {
  id: string;
  package_id: string;
  trekker_id: string;
  agency_id: string;
  guide_id: string;
  departure_date: string;
  group_size: number;
  add_ons: AddOn[];
  total_price: number;
  status: string;
  created_at: string;
  proposed_date?: string;
  reject_reason?: string;
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

const statusSteps = ["inquiry", "confirmed", "payment", "active", "completed"];

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [alternativeDate, setAlternativeDate] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bookings");

      const allBookings: Booking[] = stored
        ? (JSON.parse(stored) as Booking[])
        : (bookingsData as Booking[]);

      const found = allBookings.find((item) => item.id === id);

      const timeout = setTimeout(() => {
        setBooking(found ?? null);
      }, 0);

      return () => clearTimeout(timeout);
    }
  }, [id]);
  const updateBooking = (data: Partial<Booking>) => {
    const stored = localStorage.getItem("bookings");
    const allBookings: Booking[] = stored
      ? JSON.parse(stored)
      : (bookingsData as Booking[]);

    const updated = allBookings.map((item) =>
      item.id === id
        ? {
            ...item,
            ...data,
          }
        : item,
    );

    localStorage.setItem("bookings", JSON.stringify(updated));

    setBooking((previous) =>
      previous
        ? {
            ...previous,
            ...data,
          }
        : null,
    );
  };

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/30 p-8 text-gray-500">
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

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "inquiry":
      case "pending":
        return (
          <span className="inline-flex items-center rounded-full bg-[#FDE8DF] px-3.5 py-1 text-xs font-semibold text-[#D97757]">
            Pending
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-semibold text-emerald-600">
            Confirmed
          </span>
        );
      case "active":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3.5 py-1 text-xs font-semibold text-blue-600">
            Active
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center rounded-full bg-purple-100 px-3.5 py-1 text-xs font-semibold text-purple-600">
            Completed
          </span>
        );
      case "cancelled":
      case "rejected":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3.5 py-1 text-xs font-semibold text-red-600">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3.5 py-1 text-xs font-semibold text-gray-600">
            {status}
          </span>
        );
    }
  };

  const currentStepIndex = statusSteps.indexOf(booking.status.toLowerCase());

  return (
    <div className="min-h-screen bg-gray-50/30 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600"
          >
            <ArrowBackOutlined style={{ fontSize: 16 }} /> Back to bookings
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Booking #{booking.id.replace(/^bk-/, "K-").toUpperCase()}
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
            <Link href="/dashboard/bookings" className="hover:underline">
              Bookings
            </Link>
            <ChevronRightOutlined className="text-gray-300" fontSize="small" />
            <span className="font-medium text-indigo-600">Booking Details</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge(booking.status)}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols wide) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Trekker & Package Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Trekker Information */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Trekker Information
                  </h2>
                  <p className="text-xs text-gray-400">Customer information</p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7C5CFC] text-sm font-bold text-white">
                  {trekker?.name?.charAt(0) ?? "T"}
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <PersonOutlined fontSize="small" className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="font-semibold text-gray-900">
                      {trekker?.name ?? booking.trekker_id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <EmailOutlined fontSize="small" className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="font-medium text-gray-700">
                      {trekker?.email ?? "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-base font-bold text-gray-900">
                  Package Details
                </h2>
                <p className="text-xs text-gray-400">
                  Selected trekking package
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Package</p>
                  <p className="font-semibold text-gray-900">
                    {packageDetails?.title ??
                      packageDetails?.name ??
                      booking.package_id}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Destination</p>
                  <p className="font-medium text-gray-700">
                    {packageDetails?.destination ?? "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-base font-bold text-gray-900">
                Booking Information
              </h2>
              <p className="text-xs text-gray-400">Trip booking details</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <p className="text-xs text-gray-400">Departure Date</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {booking.departure_date}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Group Size</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {booking.group_size} People
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Total Price</p>
                <p className="mt-1 text-xl font-bold text-indigo-600">
                  ${booking.total_price.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Booking Status</p>
                <div className="mt-1">{getStatusBadge(booking.status)}</div>
              </div>
            </div>

            {booking.proposed_date && (
              <div className="mt-6 rounded-xl bg-blue-50/80 p-4 border border-blue-100">
                <p className="text-xs font-semibold text-blue-700">
                  Proposed Alternative Date: {booking.proposed_date}
                </p>
              </div>
            )}

            {booking.reject_reason && (
              <div className="mt-6 rounded-xl bg-red-50/80 p-4 border border-red-100">
                <p className="text-xs font-semibold text-red-700">
                  Rejection Reason: {booking.reject_reason}
                </p>
              </div>
            )}

            {/* Add-ons Section */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="mb-4 text-sm font-bold text-gray-900">
                Selected Add-ons
              </h3>

              <div className="space-y-2.5">
                {booking.add_ons && booking.add_ons.length > 0 ? (
                  booking.add_ons.map((addon, i) => (
                    <div
                      key={`${addon.name}-${i}`}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-gray-800">
                        {addon.name}
                      </span>
                      <span className="font-semibold text-indigo-600">
                        +${addon.price}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No add-ons selected.</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions Bar for Pending Inquiries */}
          {booking.status.toLowerCase() === "inquiry" && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <button
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                onClick={() =>
                  updateBooking({
                    status: "confirmed",
                  })
                }
              >
                Accept Booking
              </button>

              <button
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600"
                onClick={() => setShowReject(true)}
              >
                Reject
              </button>

              <button
                className="rounded-xl border border-indigo-200 bg-indigo-50/50 px-5 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
                onClick={() => setShowDate(true)}
              >
                Propose Alternative Date
              </button>
            </div>
          )}
        </div>

        {/* Right Column (1 Col wide) */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-base font-bold text-gray-900">
              Status Timeline
            </h2>

            <div className="space-y-4">
              {statusSteps.map((step, idx) => {
                const isPassed =
                  currentStepIndex !== -1 && idx <= currentStepIndex;
                const isCurrent =
                  booking.status.toLowerCase() === step.toLowerCase();

                return (
                  <div key={step} className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                        isPassed
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircleOutlined style={{ fontSize: 16 }} />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm capitalize ${
                          isCurrent
                            ? "font-bold text-indigo-600"
                            : isPassed
                              ? "font-semibold text-gray-800"
                              : "text-gray-400"
                        }`}
                      >
                        {step}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assign Guide Card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900">Assign Guide</h2>
            <p className="mt-1 text-xs text-gray-400">
              Currently:{" "}
              <span className="font-semibold text-gray-700">
                {assignedGuide?.name ?? "Not assigned"}
              </span>
            </p>

            <select
              className="mt-4 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium text-gray-700 focus:border-indigo-500 focus:bg-white focus:outline-none"
              value={booking.guide_id ?? ""}
              onChange={(e) =>
                updateBooking({
                  guide_id: e.target.value,
                })
              }
            >
              <option value="">Select Guide</option>
              {availableGuides.map((guide) => (
                <option key={guide.id} value={guide.id}>
                  {guide.name} ({guide.rating} ★)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reject Modal Overlay */}
      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              Rejection Reason
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              Please specify why this booking cannot be accepted.
            </p>

            <textarea
              className="mt-4 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm text-gray-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              rows={3}
              placeholder="Enter reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100"
                onClick={() => setShowReject(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                onClick={() => {
                  updateBooking({
                    status: "cancelled",
                    reject_reason: rejectReason,
                  });
                  setShowReject(false);
                }}
              >
                Save & Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Date Modal Overlay */}
      {showDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              Propose Alternative Date
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              Select a new date range to propose to the trekker.
            </p>

            <input
              type="date"
              className="mt-4 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm text-gray-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              value={alternativeDate}
              onChange={(e) => setAlternativeDate(e.target.value)}
            />

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100"
                onClick={() => setShowDate(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                onClick={() => {
                  updateBooking({
                    proposed_date: alternativeDate,
                  });
                  setShowDate(false);
                }}
              >
                Send Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
