"use client";

import { useRouter, useParams } from "next/navigation";
import { useCoupons } from "@/hooks/useCoupons";
import { CouponForm } from "@/components/agency/coupons/CouponForm";

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = params?.id as string;

  const { getCoupon } = useCoupons();
  const currentCoupon = getCoupon(couponId);

  if (!currentCoupon) {
    return (
      <div className="mx-auto w-full max-w-6xl py-10">
        <p className="text-sm text-neutral-600">Coupon not found.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/coupons")}
          className="mt-4 rounded-xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
        >
          Back to coupons
        </button>
      </div>
    );
  }

  return <CouponForm key={currentCoupon.id} existing={currentCoupon} />;
}
