"use client";

const STATUS_STYLES: Record<string, string> = {
  INQUIRY: "border border-warning-200 bg-warning-50 text-warning-700",
  ALTERNATIVE_PROPOSED:
    "border border-warning-200 bg-warning-50 text-warning-700",
  PAYMENT_PENDING: "border border-primary-200 bg-primary-50 text-primary-700",
  PAID: "border border-success-200 bg-success-50 text-success-700",
  CONFIRMED: "border border-success-200 bg-success-50 text-success-700",
  ACTIVE: "border border-success-600 bg-success-600 text-white",
  COMPLETED: "border border-success-700 bg-success-700 text-white",
  CANCELLED: "border border-danger-200 bg-danger-50 text-danger-700",
  REJECTED: "border border-danger-500 bg-danger-500 text-white",
};

export function BookingStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
        STATUS_STYLES[status] ??
        "border border-neutral-200 bg-neutral-100 text-neutral-700"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
