import { api } from '../client';

export type PackageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type Difficulty = 'EASY' | 'MODERATE' | 'CHALLENGING' | 'DIFFICULT';

export interface VolumeTier {
  minPeople: number;
  percentOff: number;
}

export const PACKAGE_CATEGORIES = ['Trekking', 'Peak Climbing', 'Cultural Tour', 'Wildlife Safari', 'Adventure Sports', 'Pilgrimage', 'Day Hike'] as const;
export const PACKAGE_CURRENCIES = [
  { code: 'NPR', label: 'NPR (Rs)' },
  { code: 'USD', label: 'USD ($)' },
  { code: 'EUR', label: 'EUR (€)' },
  { code: 'GBP', label: 'GBP (£)' },
  { code: 'INR', label: 'INR (₹)' },
] as const;

export interface ApiPackage {
  id: string;
  agencyId: string;
  title: string;
  slug: string;
  description: string | null;
  durationDays: number;
  pricePerPerson: string | number;
  difficulty: Difficulty;
  maxGroupSize: number;
  photos?: string[];
  destination?: string | null;
  category?: string | null;
  minDurationDays?: number | null;
  maxDurationDays?: number | null;
  altitudeMinM?: number | null;
  altitudeMaxM?: number | null;
  region?: string | null;
  bestTimeToVisit?: string | null;
  activities?: string[];
  routes?: string[];
  shortSummary?: string | null;
  currency?: string;
  isFeatured?: boolean;
  volumeDiscounts?: VolumeTier[];
  status: PackageStatus;
  createdAt: string;
  updatedAt: string;
  availableToAllBranches: boolean;
  countryCode: string | null;
}

export interface ApiDeparture {
  id: string;
  packageId: string;
  startDate: string;
  maxSlots: number;
  bookedSlots: number;
  status: 'AVAILABLE' | 'FULL' | 'GUARANTEED';
}

export interface ApiItineraryDay {
  id: string;
  dayNumber: number;
  location: string | null;
  description: string | null;
  altitudeM: number | null;
  photos: string[];
}

export interface ApiAddOn {
  id: string;
  name: string;
  price: string | number;
  perPerson: boolean;
}

export interface ApiPackageDetail extends ApiPackage {
  itineraries: ApiItineraryDay[];
  departureDates: ApiDeparture[];
  addOns: ApiAddOn[];
  destinations: Array<{ id: string; name: string; region: string | null }>;
}

export interface PackageListItem extends ApiPackage {
  /** Soonest upcoming departure (null when none). */
  nextDeparture: { id: string; startDate: string; maxSlots: number; bookedSlots: number } | null;
}

export type PackageSort = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'duration' | 'duration_desc' | 'title_asc' | 'title_desc';

export interface PackageList {
  data: PackageListItem[];
  meta: { total: number; page: number; limit: number; pages: number };
  /** Whole-agency counts per status, ignoring the current filter. */
  counts: Record<PackageStatus, number>;
  /** How many packages the agency had when this month began. */
  totalBeforeMonth: number;
}

export const listPackages = (params: { status?: PackageStatus; search?: string; sort?: PackageSort; page?: number; limit?: number } = {}) =>
  api.get<{ success: boolean } & PackageList>('/agencies/packages', { params });

export const getPackage = async (id: string) =>
  (await api.get<{ success: boolean; data: ApiPackageDetail }>(`/agencies/packages/${id}`)).data;

/** Seats still open on a departure. */
export const seatsLeft = (d: ApiDeparture) => Math.max(0, d.maxSlots - d.bookedSlots);

// ── Mutations ─────────────────────────────────────────────────────────────────

export interface PackageInput {
  title: string;
  description?: string;
  durationDays: number;
  pricePerPerson: number;
  difficulty: Difficulty;
  maxGroupSize: number;
  photos?: string[];
  destination?: string | null;
  category?: string | null;
  minDurationDays?: number | null;
  maxDurationDays?: number | null;
  altitudeMinM?: number | null;
  altitudeMaxM?: number | null;
  region?: string | null;
  bestTimeToVisit?: string | null;
  activities?: string[];
  routes?: string[];
  shortSummary?: string | null;
  currency?: string;
  isFeatured?: boolean;
  volumeDiscounts?: VolumeTier[];
}

export const createPackage = async (input: PackageInput) =>
  (await api.post<{ success: boolean; data: ApiPackage }>('/agencies/packages', input)).data;

/** Status is not editable here — it moves via publish / archive. */
export const updatePackage = async (id: string, input: Partial<PackageInput>) =>
  (await api.patch<{ success: boolean; data: ApiPackage }>(`/agencies/packages/${id}`, input)).data;

