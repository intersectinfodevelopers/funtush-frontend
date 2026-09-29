'use client';

import { useQuery } from '@tanstack/react-query';
import { listCoupons } from '@/lib/api/agency/coupons';

export const useCouponList = () => useQuery({ queryKey: ['agency', 'coupons'], queryFn: listCoupons });
