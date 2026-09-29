'use client';

import { useQuery } from '@tanstack/react-query';
import { getStaffActivity, listStaff } from '@/lib/api/agency/staff';
import { listRoles, permissionCatalog } from '@/lib/api/agency/roles';

export const teamKeys = { staff: ['agency', 'staff'] as const, roles: ['agency', 'roles'] as const };

export const useStaffList = () => useQuery({ queryKey: teamKeys.staff, queryFn: listStaff });
export const useStaffActivity = (id: string) => useQuery({ queryKey: [...teamKeys.staff, id, 'activity'], queryFn: () => getStaffActivity(id), enabled: Boolean(id) });
export const useRoleList = () => useQuery({ queryKey: teamKeys.roles, queryFn: listRoles });
export const usePermissionCatalog = () => useQuery({ queryKey: [...teamKeys.roles, 'catalog'], queryFn: permissionCatalog, staleTime: 30 * 60_000 });