/** The API refuses to publish without at least one itinerary day and one departure date. */
export const publishPackage = (id: string) => api.post(`/agencies/packages/${id}/publish`);
/** PUBLISHED → DRAFT (off the site, not archived). */
/** ARCHIVED → DRAFT (the API refuses while the departure date is in the past). */
export const restorePackage = (id: string) => api.post(`/agencies/packages/${id}/restore`);
export const unpublishPackage = (id: string) => api.post(`/agencies/packages/${id}/unpublish`);
/** DELETE archives (a soft delete) — bookings keep their package. */
export const archivePackage = (id: string) => api.delete(`/agencies/packages/${id}`);
/** Removes an already-archived package for good (the API refuses if it was ever booked). */
export const deletePackagePermanently = (id: string) => api.delete(`/agencies/packages/${id}?permanent=true`);
export const duplicatePackage = async (id: string) =>
  (await api.post<{ success: boolean; data: ApiPackage }>(`/agencies/packages/${id}/duplicate`)).data;

export interface ItineraryInput {
  dayNumber: number;
  location?: string;
  description?: string;
  altitudeM?: number | null;
}
export const addItineraryDay = (pkg: string, d: ItineraryInput) => api.post(`/agencies/packages/${pkg}/itinerary`, d);
export const updateItineraryDay = (pkg: string, day: number, d: Partial<Omit<ItineraryInput, 'dayNumber'>>) =>
  api.put(`/agencies/packages/${pkg}/itinerary/${day}`, d);
export const deleteItineraryDay = (pkg: string, day: number) => api.delete(`/agencies/packages/${pkg}/itinerary/${day}`);

export const addDeparture = (pkg: string, d: { startDate: string; maxSlots: number }) => api.post(`/agencies/packages/${pkg}/dates`, d);
export const updateDeparture = (pkg: string, dateId: string, d: { startDate?: string; maxSlots?: number }) =>
  api.patch(`/agencies/packages/${pkg}/dates/${dateId}`, d);
/** Blocked by the API while the departure has bookings. */
export const deleteDeparture = (pkg: string, dateId: string) => api.delete(`/agencies/packages/${pkg}/dates/${dateId}`);

export interface AddOnInput {
  name: string;
  price: number;
  perPerson: boolean;
}
export const addAddOn = (pkg: string, a: AddOnInput) => api.post(`/agencies/packages/${pkg}/addons`, a);
export const updateAddOn = (pkg: string, id: string, a: Partial<AddOnInput>) => api.patch(`/agencies/packages/${pkg}/addons/${id}`, a);
/** Blocked by the API while a booking uses it. */
export const deleteAddOn = (pkg: string, id: string) => api.delete(`/agencies/packages/${pkg}/addons/${id}`);

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  EASY: 'Easy',
  MODERATE: 'Moderate',
  CHALLENGING: 'Challenging',
  DIFFICULT: 'Difficult',
};

export interface PackageActivityItem {
  id: string;
  packageId: string;
  packageTitle: string;
  action: 'CREATED' | 'UPDATED' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED' | 'DELETED' | 'DUPLICATED' | 'RESTORED';
  actorName: string;
  actorEmail: string | null;
  actorRole: 'OWNER' | 'STAFF' | 'SUPPORT' | 'SYSTEM';
  summary: string | null;
  createdAt: string;
  updatedAt: string;
}
export const getPackageActivity = async (id: string) =>
  (await api.get<{ success: boolean; data: PackageActivityItem[] }>(`/agencies/packages/${id}/activity`)).data;
/** The agency-wide feed; `others` hides the caller's own actions. */
export const getRecentPackageActivity = async (others = false) =>
  (await api.get<{ success: boolean; data: PackageActivityItem[] }>('/agencies/me/package-activity', { params: { limit: 10, ...(others ? { others: true } : {}) } })).data;

const ACTION_VERB: Record<PackageActivityItem['action'], string> = {
  CREATED: 'created', UPDATED: 'edited', PUBLISHED: 'published', UNPUBLISHED: 'unpublished', ARCHIVED: 'deleted', DELETED: 'permanently deleted', DUPLICATED: 'duplicated', RESTORED: 'restored',
};
export const activityVerb = (a: PackageActivityItem['action']) => ACTION_VERB[a];
export const ROLE_LABEL: Record<PackageActivityItem['actorRole'], string> = { OWNER: 'Owner', STAFF: 'Staff', SUPPORT: 'Support', SYSTEM: 'Automatic' };
