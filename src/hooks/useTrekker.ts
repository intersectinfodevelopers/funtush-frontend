'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getMyProfile, getTrekDashboard, getTrekPackage, searchPackages, type MarketQuery, type TrekSection } from '@/lib/api/trekker';

export const useMarketSearch = (p: MarketQuery) => useQuery({ queryKey: ['trekker', 'market', p], queryFn: () => searchPackages(p), placeholderData: keepPreviousData, retry: false });
export const useTrekDashboard = (section: TrekSection, page: number) => useQuery({ queryKey: ['trekker', 'treks', section, page], queryFn: () => getTrekDashboard(section, page), placeholderData: keepPreviousData });
export const useTrekPackage = (id: string) => useQuery({ queryKey: ['trekker', 'trek', id], queryFn: () => getTrekPackage(id), enabled: Boolean(id), retry: false });
export const useMyProfile = () => useQuery({ queryKey: ['trekker', 'profile'], queryFn: getMyProfile });

import { getUnreadCount, listNotifications } from '@/lib/api/trekker';
export const useNotifications = (page: number) => useQuery({ queryKey: ['trekker', 'notifications', page], queryFn: () => listNotifications(page), placeholderData: keepPreviousData });
export const useUnreadCount = () => useQuery({ queryKey: ['trekker', 'unread'], queryFn: getUnreadCount, refetchInterval: 60_000, retry: false });
