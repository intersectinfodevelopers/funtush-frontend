/**
 * Trek & Booking Types
 * Used by trekker hub pages
 */

export type RawBookingStatus = |'inquery'|'pending'|'confirmed'|'cancelled'|'refunded'| 'completed';

export type TrekTabCategory = 'upcoming' | 'active' | 'completed' | 'cancelled' ;

export interface RawBooking {
  id: string;
  package_id: string;
  trekker_id: string;
  agency_id: string;
  guide_id: string;
  departure_date: string;
  group_size: number;
  add_ons: Array<{ name: string; price: number }>;
  total_price: number;
  status: RawBookingStatus;
  created_at: string;
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
}

export interface RawGuide {
  id: string;
  name: string;
  photo: string;
  languages: string[];
  status: string;
  certifications: Array<{ name: string; number: string; expiry: string }>;
  rating: number;
}

export interface TrekViewModel {
  bookingId: string;
  packageId: string;
  packageName: string;
  packageImage: string;
  agencyName: string;
  agencyLogo: string;
  guideName: string;
  guidePhoto: string;
  departureDate: string;
  durationDays: number;
  groupSize: number;
  totalPrice: number;
  status: RawBookingStatus;
  category: TrekTabCategory;
  daysUntilDeparture: number;
  highlights: string[];
}