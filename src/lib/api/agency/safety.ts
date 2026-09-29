import { api } from '../client';

export interface TrekContext {
  packageTitle: string;
  dayNumber: number | null;
  totalDays: number | null;
  emergencyCountry: string | null;
  emergencyPolice: string | null;
}

export interface Incident {
  id: string;
  guideName: string | null;
  guideId: string | null;
  guidePhone: string | null;
  guideAltPhone: string | null;
  trekkerName: string;
  coordinates: { lat: number; lng: number } | null;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CANCELLED';
  triggeredAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  resolution: string | null;
  minutesSinceTriggered: number;
  acknowledged: boolean;
  acknowledgmentOverdue: boolean;
  slaMinutes: number;
  notes: Array<{ at: string; admin_id: string; note: string }>;
  timeline: Array<{ at: string; event: string; actor: string; detail?: string }>;
  /** Only populated for currently-open incidents — see safety.service.ts's withTrekContext. */
  trek: TrekContext | null;
}

export interface ActiveFeed {
  generatedAt: string;
  activeCount: number;
  overdueCount: number;
  incidents: Incident[];
}

export interface TrekRegionMatch {
  label: string;
  lat: number;
  lng: number;
}

export interface ActiveTrek {
  bookingId: string;
  trekkerName: string;
  guideId: string | null;
  guideName: string | null;
  packageTitle: string;
  dayNumber: number | null;
  totalDays: number | null;
  hasActiveSos: boolean;
  /** Approximate route location matched from the package name — not a live position. Null when nothing matched. */
  region: TrekRegionMatch | null;
}

export const fetchActive = async () => (await api.get<{ success: boolean; data: ActiveFeed }>('/agencies/me/safety/incidents/active')).data;
export const fetchHistory = async () => (await api.get<{ success: boolean; data: { count: number; incidents: Incident[] } }>('/agencies/me/safety/incidents')).data;
export const fetchActiveTreks = async () => (await api.get<{ success: boolean; data: ActiveTrek[] }>('/agencies/me/safety/active-treks')).data;
export const acknowledgeIncident = (id: string) => api.patch(`/agencies/me/safety/incidents/${id}/acknowledge`);
export const resolveIncident = (id: string, resolution: string) => api.patch(`/agencies/me/safety/incidents/${id}/resolve`, { resolution });
export const addIncidentNote = (id: string, note: string) => api.post(`/agencies/me/safety/incidents/${id}/notes`, { note });
export const exportIncident = async (id: string) => (await api.get<{ success: boolean; data: unknown }>(`/agencies/me/safety/incidents/${id}/export`)).data;
