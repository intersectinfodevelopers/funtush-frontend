import { api } from '../client';

/** The flat, snake_case booking shape the dashboard widgets render (see toUiBooking). */
export interface Booking {
  id: string;
  package_id: string;
  trekker_id: string;
  agency_id: string;
  guide_id: string | null;
  departure_date: string;
  group_size: number;
  add_ons: { name: string; price: number }[];
  total_price: number;
  status: string;
  created_at: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
}

/** A booking exactly as GET /bookings returns it (Prisma row + joined package/departure). */
export interface ApiBooking {
  id: string;
  agencyId: string;
  trekkerId: string | null;
  packageId: string;
  departureDateId: string;
  groupSize: number;
  totalPrice: string | number; // Decimal serialises as a string
  status: ApiBookingStatus;
  trekkerName: string;
  trekkerEmail: string;
  trekkerPhone: string;
  trekkerCountry: string | null;
  specialRequests: string | null;
  rejectionReason: string | null;
  proposedDate: string | null;
  assignedGuideId: string | null;
  createdAt: string;
  updatedAt: string;
  package?: { title: string; slug: string; currency?: string } | null;
  departureDate?: { startDate: string } | null;
  addOns?: Array<{ name?: string; price?: string | number; addOn?: { name: string; price: string | number } }>;
}

export type ApiBookingStatus =
  | 'INQUIRY' | 'CONFIRMED' | 'PAYMENT_PENDING' | 'REJECTED'
  | 'ALTERNATIVE_PROPOSED' | 'PAID' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface BookingList {
  bookings: ApiBooking[];
  total: number;
  page: number;
  limit: number;
}

export interface BookingListParams {
  /** One status or several, comma-separated. */
  status?: string;
  /** Trekker name / email. */
  search?: string;
  /** Departure date range, YYYY-MM-DD. */
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export async function listBookings(params: BookingListParams = {}): Promise<BookingList> {
  const res = await api.get<{ success: boolean; data: BookingList }>('/bookings', { params });
  return res.data;
}

/** The dashboard's coarse buckets over the API's 9 statuses. */
export type BookingBucket = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export function bucketOf(status: ApiBookingStatus): BookingBucket {
  switch (status) {
    case 'COMPLETED':
      return 'completed';
    case 'CANCELLED':
    case 'REJECTED':
      return 'cancelled';
    case 'CONFIRMED':
    case 'PAID':
    case 'ACTIVE':
      return 'confirmed';
    default:
      return 'pending'; // INQUIRY, PAYMENT_PENDING, ALTERNATIVE_PROPOSED
  }
}

const num = (v: string | number | undefined | null) => (v === undefined || v === null ? 0 : Number(v));

/**
 * Adapts an API booking to the shape the dashboard components were built on
 * (snake_case, lower-case status), so pages/widgets keep working unchanged.
 */
export function toUiBooking(b: ApiBooking): Booking & { package_title?: string; trekker_name: string } {
  return {
    id: b.id,
    package_id: b.packageId,
    trekker_id: b.trekkerId ?? '',
    agency_id: b.agencyId,
    guide_id: b.assignedGuideId,
    departure_date: b.departureDate?.startDate ?? '',
    group_size: b.groupSize,
    add_ons: (b.addOns ?? []).map((a) => ({
      name: a.addOn?.name ?? a.name ?? 'Add-on',
      price: num(a.addOn?.price ?? a.price),
    })),
    total_price: num(b.totalPrice),
    status: b.status.toLowerCase(),
    created_at: b.createdAt,
    guest_name: b.trekkerName,
    guest_email: b.trekkerEmail,
    guest_phone: b.trekkerPhone,
    package_title: b.package?.title,
    trekker_name: b.trekkerName,
  };
}

// ── Single booking + workflow actions ─────────────────────────────────────────

export interface ApiBookingDetail extends ApiBooking {
  paymentLink?: { urlToken?: string | null; expiresAt?: string | null; status?: string | null } | null;
}

export const getBooking = async (id: string) =>
  (await api.get<{ success: boolean; data: ApiBookingDetail }>(`/bookings/${id}`)).data;

/**
 * The booking state machine, as the API enforces it:
 *   INQUIRY ─accept→ PAYMENT_PENDING ─(trekker pays)→ PAID ─confirm→ CONFIRMED ─check-in→ ACTIVE ─check-out→ COMPLETED
 *   INQUIRY ─reject→ REJECTED · INQUIRY ─propose-date→ ALTERNATIVE_PROPOSED
 *   PAYMENT_PENDING | PAID | CONFIRMED | ACTIVE ─cancel→ CANCELLED (releases the seats)
 *   guide assignment is allowed only while CONFIRMED.
 */
export type BookingAction = 'accept' | 'reject' | 'propose-date' | 'confirm' | 'cancel' | 'assign-guide' | 'check-in' | 'check-out' | 'set-stage';

export async function bookingAction<T = unknown>(id: string, action: BookingAction, body?: Record<string, unknown>) {
  return (await api.patch<{ success: boolean; data: T }>(`/bookings/${id}/${action}`, body ?? {})).data;
}

export interface AcceptResult {
  bookingId: string;
  status: 'PAYMENT_PENDING';
  paymentUrl: string;
  expiresAt: string;
}

/** Which actions the API allows from each status — drives which buttons the page shows. */
export function allowedActions(status: ApiBookingStatus): BookingAction[] {
  switch (status) {
    case 'INQUIRY':
      return ['accept', 'propose-date', 'reject'];
    case 'PAYMENT_PENDING':
      return ['cancel'];
    case 'PAID':
      return ['confirm', 'cancel'];
    case 'CONFIRMED':
      return ['assign-guide', 'check-in', 'cancel'];
    case 'ACTIVE':
      return ['check-out', 'cancel'];
    default:
      return []; // ALTERNATIVE_PROPOSED (waiting on the traveller), COMPLETED, CANCELLED, REJECTED
  }
}

// ── Manual (phone / walk-in) booking ──────────────────────────────────────────

export interface ManualBookingInput {
  packageId: string;
  departureDateId: string;
  groupSize: number;
  trekkerName: string;
  trekkerEmail: string;
  trekkerPhone: string;
  trekkerCountry?: string;
  specialRequests?: string;
  addOnIds?: string[];
  /** Defaults to CONFIRMED on the API. */
  status?: 'CONFIRMED' | 'INQUIRY';
}

export const createManualBooking = async (input: ManualBookingInput) =>
  (await api.post<{ success: boolean; data: { id: string } }>('/bookings', input)).data;
