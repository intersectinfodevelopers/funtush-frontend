'use client';

import { useQuery } from '@tanstack/react-query';
import { getBranding, getBrandingOptions, getSeo, getSocial } from '@/lib/api/agency/site';

export const siteKeys = { all: ['agency', 'site'] as const };
export const useBranding = () => useQuery({ queryKey: [...siteKeys.all, 'branding'], queryFn: getBranding });
export const useBrandingOptions = () => useQuery({ queryKey: [...siteKeys.all, 'branding-options'], queryFn: getBrandingOptions, staleTime: 30 * 60_000 });
export const useSeo = () => useQuery({ queryKey: [...siteKeys.all, 'seo'], queryFn: getSeo });
export const useSocial = () => useQuery({ queryKey: [...siteKeys.all, 'social'], queryFn: getSocial });

import { getNavigation, getNavigationOptions } from '@/lib/api/agency/site';
export const useNavigation = () => useQuery({ queryKey: [...siteKeys.all, 'navigation'], queryFn: getNavigation });
export const useNavigationOptions = () => useQuery({ queryKey: [...siteKeys.all, 'navigation-options'], queryFn: getNavigationOptions, staleTime: 30 * 60_000 });

import { getWidgets } from '@/lib/api/agency/site';
export const useWidgets = () => useQuery({ queryKey: [...siteKeys.all, 'widgets'], queryFn: getWidgets });

import { getSiteConfig, getSiteConfigOptions } from '@/lib/api/agency/site';
export const useSiteConfig = () => useQuery({ queryKey: [...siteKeys.all, 'site-config'], queryFn: getSiteConfig });
export const useSiteConfigOptions = () => useQuery({ queryKey: [...siteKeys.all, 'site-config-options'], queryFn: getSiteConfigOptions, staleTime: 30 * 60_000 });

import { getDomain } from '@/lib/api/agency/site';
export const useDomain = () => useQuery({ queryKey: [...siteKeys.all, 'domain'], queryFn: getDomain });

import { getSitePage, getSitePageOptions } from '@/lib/api/agency/site';
export const useSitePage = () => useQuery({ queryKey: [...siteKeys.all, 'site-page'], queryFn: getSitePage });
export const useSitePageOptions = () => useQuery({ queryKey: [...siteKeys.all, 'site-page-options'], queryFn: getSitePageOptions, staleTime: 30 * 60_000 });
