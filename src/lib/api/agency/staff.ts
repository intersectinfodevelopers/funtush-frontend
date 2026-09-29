import { api } from '../client';

export interface StaffMember {
  id: string;
  userId: string;
  roleId: string | null;
  name: string | null;
  phone: string | null;
  isActive: boolean;
  invitedAt: string;
  user: { id: string; role: string; user: { id: string; email: string; createdAt?: string } };
  role: { id: string; name: string } | null;
}

export interface StaffActivity {
  _id: string;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// GET /agencies/me/staff → { staff: [] } (no envelope)
export const listStaff = async () => (await api.get<{ staff: StaffMember[] }>('/agencies/me/staff')).staff;
export const getStaffActivity = async (id: string) => (await api.get<{ activity: StaffActivity[] }>(`/agencies/me/staff/${id}/activity`)).activity;

export interface InviteInput {
  email: string;
  name?: string;
  phone?: string;
  roleId?: string;
}
/** The response carries the temporary password once — it is also emailed. */
export const inviteStaff = (input: InviteInput) => api.post<{ staff: StaffMember; tempPassword: string }>('/agencies/me/staff', input);
export const updateStaff = (id: string, input: { name?: string; phone?: string; email?: string; roleId?: string | null }) => api.patch(`/agencies/me/staff/${id}`, input);
/** The API can change a role but not clear one — roleId is required. */
export const reassignRole = (id: string, roleId: string) => api.patch(`/agencies/me/staff/${id}/role`, { roleId });
// Deactivating an already-inactive member deletes it for real — see the backend comment on deactivateStaffService.
export const deactivateStaff = (id: string) => api.delete<{ deleted: boolean; staff?: StaffMember }>(`/agencies/me/staff/${id}`);
export const reactivateStaff = (id: string) => api.patch(`/agencies/me/staff/${id}/reactivate`, {});
