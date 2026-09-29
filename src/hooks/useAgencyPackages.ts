'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getPackage, getPackageActivity, listPackages, type PackageSort, type PackageStatus } from '@/lib/api/agency/packages';

export const usePackageList = (params: { status?: PackageStatus; search?: string; sort?: PackageSort; page?: number; limit?: number } = {}) =>
  useQuery({ queryKey: ['agency', 'packages', params], queryFn: () => listPackages(params), placeholderData: keepPreviousData });

export const usePackageDetail = (id: string) =>
  useQuery({ queryKey: ['agency', 'package', id], queryFn: () => getPackage(id), enabled: Boolean(id) });

export const usePackageActivity = (id: string) =>
  useQuery({ queryKey: ['agency', 'package', id, 'activity'], queryFn: () => getPackageActivity(id), enabled: Boolean(id) });
