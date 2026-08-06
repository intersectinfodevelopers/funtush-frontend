"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import bookingsData from "../../../../../../data/bookings.json";
import guidesData from "../../../../../../data/guides.json";
import packagesData from "../../../../../../data/packages.json";
import usersData from "../../../../../../data/users.json";

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

  const id = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = localStorage.getItem("bookings");

    const allBookings: Booking[] = stored
      ? (JSON.parse(stored) as Booking[])
      : (bookingsData as Booking[]);

    return allBookings.find((item) => item.id === id) ?? null;
  });

  const [showReject, setShowReject] = useState(false);

  const [showDate, setShowDate] = useState(false);

  const [rejectReason, setRejectReason] = useState("");

  const [alternativeDate, setAlternativeDate] = useState("");

  const updateBooking = (data: Partial<Booking>) => {
    const stored = localStorage.getItem("bookings");

    const allBookings: Booking[] = stored ? JSON.parse(stored) : bookingsData;

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
    return <div className="p-6">Loading...</div>;
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

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-900">Booking Details</h1>

        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <span>Bookings</span>
          <span>&gt;</span>
          <span className="font-medium text-violet-600">Booking Details</span>
        </div>
      </div>

      {/* Content */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trekker */}

        {/* Trekker Information */}

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                Trekker Information
              </h2>

              <p className="text-sm text-neutral-500">Customer information</p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-700">
              {trekker?.name?.charAt(0) ?? "T"}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-sm text-neutral-500">Name</p>

              <p className="font-semibold text-neutral-900">
                {trekker?.name ?? booking.trekker_id}
              </p>
            </div>

            <div>
              <p className="text-sm text-neutral-500">Email</p>

              <p className="font-medium text-neutral-700">
                {trekker?.email ?? "-"}
              </p>
            </div>
          </div>
        </section>

        {/* Package Details */}

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">
              Package Details
            </h2>

            <p className="text-sm text-neutral-500">
              Selected trekking package
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-sm text-neutral-500">Package</p>

              <p className="font-semibold text-neutral-900">
                {packageDetails?.title ??
                  packageDetails?.name ??
                  booking.package_id}
              </p>
            </div>

            <div>
              <p className="text-sm text-neutral-500">Destination</p>

              <p className="font-medium text-neutral-700">
                {packageDetails?.destination ?? "-"}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Booking Info */}

      {/* Booking Information */}

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">
            Booking Information
          </h2>

          <p className="text-sm text-neutral-500">Trip booking details</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-neutral-500">Departure Date</p>

            <p className="mt-1 font-semibold text-neutral-900">
              {booking.departure_date}
            </p>
          </div>

          <div>
            <p className="text-sm text-neutral-500">Group Size</p>

            <p className="mt-1 font-semibold text-neutral-900">
              {booking.group_size} People
            </p>
          </div>

          <div>
            <p className="text-sm text-neutral-500">Total Price</p>

            <p className="mt-1 text-2xl font-bold text-violet-600">
              ${booking.total_price}
            </p>
          </div>

          <div>
            <p className="text-sm text-neutral-500">Booking Status</p>

            <span
              className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                booking.status === "confirmed"
                  ? "bg-green-100 text-green-700"
                  : booking.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-orange-100 text-orange-700"
              }`}
            >
              {booking.status}
            </span>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">
            Add-ons
          </h3>

          <div className="space-y-3">
            {booking.add_ons.length > 0 ? (
              booking.add_ons.map((addon) => (
                <div
                  key={addon.name}
                  className="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3"
                >
                  <span className="font-medium text-neutral-800">
                    {addon.name}
                  </span>

                  <span className="font-semibold text-violet-600">
                    ${addon.price}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-neutral-500">No add-ons selected.</p>
            )}
          </div>
        </div>
      </section>

      {/* Timeline */}

      <section className="border rounded p-5">
        <h2 className="text-xl font-semibold">Status Timeline</h2>

        <div className="flex gap-3 flex-wrap mt-4">
          {statusSteps.map((step) => (
            <div
              key={step}
              className={`border px-3 py-2 rounded ${
                booking.status === step ? "bg-green-600 text-white" : ""
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}

      {booking.status === "inquiry" && (
        <div className="space-x-3">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() =>
              updateBooking({
                status: "confirmed",
              })
            }
          >
            Accept
          </button>

          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => setShowReject(true)}
          >
            Reject
          </button>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setShowDate(true)}
          >
            Propose Alternative Date
          </button>
        </div>
      )}

      {/* Assign Guide */}

      <section className="border rounded p-5">
        <h2 className="font-semibold">Assign Guide</h2>

        <p>Current: {assignedGuide?.name ?? "Not assigned"}</p>

        <select
          className="border p-2 mt-3"
          value={booking.guide_id}
          onChange={(e) =>
            updateBooking({
              guide_id: e.target.value,
            })
          }
        >
          <option value="">Select Guide</option>

          {availableGuides.map((guide) => (
            <option key={guide.id} value={guide.id}>
              {guide.name} {guide.rating}
            </option>
          ))}
        </select>
      </section>

      {/* Reject Modal */}

      {showReject && (
        <section className="border p-5">
          <h3>Reject Reason</h3>

          <input
            className="border p-2"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />

          <button
            className="bg-red-600 text-white px-3 py-2 ml-3"
            onClick={() => {
              updateBooking({
                status: "cancelled",

                reject_reason: rejectReason,
              });

              setShowReject(false);
            }}
          >
            Save
          </button>
        </section>
      )}

      {/* Date Modal */}

      {showDate && (
        <section className="border p-5">
          <h3>Alternative Date</h3>

          <input
            type="date"
            className="border p-2"
            value={alternativeDate}
            onChange={(e) => setAlternativeDate(e.target.value)}
          />

          <button
            className="bg-blue-600 text-white px-3 py-2 ml-3"
            onClick={() => {
              updateBooking({
                proposed_date: alternativeDate,
              });

              setShowDate(false);
            }}
          >
            Save
          </button>
        </section>
      )}
    </div>
  );
}
