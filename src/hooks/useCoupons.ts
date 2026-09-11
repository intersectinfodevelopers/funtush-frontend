'use client';

import { useEffect, useState } from 'react';

export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minBookingAmount: number;
  /** null = unlimited redemptions. */
  maxUses: number | null;
  usedCount: number;
  startDate: string;
  expiryDate: string;
  /** Manual enable/disable — independent of the date window. */
  active: boolean;
  createdAt: string;
}

export type CouponStatus = 'active' | 'scheduled' | 'expired' | 'exhausted' | 'disabled';

/** Whole days remaining until a coupon expires. Negative once it has passed. */
export function daysUntilExpiry(coupon: Coupon, now: Date = new Date()): number {
  return Math.ceil((new Date(coupon.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** Derive the effective status from dates, usage, and the manual toggle. */
export function couponStatus(coupon: Coupon, now: Date = new Date()): CouponStatus {
  if (!coupon.active) return 'disabled';
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return 'exhausted';
  const start = new Date(coupon.startDate);
  const expiry = new Date(coupon.expiryDate);
  if (now < start) return 'scheduled';
  if (now > expiry) return 'expired';
  return 'active';
}

const STORAGE_KEY = 'agency-coupons';

function iso(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

const initialCoupons: Coupon[] = [
  {
    id: 'coupon-welcome10',
    code: 'WELCOME10',
    description: '10% off for first-time bookers.',
    discountType: 'percentage',
    discountValue: 10,
    minBookingAmount: 0,
    maxUses: null,
    usedCount: 34,
    startDate: iso(-60),
    expiryDate: iso(120),
    active: true,
    createdAt: iso(-60),
  },
  {
    id: 'coupon-autumn50',
    code: 'AUTUMN50',
    description: '$50 off autumn departures over $1,000.',
    discountType: 'fixed',
    discountValue: 50,
    minBookingAmount: 1000,
    maxUses: 100,
    usedCount: 61,
    startDate: iso(-30),
    expiryDate: iso(10),
    active: true,
    createdAt: iso(-30),
  },
  {
    id: 'coupon-earlybird',
    code: 'EARLYBIRD25',
    description: 'Early-bird 25% off, expired last season.',
    discountType: 'percentage',
    discountValue: 25,
    minBookingAmount: 0,
    maxUses: 50,
    usedCount: 50,
    startDate: iso(-200),
    expiryDate: iso(-120),
    active: true,
    createdAt: iso(-200),
  },
];

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    if (typeof window === 'undefined') return initialCoupons;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Coupon[]) : initialCoupons;
    } catch {
      return initialCoupons;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
    } catch {
      /* ignore */
    }
  }, [coupons]);

  const saveCoupon = (coupon: Coupon) =>
    setCoupons((current) => {
      const exists = current.some((item) => item.id === coupon.id);
      return exists
        ? current.map((item) => (item.id === coupon.id ? coupon : item))
        : [coupon, ...current];
    });

  const deleteCoupon = (id: string) =>
    setCoupons((current) => current.filter((item) => item.id !== id));

  const toggleActive = (id: string) =>
    setCoupons((current) =>
      current.map((item) => (item.id === id ? { ...item, active: !item.active } : item)),
    );

  return {
    coupons,
    saveCoupon,
    deleteCoupon,
    toggleActive,
    getCoupon: (id: string) => coupons.find((c) => c.id === id),
  };
}
