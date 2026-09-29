'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingAction, getBooking, type BookingAction } from '@/lib/api/agency/bookings';
import { fetchGuides } from '@/lib/api/agency/dashboard';
import { listAssignableGuides } from '@/lib/api/agency/guides';

export const useBooking = (id: string) => useQuery({ queryKey: ['agency', 'booking', id], queryFn: () => getBooking(id), enabled: Boolean(id) });

/** Guides an agency can assign (active ones). The API identifies a guide on a booking by `guideRef`. */
export const useAssignableGuides = () =>
  useQuery({ queryKey: ['agency', 'guides', 'all'], queryFn: () => fetchGuides(), staleTime: 60_000 });

/** Every booking action refreshes the booking itself, all booking lists, and the dashboard counts. */
export function useBookingAction(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ action, body }: { action: BookingAction; body?: Record<string, unknown> }) => bookingAction(id, action, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['agency', 'booking', id] });
      void qc.invalidateQueries({ queryKey: ['agency', 'bookings'] });
      void qc.invalidateQueries({ queryKey: ['agency', 'summary'] });
      void qc.invalidateQueries({ queryKey: ['agency', 'guides'] });
    },
  });
}

/** Guides for THIS booking's trek, each flagged assignable or busy (with the reason). */
export const useGuidesForTrek = (departureDateId: string | undefined, bookingId: string, enabled: boolean) =>
  useQuery({ queryKey: ['agency', 'guides', 'assignable', departureDateId, bookingId], queryFn: () => listAssignableGuides(departureDateId!, bookingId), enabled: Boolean(departureDateId) && enabled });
