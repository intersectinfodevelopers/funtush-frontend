/**
 * Trek Helpers — join the mock JSON sources into the shape the Trekker Hub renders.
 */
import type {
  RawBooking,
  RawPackage,
  RawAgency,
  RawGuide,
  TrekViewModel,
  TrekTabCategory,
  RawBookingStatus,
} from "@/types/trek";

/** Decide which tab a booking belongs to. */
export function getCategoryFromBooking(
  status: RawBookingStatus,
  departureDate: string,
  durationDays: number,
): TrekTabCategory {
  if (status === "completed") return "completed";
  if (status === "cancelled" || status === "refunded") return "cancelled";

  const today = new Date();
  const departure = new Date(departureDate);
  const tripEnd = new Date(departure);
  tripEnd.setDate(tripEnd.getDate() + durationDays);

  if (today >= departure && today <= tripEnd && status === "confirmed") return "active";
  return "upcoming";
}

/** Whole days from today (00:00) until the departure date. Negative once it has passed. */
export function getDaysUntilDeparture(departureDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const departure = new Date(departureDate);
  departure.setHours(0, 0, 0, 0);
  return Math.round((departure.getTime() - today.getTime()) / 86_400_000);
}

/**
 * 1-based day the trek is on today. `0` before it starts, `durationDays + 1` or
 * more once it is over — so callers can clamp for a progress bar.
 */
export function getCurrentDay(departureDate: string, durationDays: number): number {
  const elapsed = -getDaysUntilDeparture(departureDate);
  if (elapsed < 0) return 0;
  return Math.min(elapsed + 1, durationDays + 1);
}

/** Human countdown string for a booking. */
export function formatCountdown(days: number, status: RawBookingStatus): string {
  if (status === "completed") return "Trek completed";
  if (status === "cancelled" || status === "refunded") return "Cancelled";
  if (days < 0) return `Departed ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
  if (days === 0) return "Departing today";
  if (days === 1) return "Departing tomorrow";
  return `Departing in ${days} days`;
}

/** departureDate + (durationDays - 1), ISO date only. */
export function trekEndDate(departureDate: string, durationDays: number): string {
  const end = new Date(departureDate);
  end.setDate(end.getDate() + Math.max(0, durationDays - 1));
  return end.toISOString().slice(0, 10);
}

/** Build a TrekViewModel by joining all mock data sources. */
export function buildTrekViewModel(
  booking: RawBooking,
  packages: RawPackage[],
  agencies: RawAgency[],
  guides: RawGuide[],
): TrekViewModel {
  const pkg = packages.find((p) => p.id === booking.package_id);
  const agency = agencies.find((a) => a.id === booking.agency_id);
  const guide = guides.find((g) => g.id === booking.guide_id);

  const durationDays = pkg?.duration_days ?? 0;
  const category = getCategoryFromBooking(booking.status, booking.departure_date, durationDays);

  return {
    bookingId: booking.id,
    packageId: booking.package_id,
    packageName: pkg?.title ?? "Unknown package",
    packageImage: pkg?.images?.[0] ?? "",
    destination: pkg?.destination ?? pkg?.destination_slug ?? "Nepal",
    difficulty: pkg?.difficulty ?? "moderate",
    agencyId: booking.agency_id,
    agencyName: agency?.name ?? "Unknown agency",
    agencyLogo: agency?.logo ?? "",
    guideId: guide?.id ?? null,
    guideName: guide?.name ?? "Guide to be assigned",
    guidePhoto: guide?.photo ?? "",
    guidePhone: guide?.phone ?? null,
    guideLanguages: guide?.languages ?? [],
    departureDate: booking.departure_date,
    endDate: trekEndDate(booking.departure_date, durationDays),
    durationDays,
    groupSize: booking.group_size,
    totalPrice: booking.total_price,
    status: booking.status,
    category,
    daysUntilDeparture: getDaysUntilDeparture(booking.departure_date),
    currentDay: getCurrentDay(booking.departure_date, durationDays),
    highlights: pkg?.highlights ?? [],
    addOns: booking.add_ons ?? [],
    paymentDueDate: booking.payment_due_date ?? null,
    paymentReceivedAt: booking.payment_received_at ?? null,
    checkInAt: booking.check_in_at ?? null,
    checkOutAt: booking.check_out_at ?? null,
  };
}

/** Get all treks for a user, fully populated, newest departure first. */
export function getUserTreks(
  userId: string,
  bookings: RawBooking[],
  packages: RawPackage[],
  agencies: RawAgency[],
  guides: RawGuide[],
): TrekViewModel[] {
  return bookings
    .filter((b) => b.trekker_id === userId)
    .map((b) => buildTrekViewModel(b, packages, agencies, guides))
    .sort((a, b) => (a.departureDate < b.departureDate ? 1 : -1));
}
