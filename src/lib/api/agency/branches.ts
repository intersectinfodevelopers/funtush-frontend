import { api } from '../client';

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string | null;
  isHeadOffice: boolean;
  managerStaffId: string | null;
  managerStaff: { id: string; name: string | null } | null;
  createdAt: string;
  _count: { guides: number; bookings: number; packageBranches: number };
}
export interface BranchInput {
  name: string;
  address: string;
  phone: string;
  whatsapp: string | null;
  managerStaffId: string | null;
  isHeadOffice: boolean;
}
export interface BranchReport {
  branch: { id: string; name: string };
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  inquiryBookings: number;
  totalRevenue: number | string;
  averageBookingValue: number | string;
  totalCustomers: number;
  topPackages: { packageId: string; title: string; confirmedBookings: number }[];
}

// GET → { success, count, data }; write → { success, data }; report → { success, data }; delete → 204.
export const listBranches = async () => (await api.get<{ data: Branch[] }>('/agencies/me/branches')).data;
export const createBranch = async (b: BranchInput) => (await api.post<{ data: Branch }>('/agencies/me/branches', b)).data;
export const updateBranch = async (id: string, b: Partial<BranchInput>) => (await api.patch<{ data: Branch }>(`/agencies/me/branches/${id}`, b)).data;
export const deleteBranch = (id: string) => api.delete(`/agencies/me/branches/${id}`);
export const getBranchReport = async (id: string) => (await api.get<{ data: BranchReport }>(`/agencies/me/branches/${id}/report`)).data;
