import { api } from '../client';
import type { GuideRow, GuideStatus } from './dashboard';

export interface Certification {
  id?: string;
  name: string;
  issuingBody: string | null;
  number: string;
  /** YYYY-MM-DD */
  expiry: string;
  document: string | null;
}

export interface Guide extends GuideRow {
  sex: string | null;
  photo: string | null;
  bio: string | null;
  createdAt: string;
  certifications: Certification[];
}

export interface GuideDetail extends Guide {
  totalTreks: number;
  upcomingAssignments: Array<{ id: string; title?: string; date?: string; status?: string }>;
}

/** Whole-agency numbers for the guides page cards. */
export interface GuideStats {
  total: number;
  onTrek: number;
  available: number;
  certsExpiring: number;
  totalBeforeMonth: number;
}

export interface GuideListParams {
  status?: GuideStatus | 'all';
  language?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// GET /agencies/me/guides → { success, guides, total, page, limit }   (active guides only)
export const listGuides = (params: GuideListParams = {}) =>
  api.get<{ success: boolean; guides: Guide[]; total: number; page: number; limit: number; stats?: GuideStats }>('/agencies/me/guides', { params });

export const getGuide = async (id: string) => (await api.get<{ success: boolean; data: GuideDetail }>(`/agencies/me/guides/${id}`)).data;

export interface GuideInput {
  name: string;
  phone: string;
  email?: string | null;
  sex?: string | null;
  photo?: string | null;
  bio?: string | null;
  languages: string[];
  status?: GuideStatus;
  rating?: number | null;
  /** On update, sending certifications REPLACES the whole set. */
  certifications?: Array<Omit<Certification, 'id'>>;
}

export const createGuide = async (input: GuideInput) => (await api.post<{ success: boolean; data: Guide }>('/agencies/me/guides', input)).data;
export const updateGuide = async (id: string, input: Partial<GuideInput>) => (await api.patch<{ success: boolean; data: Guide }>(`/agencies/me/guides/${id}`, input)).data;
/** Soft delete — the guide is deactivated, past bookings keep their reference. */
export const deactivateGuide = (id: string) => api.delete(`/agencies/me/guides/${id}`);

export interface AssignableGuide {
  guideRef: string;
  name: string;
  phone: string;
  status: GuideStatus;
  /** False when this trek can't use them right now (busy on another trek, or marked unavailable). */
  assignable: boolean;
  reason: string | null;
}
/** Every guide plus whether the trek (departure) can use them — a guide on another trek is busy until free. */
export const listAssignableGuides = async (departureDateId: string, bookingId?: string) =>
  (await api.get<{ success: boolean; guides: AssignableGuide[] }>('/agencies/me/guides/assignable', { params: { departureDateId, ...(bookingId ? { bookingId } : {}) } })).guides;
