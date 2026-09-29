import { api } from '../client';

export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type CouponStatus = 'ACTIVE' | 'PAUSED' | 'EXPIRED';

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  applicablePackages: string[];
  minBookingValue: number | null;
  validFrom: string;
  validUntil: string;
  maxRedemptions: number;
  redemptionsUsed: number;
  remainingRedemptions: number;
  firstTimeTrekkerOnly: boolean;
  minGroupSize: number | null;
  status: CouponStatus;
  isExpired: boolean;
  createdAt: string;
}

export interface CouponInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  applicablePackages: string[];
  minBookingValue: number | null;
  validFrom: string;
  validUntil: string;
  maxRedemptions: number;
  firstTimeTrekkerOnly: boolean;
  minGroupSize: number | null;
  status?: CouponStatus;
}

// GET → { success, count, data: Coupon[] } (all of the agency's coupons); write → { success, data }.
export const listCoupons = async () => (await api.get<{ data: Coupon[] }>('/agencies/me/coupons')).data;
export const createCoupon = async (b: CouponInput) => (await api.post<{ data: Coupon }>('/agencies/me/coupons', b)).data;
export const updateCoupon = async (id: string, b: Partial<CouponInput>) => (await api.patch<{ data: Coupon }>(`/agencies/me/coupons/${id}`, b)).data;
export const deleteCoupon = (id: string) => api.delete(`/agencies/me/coupons/${id}`);
