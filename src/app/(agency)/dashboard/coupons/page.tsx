"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronRight,
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
  XCircle,
  Ticket,
  CheckCircle2,
  Clock,
  Ban,
} from "lucide-react";

import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { useCoupons, couponStatus, daysUntilExpiry, type Coupon, type CouponStatus } from "@/hooks/useCoupons";
import { Pagination } from "@/components/ui/pagination";

const STATUS_STYLE: Record<CouponStatus, string> = {
  active: "bg-success-50 text-success-700",
  scheduled: "bg-primary-50 text-primary-700",
  expired: "bg-neutral-100 text-neutral-500",
  exhausted: "bg-warning-50 text-warning-700",
  disabled: "bg-danger-50 text-danger-700",
};

const STATUS_LABEL: Record<CouponStatus, string> = {
  active: "Active",
  scheduled: "Scheduled",
  expired: "Expired",
  exhausted: "Exhausted",
  disabled: "Disabled",
};

function formatDiscount(coupon: Coupon): string {
  return coupon.discountType === "percentage"
    ? `${coupon.discountValue}% off`
    : `$${coupon.discountValue} off`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CouponsPage() {
  const { coupons, deleteCoupon, toggleActive } = useCoupons();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CouponStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ coupon: Coupon } | null>(null);

  const filteredCoupons = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return coupons
      .filter(
        (coupon) =>
          coupon.code.toLowerCase().includes(query) ||
          coupon.description.toLowerCase().includes(query),
      )
      .filter((coupon) => statusFilter === "all" || couponStatus(coupon) === statusFilter)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [coupons, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / 6));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageItems = filteredCoupons.slice((safeCurrentPage - 1) * 6, safeCurrentPage * 6);

  const stats = useMemo(() => {
    const withStatus = coupons.map((c) => couponStatus(c));
    return {
      total: coupons.length,
      active: withStatus.filter((s) => s === "active").length,
      redemptions: coupons.reduce((sum, c) => sum + c.usedCount, 0),
      expiringSoon: coupons.filter((c) => couponStatus(c) === "active" && daysUntilExpiry(c) <= 14).length,
    };
  }, [coupons]);

  const handleDeleteCoupon = (id: string) => {
    const coupon = coupons.find((item) => item.id === id);
    if (coupon) setDeleteDialog({ coupon });
  };

  const confirmDeleteCoupon = () => {
    if (!deleteDialog) return;
    deleteCoupon(deleteDialog.coupon.id);
    setDeleteDialog(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Link href="/dashboard" className="hover:text-neutral-900">
              Dashboard
            </Link>
            <ChevronRight size={15} />
            <strong className="text-primary-900">Coupons</strong>
          </div>

          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Coupons</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Create and manage discount codes for your packages.
          </p>
        </div>

        <Link
          href="/dashboard/coupons/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
        >
          <Plus size={18} />
          New coupon
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsSummaryCard label="Total Coupons" value={stats.total} tone="primary" icon={Ticket} />
        <AnalyticsSummaryCard label="Active" value={stats.active} tone="success" icon={CheckCircle2} />
        <AnalyticsSummaryCard label="Redemptions" value={stats.redemptions} tone="primary" icon={CheckCircle2} />
        <AnalyticsSummaryCard label="Expiring Soon" value={stats.expiringSoon} tone="warning" icon={Clock} />
      </div>

      {/* Search and Filter */}
      <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_180px]">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search coupons..."
            className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as "all" | CouponStatus);
            setCurrentPage(1);
          }}
          className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="expired">Expired</option>
          <option value="exhausted">Exhausted</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {/* Coupon Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  S.NO
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Code
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Discount
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Valid until
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Redemptions
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {pageItems.map((coupon, index) => {
                const status = couponStatus(coupon);
                return (
                  <tr key={coupon.id} className="transition hover:bg-neutral-50">
                    <td className="px-5 py-4 text-sm font-medium text-neutral-500">
                      {(safeCurrentPage - 1) * 6 + index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-mono text-sm font-semibold text-neutral-900">{coupon.code}</p>
                      <p className="mt-0.5 max-w-xs truncate text-xs text-neutral-500">
                        {coupon.description}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">{formatDiscount(coupon)}</td>

                    <td className="px-5 py-4 text-sm text-neutral-700">{formatDate(coupon.expiryDate)}</td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {coupon.usedCount}
                      {coupon.maxUses !== null && (
                        <span className="text-neutral-400"> / {coupon.maxUses}</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status]}`}
                      >
                        {STATUS_LABEL[status]}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          title="Preview"
                          onClick={() => setSelectedCoupon(coupon)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          title={coupon.active ? "Disable" : "Enable"}
                          onClick={() => toggleActive(coupon.id)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        >
                          <Ban size={16} />
                        </button>

                        <Link
                          href={`/dashboard/coupons/${coupon.id}/edit`}
                          title="Edit"
                          className="grid h-8 w-8 place-items-center rounded-lg bg-warning-50 text-warning-700 hover:bg-warning-100"
                        >
                          <Edit size={16} />
                        </Link>

                        <button
                          type="button"
                          title="Delete"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-danger-50 text-danger-700 hover:bg-danger-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {pageItems.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
          <Ticket size={36} className="mb-3 text-neutral-300" />
          <h3 className="text-lg font-semibold text-neutral-900">No coupons found</h3>
          <p className="mt-1 max-w-md text-sm text-neutral-500">
            {searchTerm || statusFilter !== "all"
              ? "Try another keyword or clear the filters."
              : "Create your first discount code to get started."}
          </p>
        </div>
      )}

      {/* Pagination */}
      <Pagination currentPage={safeCurrentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* Delete Dialog */}
      {deleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-neutral-900">Delete coupon?</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Remove <span className="font-mono">{deleteDialog.coupon.code}</span> permanently? Trekkers
              will no longer be able to redeem it.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteDialog(null)}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCoupon}
                className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700"
              >
                Delete coupon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      {selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Preview
                </p>
                <h2 className="mt-1 font-mono text-xl font-bold text-neutral-900">
                  {selectedCoupon.code}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCoupon(null)}
                className="rounded-lg border border-neutral-200 p-2 text-neutral-500 hover:text-neutral-700"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Description
                </p>
                <p className="mt-1 text-sm font-medium text-neutral-900">{selectedCoupon.description}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Discount
                  </p>
                  <p className="mt-1 text-sm font-medium text-neutral-900">{formatDiscount(selectedCoupon)}</p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Minimum booking
                  </p>
                  <p className="mt-1 text-sm font-medium text-neutral-900">
                    {selectedCoupon.minBookingAmount > 0 ? `$${selectedCoupon.minBookingAmount}` : "None"}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Valid window
                  </p>
                  <p className="mt-1 text-sm font-medium text-neutral-900">
                    {formatDate(selectedCoupon.startDate)} – {formatDate(selectedCoupon.expiryDate)}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Usage
                  </p>
                  <p className="mt-1 text-sm font-medium text-neutral-900">
                    {selectedCoupon.usedCount}
                    {selectedCoupon.maxUses !== null ? ` / ${selectedCoupon.maxUses}` : " (unlimited)"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
