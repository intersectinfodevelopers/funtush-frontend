"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  MapPin,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Pagination } from "@/components/ui/pagination";
import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import bookingsData from "../../../../../data/bookings.json";
import usersData from "../../../../../data/users.json";
import packagesData from "../../../../../data/packages.json";
import guidesData from "../../../../../data/guides.json";

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

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "inquiry", label: "Inquiry" },
  { value: "payment", label: "Payment" },
  { value: "confirmed", label: "Confirmed" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

type Tab = (typeof tabs)[number] | "all";

function BookingStatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();

  const variants: Record<string, string> = {
    inquiry: "border border-warning-200 bg-warning-50 text-warning-700",
    confirmed: "border border-success-200 bg-success-50 text-success-700",
    active: "border border-success-600 bg-success-600 text-white",
    completed: "border border-success-700 bg-success-700 text-white",
    cancelled: "border border-danger-200 bg-danger-50 text-danger-700",
    rejected: "border border-danger-500 bg-danger-500 text-white",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
        variants[normalizedStatus] ??
        "border border-neutral-200 bg-neutral-100 text-neutral-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function BookingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize with the static dataset so server and client render match.
  // Read from localStorage only after mount to avoid hydration mismatches.
  const [bookings, setBookings] = useState<Booking[]>(bookingsData as Booking[]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bookings");
      if (stored) {
        setBookings(JSON.parse(stored) as Booking[]);
      }
    } catch {
      /* ignore and keep default bookingsData */
    }
  }, []);

  const inquiryCount = bookings.filter(
    (booking) => booking.status.toLowerCase() === "inquiry",
  ).length;
  const paymentCount = bookings.filter(
    (booking) => booking.status.toLowerCase() === "payment",
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
  const cancelledCount = bookings.filter(
    (booking) => booking.status.toLowerCase() === "cancelled",
  ).length;

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (activeTab !== "all" && booking.status.toLowerCase() !== activeTab) {
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

  const bookingsPerPage = 8;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / bookingsPerPage),
  );

  // Reset page when filters change by updating handlers that change the filters (below)

  // Avoid setting state inside effects; use safeCurrentPage when rendering/paginating instead.

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBookings = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * bookingsPerPage;
    return filteredBookings.slice(startIndex, startIndex + bookingsPerPage);
  }, [filteredBookings, safeCurrentPage]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <Link
              href="/dashboard"
              className="transition hover:text-neutral-900"
            >
              Dashboard
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">All Bookings</span>
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Booking Approval
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-2xl border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-900 transition hover:bg-primary-50">
            <FileText className="h-4 w-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/bookings/new")}
            className="rounded-2xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
          >
            + Create
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsSummaryCard
          label="Pending"
          value={inquiryCount}
          tone="warning"
          icon={Clock3}
        />
        <AnalyticsSummaryCard
          label="Confirmed"
          value={confirmedCount}
          tone="success"
          icon={CheckCircle2}
        />
        <AnalyticsSummaryCard
          label="Active Treks"
          value={activeCount}
          tone="primary"
          icon={MapPin}
        />
        <AnalyticsSummaryCard
          label="Completed"
          value={completedCount}
          tone="success"
          icon={Trophy}
        />
      </div>

      <div className="mt-5 overflow-x-auto border-b border-neutral-200">
        <div className="flex min-w-max items-center gap-5 px-1 sm:gap-8 sm:px-0">
          {tabs.map((tab) => {
            const count =
              tab === "inquiry"
                ? inquiryCount
                : tab === "confirmed"
                  ? confirmedCount
                  : tab === "active"
                    ? activeCount
                    : tab === "completed"
                      ? completedCount
                      : tab === "cancelled"
                        ? cancelledCount
                        : paymentCount;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold capitalize transition ${
                  activeTab === tab
                    ? "border-primary-900 text-primary-900"
                    : "border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
                }`}
              >
                <span>{tab === "inquiry" ? "Inquiries" : tab}</span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-500">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <label className="relative block">
          <input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <select
          value={activeTab}
          onChange={(e) => {
            setActiveTab(e.target.value as Tab);
            setCurrentPage(1);
          }}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />

        <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-primary-900 bg-white px-4 py-3 text-sm font-semibold text-primary-900 transition hover:bg-primary-50">
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Trekker</th>
                <th className="px-4 py-3 font-medium">Package</th>
                <th className="px-4 py-3 font-medium">Departure</th>
                <th className="px-4 py-3 text-center font-medium">Group</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Guide</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-center font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-neutral-500"
                  >
                    No bookings found for this filter.
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

                  const guide = (guidesData as Guide[]).find(
                    (guide) => guide.id === booking.guide_id,
                  );

                  const rowKey = `${booking.id}-${index}`;

                  return (
                    <tr
                      key={rowKey}
                      className="border-t border-neutral-200 hover:bg-neutral-50"
                    >
                      <td className="px-4 py-3 font-medium text-neutral-900">
                        {trekker?.name ?? "Unknown"}
                      </td>

                      <td className="px-4 py-3 text-neutral-700">
                        {packageInfo?.title ?? "Unknown Package"}
                      </td>

                      <td className="px-4 py-3 text-neutral-700">
                        {booking.departure_date}
                      </td>

                      <td className="px-4 py-3 text-center text-neutral-700">
                        {booking.group_size}
                      </td>

                      <td className="px-4 py-3 text-right font-medium text-neutral-900">
                        {booking.status.toLowerCase() === "inquiry"
                          ? "-"
                          : `Rs. ${booking.total_price.toLocaleString("en-IN")}`}
                      </td>

                      <td className="px-4 py-3 text-neutral-700">
                        {booking.status.toLowerCase() === "inquiry" && !guide
                          ? "Unassigned"
                          : (guide?.name ?? "Not Assigned")}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <BookingStatusBadge status={booking.status} />
                      </td>

                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/dashboard/bookings/${booking.id}`}
                          className="inline-flex items-center justify-center rounded-xl bg-primary-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-primary-800"
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

      <Pagination
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="border-t border-neutral-200"
      />
    </div>
  );
}
