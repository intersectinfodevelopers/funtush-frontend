export type UserRole = 'agency_admin' | 'moderator' | 'trekker';


export interface RawUser {
  id: string;
  role: UserRole;
  agency_id: string | null;
  name: string;
  email: string;
  password: string;
  phone: string;
  member_since: string;
  country: string;
}


export interface SessionUser {
  id: string;
  role: UserRole;
  agency_id: string | null;
  name: string;
  email: string;
  phone: string;
  member_since: string;
  country: string;
  token: string;
  /** Set for agency users — the agency's display name. */
  agency_name?: string;
  /** For invited staff: the permission keys their role grants. Undefined = the agency owner (everything). */
  permissions?: string[];
  /** True while a platform admin is acting as this agency (a support session). */
  support?: boolean;
}

// ─── Emergency Contact ────────────────────────────────

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

// ─── Travel Preferences ───────────────────────────────

export type FitnessLevel = 'beginner' | 'moderate' | 'experienced' | 'expert';
export type TrekDifficultyPref = 'easy' | 'moderate' | 'challenging' | 'strenuous';

export interface TravelPreferences {
  fitnessLevel: FitnessLevel;
  preferredDifficulty: TrekDifficultyPref;
  dietary: string;
  languages: string[];
  roomSharing: boolean;
  newsletterOptIn: boolean;
}

// ─── Notifications ────────────────────────────────────

export type NotificationType =
  | 'booking_confirmed'
  | 'guide_assigned'
  | 'payment_reminder'
  | 'trek_reminder'
  | 'review_request'
  | 'message';

export interface Notification {
  id: string;
  trekker_id?: string;
  type: NotificationType;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  link?: string;
}