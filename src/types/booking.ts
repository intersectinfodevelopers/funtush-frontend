/**
 * Booking Types
 */

export type BookingStatus = 'inquiry' | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';

export interface Booking {
  id: string;
  trekId: string;
  departureId: string;
  trekeerId: string;
  agencyId: string;
  status: BookingStatus;
  numberOfPeople: number;
  totalPrice: number;
  paidAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  specialRequests?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
  confirmedAt?: Date;
  departureDate: Date;
  completedAt?: Date;
  cancellationReason?: string;
  cancelledAt?: Date;
}

export interface BookingTimeline {
  bookingId: string;
  status: BookingStatus;
  timestamp: Date;
  actor: 'system' | 'agency' | 'trekker';
  message: string;
}
