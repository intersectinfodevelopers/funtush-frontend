import { api } from '../client';

export interface Destination {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  region: string | null;
  difficulty: string | null;
  activities: string[];
  featuredImage: string | null;
  gallery: string[];
  duration: { min: number | null; max: number | null };
  altitude: { min: number | null; max: number | null };
  engagement: { views: number; saves: number };
  bestTimeToVisit: string | null;
  published: boolean;
  featured: boolean;
  rating: number | null;
  reviewCount: number;
}

/** Whole-agency numbers for the cards on the destinations page. */
export interface DestinationStats {
  total: number;
  published: number;
  featured: number;
  regions: number;
  totalBeforeMonth: number;
}

export const DESTINATION_CATEGORIES = ['Trekking', 'Peak Climbing', 'Cultural', 'Wildlife', 'Adventure', 'Pilgrimage'] as const;
export const DESTINATION_DIFFICULTIES = ['Easy', 'Moderate', 'Challenging', 'Difficult'] as const;

export interface DestinationListParams {
  published?: 'true' | 'false';
  featured?: 'true';
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DestinationInput {
  title: string;
  category?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  region?: string | null;
  difficulty?: string | null;
  activities?: string[];
  featuredImage?: string | null;
  gallery?: string[];
  durationMin?: number | null;
  durationMax?: number | null;
  altitudeMin?: number | null;
  altitudeMax?: number | null;
  bestTimeToVisit?: string | null;
  published?: boolean;
  featured?: boolean;
}

// GET /agencies/me/destinations → { success, destinations, total, page, limit }
export const listDestinations = (params: DestinationListParams = {}) =>
  api.get<{ success: boolean; destinations: Destination[]; total: number; page: number; limit: number; stats?: DestinationStats; categories?: string[] }>('/agencies/me/destinations', { params });
export const getDestination = async (id: string) => (await api.get<{ success: boolean; data: Destination }>(`/agencies/me/destinations/${id}`)).data;
export const createDestination = async (input: DestinationInput) => (await api.post<{ success: boolean; data: Destination }>('/agencies/me/destinations', input)).data;
export const updateDestination = async (id: string, input: Partial<DestinationInput>) => (await api.patch<{ success: boolean; data: Destination }>(`/agencies/me/destinations/${id}`, input)).data;
export const deleteDestination = (id: string) => api.delete(`/agencies/me/destinations/${id}`);
