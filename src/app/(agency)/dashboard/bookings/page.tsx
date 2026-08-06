"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import bookingsData from "../../../../../data/bookings.json";
import usersData from "../../../../../data/users.json";
import packagesData from "../../../../../data/packages.json";
import guidesData from "../../../../../data/guides.json";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";

import GroupAddOutlined from "@mui/icons-material/GroupAddOutlined";
import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutlineOutlined";
import HikingOutlined from "@mui/icons-material/HikingOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";

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
  let color = "bg-gray-100 text-gray-600";

  switch (status.toLowerCase()) {
    case "inquiry":
      color = "bg-violet-100 text-violet-600";
      break;

    case "confirmed":
      color = "bg-orange-100 text-orange-500";
      break;

    case "active":
      color = "bg-green-100 text-green-600";
      break;

    case "completed":
      color = "bg-pink-100 text-pink-500";
      break;

    case "cancelled":
      color = "bg-gray-100 text-gray-600";
      break;

    case "rejected":
      color = "bg-red-100 text-red-600";
      break;

    default:
      color = "bg-gray-100 text-gray-600";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${color}`}
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

            <ChevronRightOutlined fontSize="small" />

            <span className="font-medium text-violet-600">All Bookings</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium shadow-sm transition hover:bg-gray-50">
            <DownloadOutlined fontSize="small" />
            Export CSV
          </button>

          <button className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-700">
            <AddOutlined fontSize="small" />
            Create
          </button>
        </div>
      </div>
      <div className="mb-8 flex flex-wrap gap-3">
        <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
              <GroupAddOutlined className="text-violet-600" />
            </div>

            <p className="text-sm font-semibold uppercase text-gray-700">
              Pending
            </p>

            <h2 className="mt-2 text-4xl font-bold">{pendingCount}</h2>

            <p className="mt-5 text-sm text-violet-600">Awaiting response</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <CheckCircleOutlineOutlined className="text-orange-500" />
            </div>

            <p className="text-sm font-semibold uppercase text-gray-700">
              Confirmed
            </p>

            <h2 className="mt-2 text-4xl font-bold">{confirmedCount}</h2>

            <p className="mt-5 text-sm text-orange-500">Confirmed bookings</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <HikingOutlined className="text-green-600" />
            </div>

            <p className="text-sm font-semibold uppercase text-gray-700">
              Active Treks
            </p>

            <h2 className="mt-2 text-4xl font-bold">{activeCount}</h2>

            <p className="mt-5 text-sm text-green-600">On trail now</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-pink-100">
              <EmojiEventsOutlined className="text-pink-500" />
            </div>

            <p className="text-sm font-semibold uppercase text-gray-700">
              Completed
            </p>

            <h2 className="mt-3 text-[40px] font-bold leading-none text-gray-900">
              {completedCount}
            </h2>

            <p className="mt-5 text-sm text-pink-500">All time</p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-8 rounded-2xl bg-violet-50 px-6 py-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative pb-3 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? "text-violet-600"
                : "text-gray-500 hover:text-violet-600"
            }`}
          >
            <span>{tab}</span>

            <span className="ml-2 text-gray-500">
              {
                bookings.filter(
                  (booking) => booking.status.toLowerCase() === tab,
                ).length
              }
            </span>

            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-violet-600" />
            )}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-[360px]">
          <SearchOutlined
            fontSize="small"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-12 pr-5 text-sm text-gray-700 placeholder:text-gray-400 shadow-sm transition focus:border-violet-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <select className="w-full cursor-pointer rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm text-gray-700 shadow-sm transition focus:border-violet-500 focus:outline-none sm:w-[180px]">
            <option>Status</option>
            <option>Inquiry</option>
            <option>Confirmed</option>
            <option>Active</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>

          <select className="w-full cursor-pointer rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm text-gray-700 shadow-sm transition focus:border-violet-500 focus:outline-none sm:w-[180px]">
            <option>Sort By</option>
            <option>Departure Date</option>
            <option>Amount</option>
            <option>Group Size</option>
          </select>
          <button className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 text-sm font-medium text-white shadow-sm">
            <DownloadOutlined fontSize="small" />
            Download
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  S.N
                </th>

                <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Trekker
                </th>
                <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Package
                </th>

                <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Departure
                </th>

                <th className="px-6 py-5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Group
                </th>

                <th className="px-6 py-5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Amount
                </th>

                <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Guide
                </th>

                <th className="px-6 py-5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-6 py-5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="border p-5 text-center text-gray-500"
                  >
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, index) => {
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
                    <tr
                      key={booking.id}
                      className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-center">{index + 1}</td>

                      <td className="px-6 py-5 font-medium text-gray-900">
                        {trekker?.name ?? "Unknown"}
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-700">
                        {packageInfo?.title ?? "Unknown Package"}
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-700">
                        {booking.departure_date}
                      </td>

                      <td className="px-6 py-5 text-center">
                        {booking.group_size}
                      </td>

                      <td className="px-6 py-5 text-right">
                        Rs. {booking.total_price}
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-700">
                        {guide?.name ?? "Not Assigned"}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <BookingStatusBadge status={booking.status} />
                      </td>

                      <td className="px-6 py-5 text-center">
                        <Link
                          href={`/dashboard/bookings/${booking.id}`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-colors hover:bg-violet-200"
                        >
                          <VisibilityOutlined fontSize="small" />
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
    </div>
  );
}
