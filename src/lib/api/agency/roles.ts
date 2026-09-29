import { api } from '../client';

export interface AgencyRole {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  permissions: string[];
}

export interface PermissionGroup {
  group: string;
  permissions: Array<{ key: string; label: string; description: string }>;
}

export const listRoles = async () => (await api.get<{ success: boolean; data: AgencyRole[] }>('/agencies/me/roles')).data;
export const permissionCatalog = async () => (await api.get<{ success: boolean; data: PermissionGroup[] }>('/agencies/me/roles/permissions')).data;

export async function createRole(input: { name: string; description?: string; permissionKeys: string[] }) {
  const res = await api.post<{ success: boolean; data: { id: string } }>('/agencies/me/roles', { name: input.name, description: input.description });
  if (input.permissionKeys.length) await setRolePermissions(res.data.id, input.permissionKeys);
  return res.data;
}
/** Replaces the whole set — send every permission the role should have. */
export const setRolePermissions = (id: string, permissionKeys: string[]) => api.patch(`/agencies/me/roles/${id}/permissions`, { permissionKeys });
/** Blocked by the API while active staff are assigned to the role. */
export const deleteRole = (id: string) => api.delete(`/agencies/me/roles/${id}`);
