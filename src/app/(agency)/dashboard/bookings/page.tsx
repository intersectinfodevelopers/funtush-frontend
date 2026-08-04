"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import bookingsData from "../../../../../data/bookings.json";
import usersData from "../../../../../data/users.json";
import packagesData from "../../../../../data/packages.json";
import guidesData from "../../../../../data/guides.json";
import { Download, Plus, ChevronRight } from "lucide-react";

type AddOn = {
  name: string;
  price: number;
};

type Booking = {
  id: string;
  package_id: string;
  trekker_id: string;
  agency_id: string;
  guide_id?: string;
  departure_date: string;
  group_size: number;
  add_ons: AddOn[];
  total_price: number;
  status: string;
  created_at: string;
};

type User = {
  id: string;
  name: string;
};

type Package = {
  id: string;
  title: string;
};

type Guide = {
  id: string;
  name: string;
};

const tabs = [
  "inquiry",
  "confirmed",
  "active",
  "completed",
  "cancelled",
] as const;

type Tab = (typeof tabs)[number];

function BookingStatusBadge({ status }: { status: string }) {
  let color = "bg-gray-500";

  switch (status.toLowerCase()) {
    case "inquiry":
      color = "bg-red-500";
      break;
    case "confirmed":
      color = "bg-green-600";
      break;
    case "payment":
      color = "bg-yellow-500";
      break;
    case "active":
      color = "bg-blue-600";
      break;
    case "completed":
      color = "bg-emerald-700";
      break;
    case "cancelled":
      color = "bg-gray-700";
      break;
    case "rejected":
      color = "bg-red-700";
      break;
  }

  return (
    <span
      className={`rounded px-2 py-1 text-xs font-medium text-white ${color}`}
    >
      {status}
    </span>
  );
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("inquiry");

  const [search, setSearch] = useState("");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [bookings] = useState<Booking[]>(() => {
    if (typeof window === "undefined") {
      return bookingsData as Booking[];
    }

    const stored = localStorage.getItem("bookings");

    return stored
      ? (JSON.parse(stored) as Booking[])
      : (bookingsData as Booking[]);
  });

  const inquiryCount = bookings.filter(
    (booking) => booking.status.toLowerCase() === "inquiry",
  ).length;
  const pendingCount = bookings.filter(
    (booking) => booking.status.toLowerCase() === "inquiry",
  ).length;

  const confirmedCount = bookings.filter(
    (booking) => booking.status.toLowerCase() === "confirmed",
  ).length;

  const activeCount = bookings.filter(
    (booking) => booking.status.toLowerCase() === "active",
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.status.toLowerCase() === "completed",
  ).length;

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (booking.status.toLowerCase() !== activeTab) {
        return false;
      }

      const trekker = (usersData as User[]).find(
        (user) => user.id === booking.trekker_id,
      );

      const trekkerName = trekker?.name.toLowerCase() ?? "";

      if (search && !trekkerName.includes(search.toLowerCase())) {
        return false;
      }

      if (fromDate && booking.departure_date < fromDate) {
        return false;
      }

      if (toDate && booking.departure_date > toDate) {
        return false;
      }

      return true;
    });
  }, [activeTab, bookings, fromDate, search, toDate]);

  return (
    <div className="p-6">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Approval</h1>

          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <span>Bookings</span>

            <ChevronRight className="h-4 w-4" />

            <span className="font-medium text-violet-600">All Bookings</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium shadow-sm transition hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Export CSV
          </button>

          <button className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-700">
            <Plus className="h-4 w-4" />
            Create
          </button>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
              📋
            </div>

            <p className="text-sm font-semibold uppercase text-gray-700">
              Pending
            </p>

            <h2 className="mt-2 text-4xl font-bold">{pendingCount}</h2>

            <p className="mt-5 text-sm text-violet-600">Awaiting response</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              ✅
            </div>

            <p className="text-sm font-semibold uppercase text-gray-700">
              Confirmed
            </p>

            <h2 className="mt-2 text-4xl font-bold">{confirmedCount}</h2>

            <p className="mt-5 text-sm text-orange-500">Confirmed bookings</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              🥾
            </div>

            <p className="text-sm font-semibold uppercase text-gray-700">
              Active Treks
            </p>

            <h2 className="mt-2 text-4xl font-bold">{activeCount}</h2>

            <p className="mt-5 text-sm text-green-600">On trail now</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
              🏆
            </div>

            <p className="text-sm font-semibold uppercase text-gray-700">
              Completed
            </p>

            <h2 className="mt-2 text-4xl font-bold">{completedCount}</h2>

            <p className="mt-5 text-sm text-pink-500">All time</p>
          </div>
        </div>

</div>

<div className="mb-6 flex flex-wrap gap-3">
  {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded px-4 py-2 capitalize ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {tab}

            {tab === "inquiry" && inquiryCount > 0 && (
              <span className="ml-2 rounded-full bg-red-600 px-2 text-xs text-white">
                {inquiryCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="text"
          placeholder="Search bookings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full lg:w-[360px] rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-sm outline-none focus:border-violet-500"
        />

        <div className="flex flex-col gap-4 sm:flex-row">
          <select className="w-full sm:w-[160px] rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-sm outline-none focus:border-violet-500">
            <option>Status</option>
            <option>Inquiry</option>
            <option>Confirmed</option>
            <option>Active</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>

          <select className="w-full sm:w-[160px] rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-sm outline-none focus:border-violet-500">
            <option>Sort By</option>
            <option>Departure Date</option>
            <option>Amount</option>
            <option>Group Size</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
  <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Trekker</th>

              <th className="border p-3 text-left">Package</th>

              <th className="border p-3 text-left">Departure</th>

              <th className="border p-3 text-center">Group</th>

              <th className="border p-3 text-right">Amount</th>

              <th className="border p-3 text-left">Guide</th>

              <th className="border p-3 text-center">Status</th>

              <th className="border p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="border p-5 text-center text-gray-500"
                >
                  No bookings found
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => {
                const trekker = (usersData as User[]).find(
                  (user) => user.id === booking.trekker_id,
                );

                const packageInfo = (packagesData as Package[]).find(
                  (pkg) => pkg.id === booking.package_id,
                );

                const guide = (guidesData as Guide[]).find(
                  (guide) => guide.id === booking.guide_id,
                );

                return (
                  <tr key={booking.id}>
                    <td className="border p-3">{trekker?.name ?? "Unknown"}</td>

                    <td className="border p-3">
                      {packageInfo?.title ?? "Unknown Package"}
                    </td>

                    <td className="border p-3">{booking.departure_date}</td>

                    <td className="border p-3 text-center">
                      {booking.group_size}
                    </td>

                    <td className="border p-3 text-right">
                      Rs. {booking.total_price}
                    </td>

                    <td className="border p-3">
                      {guide?.name ?? "Not Assigned"}
                    </td>

                    <td className="border p-3 text-center">
                      <BookingStatusBadge status={booking.status} />
                    </td>

                    <td className="border p-3 text-center">
                      <Link
                        href={`/dashboard/bookings/${booking.id}`}
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
