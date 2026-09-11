/**
 * Trek & Booking Types
 * Used by the Trekker Hub pages.
 */

export type RawBookingStatus =
  | "inquiry"
  | "pending"
  | "confirmed"
  | "cancelled"
  | "refunded"
  | "completed";

export type TrekTabCategory = "upcoming" | "active" | "completed" | "cancelled";

export interface RawBooking {
  id: string;
  package_id: string;
  trekker_id: string;
  agency_id: string;
  guide_id?: string | null;
  departure_date: string;
  group_size: number;
  add_ons: Array<{ name: string; price: number }>;
  total_price: number;
  status: RawBookingStatus;
  created_at: string;
  /** Optional richer fields the detail / payment views use. */
  payment_due_date?: string | null;
  payment_received_at?: string | null;
  check_in_at?: string | null;
  check_out_at?: string | null;
  reject_reason?: string | null;
  services?: Array<{ name: string; price: number }>;
}

export interface RawPackage {
  id: string;
  slug?: string;
  destination_slug?: string;
  agency_id: string;
  title: string;
  destination?: string;
  duration_days: number;
  price_per_person?: number;
  price_usd?: number;
  difficulty?: string;
  max_group_size?: number;
  group_size_max?: number;
  rating?: number;
  review_count?: number;
  status?: string;
  images?: string[];
  highlights?: string[];
  best_season?: string[];
  departure_dates?: string[];
  add_ons?: Array<{ name: string; price: number }>;
  included?: string[];
}

export interface RawAgency {
  id: string;
  slug: string;
  name: string;
  logo: string;
  rating: number;
  tier: string;
  destinations: string[];
  description: string;
  joined_date: string;
  status: string;
  subdomain: string;
  /** Enrichment used by discovery / compare. */
  kyc_verified?: boolean;
  safety_certified?: boolean;
  review_count?: number;
  established_year?: number;
  regions?: string[];
}

export interface RawGuide {
  id: string;
  name: string;
  photo: string;
  phone?: string;
  sex?: string;
  languages: string[];
  status: string;
  certifications: Array<{ name: string; number: string; expiry: string }>;
  rating: number;
}

/** One day of a trek itinerary (from `data/itineraries.json`, keyed by package_id). */
export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  distanceKm?: number;
  ascentM?: number;
  altitudeM?: number;
  nightAt?: string;
}

export interface TrekViewModel {
  bookingId: string;
  packageId: string;
  packageName: string;
  packageImage: string;
  destination: string;
  difficulty: string;
  agencyId: string;
  agencyName: string;
  agencyLogo: string;
  guideId: string | null;
  guideName: string;
  guidePhoto: string;
  guidePhone: string | null;
  guideLanguages: string[];
  departureDate: string;
  /** departureDate + durationDays - 1. */
  endDate: string;
  durationDays: number;
  groupSize: number;
  totalPrice: number;
  status: RawBookingStatus;
  category: TrekTabCategory;
  daysUntilDeparture: number;
  /** 1-based day the trek is on today; 0 before it starts, > durationDays after. */
  currentDay: number;
  highlights: string[];
  addOns: Array<{ name: string; price: number }>;
  paymentDueDate: string | null;
  paymentReceivedAt: string | null;
  checkInAt: string | null;
  checkOutAt: string | null;
}
