"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ChevronRight } from "lucide-react";
import { useCoupons, type Coupon, type DiscountType } from "@/hooks/useCoupons";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100";

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function CouponForm({ existing }: { existing?: Coupon }) {
  const router = useRouter();
  const { saveCoupon } = useCoupons();
  const isEdit = Boolean(existing);

  const [code, setCode] = useState(existing?.code ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [discountType, setDiscountType] = useState<DiscountType>(existing?.discountType ?? "percentage");
  const [discountValue, setDiscountValue] = useState(String(existing?.discountValue ?? ""));
  const [minBookingAmount, setMinBookingAmount] = useState(String(existing?.minBookingAmount ?? 0));
  const [maxUses, setMaxUses] = useState(existing?.maxUses != null ? String(existing.maxUses) : "");
  const [startDate, setStartDate] = useState(existing?.startDate ?? todayPlus(0));
  const [expiryDate, setExpiryDate] = useState(existing?.expiryDate ?? todayPlus(30));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedCode = code.trim().toUpperCase();
    const value = Number(discountValue);

    if (!trimmedCode) {
      toast.error("Coupon code is required.");
      return;
    }
    if (!/^[A-Z0-9_-]{3,20}$/.test(trimmedCode)) {
      toast.error("Use 3–20 letters, numbers, hyphens or underscores.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Discount value must be greater than 0.");
      return;
    }
    if (discountType === "percentage" && value > 100) {
      toast.error("Percentage discount can't exceed 100%.");
      return;
    }
    if (new Date(expiryDate) < new Date(startDate)) {
      toast.error("Expiry date must be after the start date.");
      return;
    }

    try {
      const coupon: Coupon = {
        id: existing?.id ?? `coupon-${trimmedCode.toLowerCase()}-${Date.now()}`,
        code: trimmedCode,
        description: description.trim(),
        discountType,
        discountValue: value,
        minBookingAmount: Number(minBookingAmount) || 0,
        maxUses: maxUses.trim() === "" ? null : Math.max(0, Number(maxUses) || 0),
        usedCount: existing?.usedCount ?? 0,
        startDate,
        expiryDate,
        active: existing?.active ?? true,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      };

      saveCoupon(coupon);
      toast.success(isEdit ? "Coupon updated successfully." : "Coupon created successfully.");
      router.push("/dashboard/coupons");
    } catch {
      toast.error("Could not save the coupon. Please try again.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl py-2 sm:py-4">
      <div className="mb-7 border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">
            Dashboard
          </Link>
          <ChevronRight size={15} />
          <Link href="/dashboard/coupons" className="hover:text-neutral-900">
            Coupons
          </Link>
          <ChevronRight size={15} />
          <strong className="text-primary-900">{isEdit ? "Edit coupon" : "New coupon"}</strong>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">
          {isEdit ? "Edit coupon" : "Create coupon"}
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          {isEdit ? "Update this discount code." : "Create a discount code trekkers can redeem at checkout."}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-neutral-900">Coupon Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g., SUMMER20"
                className={`${fieldClass} font-mono uppercase`}
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900">Minimum booking amount</label>
              <input
                type="number"
                min={0}
                value={minBookingAmount}
                onChange={(e) => setMinBookingAmount(e.target.value)}
                placeholder="0"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 20% off summer departures"
              className={fieldClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-neutral-900">Discount type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                className={fieldClass}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900">
                Discount value {discountType === "percentage" ? "(%)" : "($)"}
              </label>
              <input
                type="number"
                min={0}
                max={discountType === "percentage" ? 100 : undefined}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percentage" ? "e.g., 15" : "e.g., 50"}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold text-neutral-900">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900">Expiry date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900">Max redemptions</label>
              <input
                type="number"
                min={0}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/coupons")}
            className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
          >
            {isEdit ? "Save changes" : "Create coupon"}
          </button>
        </div>
      </form>
    </div>
  );
}
