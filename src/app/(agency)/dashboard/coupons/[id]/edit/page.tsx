"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CouponForm } from "@/components/agency/coupons/CouponForm";
import { useCouponList } from "@/hooks/useAgencyCoupons";

export default function EditCouponPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useCouponList();
  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  const coupon = data?.find((c) => c.id === id);
  if (!coupon) return <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm">This coupon doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/coupons">Back to coupons</Link></div>;
  return <CouponForm key={coupon.id} existing={coupon} />;
}
