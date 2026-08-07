"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import bookingsData from "../../../../../data/bookings.json";
import usersData from "../../../../../data/users.json";
import packagesData from "../../../../../data/packages.json";

import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import PendingActionsOutlined from "@mui/icons-material/PendingActionsOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import DirectionsWalkOutlined from "@mui/icons-material/DirectionsWalkOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import NorthOutlined from "@mui/icons-material/NorthOutlined";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";

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
  duration?: string;
};

type User = {
  id: string;
  name: string;
  email?: string;
};

type Package = {
  id: string;
  title: string;
};

const tabs = [
  { id: "inquiry", label: "Inquiries" },
  { id: "confirmed", label: "Confirmed" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function BookingStatusBadge({ status }: { status: string }) {
  let color = "bg-gray-100 text-gray-600";
  let label = status;

  switch (status.toLowerCase()) {
    case "inquiry":
    case "pending":
      color = "bg-[#FDE8DF] text-[#D97757]";
      label = "Pending";
      break;

    case "confirmed":
      color = "bg-emerald-100 text-emerald-600";
      label = "Confirmed";
      break;

    case "active":
      color = "bg-blue-100 text-blue-600";
      label = "Active";
      break;

    case "completed":
      color = "bg-purple-100 text-purple-600";
      label = "Completed";
      break;

    case "cancelled":
    case "rejected":
      color = "bg-red-100 text-red-600";
      label = "Cancelled";
      break;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${color}`}
    >
      {label}
    </span>
  );
}

const ITEMS_PER_PAGE = 5;

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("inquiry");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [bookings] = useState<Booking[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bookings");

      if (stored) {
        try {
          return JSON.parse(stored) as Booking[];
        } catch (e) {
          console.error("Failed to parse local storage bookings", e);
        }
      }
    }

    return bookingsData as Booking[];
  });

  const pendingCount = bookings.filter(
    (b) =>
      b.status.toLowerCase() === "inquiry" ||
      b.status.toLowerCase() === "pending",
  ).length;

  const confirmedCount = bookings.filter(
    (b) => b.status.toLowerCase() === "confirmed",
  ).length;

  const activeCount = bookings.filter(
    (b) => b.status.toLowerCase() === "active",
  ).length;

  const completedCount = bookings.filter(
    (b) => b.status.toLowerCase() === "completed",
  ).length;

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const statusMatch =
        activeTab === "inquiry"
          ? booking.status.toLowerCase() === "inquiry" ||
            booking.status.toLowerCase() === "pending"
          : booking.status.toLowerCase() === activeTab;

      if (!statusMatch) return false;

      const trekker = (usersData as User[]).find(
        (user) => user.id === booking.trekker_id,
      );

      const trekkerName = trekker?.name.toLowerCase() ?? "";

      if (search && !trekkerName.includes(search.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [activeTab, bookings, search]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE) || 1;

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookings, currentPage]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Approval</h1>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
            <span>Bookings</span>
            <ChevronRightOutlined className="text-gray-300" fontSize="small" />
            <span className="font-medium text-indigo-600">All Bookings</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50">
            <DownloadOutlined fontSize="small" />
            Export CSV
          </button>

          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
            <AddOutlined fontSize="small" />
            Create
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Pending Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white">
            <PendingActionsOutlined />
          </div>
          <p className="text-xs font-bold tracking-wider uppercase text-gray-800">
            PENDING
          </p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {pendingCount}
          </h2>
          <p className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-600">
            <NorthOutlined style={{ fontSize: 14 }} />
            Awaiting response
          </p>
        </div>

        {/* Confirmed Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white">
            <CheckCircleOutlined />
          </div>
          <p className="text-xs font-bold tracking-wider uppercase text-gray-800">
            CONFIRMED
          </p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {confirmedCount}
          </h2>
          <p className="mt-4 flex items-center gap-1 text-xs font-medium text-amber-600">
            <NorthOutlined style={{ fontSize: 14 }} />
            12% this month
          </p>
        </div>

        {/* Active Treks Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
            <DirectionsWalkOutlined />
          </div>
          <p className="text-xs font-bold tracking-wider uppercase text-gray-800">
            ACTIVE TREKS
          </p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {activeCount}
          </h2>
          <p className="mt-4 text-xs font-medium text-emerald-600">
            On trail now
          </p>
        </div>

        {/* Completed Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-white">
            <EmojiEventsOutlined />
          </div>
          <p className="text-xs font-bold tracking-wider uppercase text-gray-800">
            COMPLETED
          </p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {completedCount}
          </h2>
          <p className="mt-4 text-xs font-medium text-rose-500">All time</p>
        </div>
      </div>

      {/* Filters & Action Bar */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-[360px]">
          <SearchOutlined
            fontSize="small"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-gray-200 bg-slate-600/10 py-2.5 pl-11 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select className="w-full rounded-xl border border-gray-200 bg-slate-600/10 px-4 py-2.5 text-sm font-medium text-gray-600 focus:border-indigo-500 focus:outline-none sm:w-[140px]">
            <option>Status</option>
            <option>Inquiry</option>
            <option>Confirmed</option>
            <option>Active</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>

          <select className="w-full rounded-xl border border-gray-200 bg-slate-600/10 px-4 py-2.5 text-sm font-medium text-gray-600 focus:border-indigo-500 focus:outline-none sm:w-[140px]">
            <option>Sort by</option>
            <option>Departure Date</option>
            <option>Amount</option>
            <option>Group Size</option>
          </select>

          <button className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
            Download
            <DownloadOutlined fontSize="small" />
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="mb-6 flex items-center gap-8 rounded-2xl bg-indigo-50/60 px-6 py-3.5">
        {tabs.map((tab) => {
          const count = bookings.filter((b) =>
            tab.id === "inquiry"
              ? b.status.toLowerCase() === "inquiry" ||
                b.status.toLowerCase() === "pending"
              : b.status.toLowerCase() === tab.id,
          ).length;

          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative flex items-center gap-2 pb-1 text-sm transition ${
                isActive
                  ? "font-bold text-indigo-600"
                  : "font-medium text-gray-500 hover:text-gray-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-xs font-normal">{count}</span>

              {isActive && (
                <span className="absolute -bottom-3.5 left-0 h-[3px] w-full rounded-full bg-indigo-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-[#FBF3F0] text-xs font-bold uppercase tracking-wider text-gray-800">
                <th className="px-6 py-4">S.N</th>
                <th className="px-6 py-4">TREKKER</th>
                <th className="px-6 py-4">PACKAGE</th>
                <th className="px-6 py-4">DEPARTURE</th>
                <th className="px-6 py-4">GROUP</th>
                <th className="px-6 py-4">AMOUNT</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-center">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm">
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    No bookings found
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking, index) => {
                  const trekker = (usersData as User[]).find(
                    (user) => user.id === booking.trekker_id,
                  );
                  const packageInfo = (packagesData as Package[]).find(
                    (pkg) => pkg.id === booking.package_id,
                  );

                  const isPendingStatus =
                    booking.status.toLowerCase() === "inquiry" ||
                    booking.status.toLowerCase() === "pending";

                  const serialNumber =
                    (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-500">
                        {serialNumber}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7C5CFC] text-xs font-bold text-white">
                            {(trekker?.name ?? "SK")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {trekker?.name ?? "Subash Kuwar"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {trekker?.email ?? "subashkur@gmail.com"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {packageInfo?.title ?? "ABC Trek 14 D"}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {booking.departure_date || "May 17-30"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {booking.duration ?? "14 Day"}
                        </p>
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {booking.group_size} PX
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-900">
                        ${booking.total_price.toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <BookingStatusBadge status={booking.status} />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {isPendingStatus ? (
                            <>
                              <button className="rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-200">
                                Accept
                              </button>
                              <button className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-200">
                                Rejected
                              </button>
                              <Link
                                href={`/dashboard/bookings/${booking.id}`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition hover:bg-indigo-200"
                              >
                                <VisibilityOutlined style={{ fontSize: 18 }} />
                              </Link>
                            </>
                          ) : (
                            <>
                              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-500 hover:bg-orange-200">
                                <EditOutlined style={{ fontSize: 18 }} />
                              </button>
                              <Link
                                href={`/dashboard/bookings/${booking.id}`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                              >
                                <VisibilityOutlined style={{ fontSize: 18 }} />
                              </Link>
                              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-200">
                                <DeleteOutlineOutlined
                                  style={{ fontSize: 18 }}
                                />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Dynamic Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 text-xs font-medium text-gray-400">
          <span>
            Showing{" "}
            {filteredBookings.length === 0
              ? 0
              : (currentPage - 1) * ITEMS_PER_PAGE + 1}{" "}
            to {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)}{" "}
            of {filteredBookings.length} entries
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-7 w-7 items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-40"
            >
              <ChevronLeftOutlined fontSize="small" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                  currentPage === page
                    ? "bg-indigo-600 font-bold text-white"
                    : "border border-gray-200 text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-7 w-7 items-center justify-center text-indigo-600 hover:text-indigo-800 disabled:opacity-40"
            >
              <ChevronRightOutlined fontSize="small" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
