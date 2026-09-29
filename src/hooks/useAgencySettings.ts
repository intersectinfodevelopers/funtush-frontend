'use client';

import { useQuery } from '@tanstack/react-query';
import { getEmailSettings, getNotificationOptions, getNotificationPrefs } from '@/lib/api/agency/settings';

export const settingsKeys = { all: ['agency', 'settings'] as const };
export const useNotificationPrefs = () => useQuery({ queryKey: [...settingsKeys.all, 'notifications'], queryFn: getNotificationPrefs });
export const useNotificationOptions = () => useQuery({ queryKey: [...settingsKeys.all, 'notification-options'], queryFn: getNotificationOptions, staleTime: 30 * 60_000 });
export const useEmailSettings = () => useQuery({ queryKey: [...settingsKeys.all, 'email'], queryFn: getEmailSettings });

import { listApiKeys } from '@/lib/api/agency/settings';
export const useApiKeys = () => useQuery({ queryKey: [...settingsKeys.all, 'api-keys'], queryFn: listApiKeys, retry: false });

import { getAgencyProfile, getKyc } from '@/lib/api/agency/settings';
export const useAgencyProfile = () => useQuery({ queryKey: [...settingsKeys.all, 'profile'], queryFn: getAgencyProfile });
export const useKyc = () => useQuery({ queryKey: [...settingsKeys.all, 'kyc'], queryFn: getKyc });

import { listPaymentMethods } from '@/lib/api/agency/settings';
export const usePaymentMethods = () => useQuery({ queryKey: [...settingsKeys.all, 'payment-methods'], queryFn: listPaymentMethods });

import { listTiers } from '@/lib/api/agency/settings';
export const useTiers = () => useQuery({ queryKey: [...settingsKeys.all, 'tiers'], queryFn: listTiers, staleTime: 10 * 60_000 });

import { useBrandingOptions } from './useAgencySite';
/**
 * The signed-in agency's own tier row — pricing, limits, and the feature
 * flags a Super Admin actually granted it (blogEnabled, adsEnabled, etc.),
 * not a hardcoded assumption about what a tier named "MEDIUM" or "LARGE"
 * includes. Match is by tier name, which is what `/agencies/me/branding-options`
 * reports as the agency's current plan.
 */
export const useMyTier = () => {
  const tiers = useTiers();
  const branding = useBrandingOptions();
  const tier = tiers.data?.find((t) => t.name === branding.data?.tier);
  return { tier, isLoading: tiers.isLoading || branding.isLoading, isError: tiers.isError || branding.isError };
};

import { keepPreviousData } from '@tanstack/react-query';
import { listBugReports } from '@/lib/api/agency/settings';
export const useBugReports = (page: number) => useQuery({ queryKey: [...settingsKeys.all, 'bugs', page], queryFn: () => listBugReports(page), placeholderData: keepPreviousData });
