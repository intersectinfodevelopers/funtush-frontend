import { api } from '../client';

export type AdStatus = 'active' | 'paused';

export interface SiteAd {
  id: string;
  title: string;
  image: string;
  linkUrl: string | null;
  position: string;
  status: AdStatus;
  clicks: number;
  impressions: number;
  startDate: string | null;
  endDate: string | null;
  order: number;
}
export interface AdPosition { id: string; label: string; activeAds: number; available: boolean }
export interface AdStats { total: number; active: number; paused: number; totalClicks: number; totalImpressions: number; totalBeforeMonth: number }
export interface AdInput {
  title: string;
  image: string;
  linkUrl: string | null;
  position: string;
  status: AdStatus;
}

// List → { success, ads, total, page, limit, stats }; positions/single/write → { success, data }; delete → 204.
export const listAds = (params: { status?: string; position?: string; search?: string; page?: number; limit?: number } = {}) =>
  api.get<{ ads: SiteAd[]; total: number; page: number; limit: number; stats: AdStats }>('/agencies/me/advertisements', { params });
export const listAdPositions = async () => (await api.get<{ data: AdPosition[] }>('/agencies/me/advertisements/positions')).data;
export const getAd = async (id: string) => (await api.get<{ data: SiteAd }>(`/agencies/me/advertisements/${id}`)).data;
export const createAd = async (b: AdInput) => (await api.post<{ data: SiteAd }>('/agencies/me/advertisements', b)).data;
export const updateAd = async (id: string, b: Partial<AdInput>) => (await api.patch<{ data: SiteAd }>(`/agencies/me/advertisements/${id}`, b)).data;
export const deleteAd = (id: string) => api.delete(`/agencies/me/advertisements/${id}`);
