import { api } from '../client';

export interface CustomerRow {
  trekkerId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  totalBookings: number;
  totalSpending: number;
  lastBookingDate: string;
  repeatVisitor: boolean;
  isNewCustomer: boolean;
  /** Completed a trek without a Funtush account. */
  isGuest?: boolean;
}

export interface CustomerListParams {
  search?: string;
  customerType?: 'repeat' | 'new';
  sortBy?: 'lastBookingDate' | 'totalBookings' | 'totalSpending';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CustomerList {
  data: CustomerRow[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

// GET /agencies/me/customers → { success, result: { data, meta } }
export const listCustomers = async (params: CustomerListParams = {}) =>
  (await api.get<{ success: boolean; result: CustomerList }>('/agencies/me/customers', { params })).result;

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  repeatRate: number;
  topCustomersBySpending: Array<{ trekkerId: string; name: string; totalSpent: number; bookingCount: number }>;
}

// GET /agencies/me/customers/analytics → { success, data: { data: {...} } }
export const fetchCustomerAnalytics = async () =>
  (await api.get<{ success: boolean; data: { data: CustomerAnalytics } }>('/agencies/me/customers/analytics')).data.data;

export interface CustomerNote {
  id: string;
  noteText: string;
  staffId: string;
  createdAt: string;
}

export interface CustomerProfile {
  customer: {
    id: string;
    fullName: string | null;
    phone: string | null;
    country: string | null;
    nationality: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    isEmailVerified: boolean;
    createdAt: string;
    user: { email: string };
    isGuest?: boolean;
  };
  stats: {
    totalSpent: number;
    visitCount: number;
    firstBookingDate: string | null;
    lastBookingDate: string | null;
    averageBookingValue: number;
    badge: string | null;
  };
  bookingHistory: Array<{
    id: string;
    status: string;
    groupSize: number;
    totalPrice: string | number;
    createdAt: string;
    package?: { title: string } | null;
  }>;
  notes: CustomerNote[];
}

// GET /customers/:id/profile → { success, data: { success, message, data: {...} } }
export const fetchCustomerProfile = async (id: string) =>
  (await api.get<{ success: boolean; data: { data: CustomerProfile } }>(`/customers/${encodeURIComponent(id)}/profile`)).data.data;

// GET /customers/:id/notes → { success, result: { data: { customerNote: [] } } }
export const fetchCustomerNotes = async (id: string) =>
  (await api.get<{ success: boolean; result: { data: { customerNote: CustomerNote[] } } }>(`/customers/${encodeURIComponent(id)}/notes`)).result.data.customerNote;

export const addCustomerNote = (id: string, noteText: string) => api.post(`/customers/${encodeURIComponent(id)}/notes`, { noteText });

export interface CustomerEdit {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
}
/** Edit how THIS agency sees a customer (their account is untouched). An empty value restores the original. */
export const updateCustomer = (id: string, body: CustomerEdit) => api.patch(`/agencies/me/customers/${encodeURIComponent(id)}`, body);
/** Removes the customer from this agency's list (bookings and the traveller's account are kept). */
export const deleteCustomer = (id: string) => api.delete(`/agencies/me/customers/${encodeURIComponent(id)}`);
