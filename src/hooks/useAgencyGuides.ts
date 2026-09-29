'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getGuide, listGuides, type GuideListParams } from '@/lib/api/agency/guides';

export const useGuideList = (p: GuideListParams) => useQuery({ queryKey: ['agency', 'guides', 'list', p], queryFn: () => listGuides(p), placeholderData: keepPreviousData });
export const useGuideDetail = (id: string) => useQuery({ queryKey: ['agency', 'guide', id], queryFn: () => getGuide(id), enabled: Boolean(id) });
