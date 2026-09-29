'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getAd, listAdPositions, listAds } from '@/lib/api/agency/ads';

export const useAdList = (p: { status?: string; position?: string; search?: string; page?: number; limit?: number }) => useQuery({ queryKey: ['agency', 'ads', 'list', p], queryFn: () => listAds(p), placeholderData: keepPreviousData });
export const useAdPositions = () => useQuery({ queryKey: ['agency', 'ads', 'positions'], queryFn: listAdPositions });
export const useAd = (id: string) => useQuery({ queryKey: ['agency', 'ads', 'one', id], queryFn: () => getAd(id), enabled: Boolean(id) });
