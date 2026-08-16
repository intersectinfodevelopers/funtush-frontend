"use client";

import { useEffect, useState } from "react";
import bookingsData from "../../data/bookings.json";

export type Booking = {
  id: string;
  package_id: string;
  trekker_id: string;
  agency_id: string;
  guide_id?: string | null;
  departure_date: string;
  group_size: number;
  add_ons: { name: string; price: number }[];
  total_price: number;
  status: string;
  created_at: string;
};

export type NewBooking = Omit<Booking, "id" | "created_at">;

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>(
    bookingsData as Booking[],
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bookings");
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBookings(JSON.parse(stored) as Booking[]);
      }
    } catch {
      // Keep default bookings if localStorage is invalid
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bookings", JSON.stringify(bookings));
  }, [bookings]);

  const addBooking = (newBooking: NewBooking) => {
    const booking: Booking = {
      id: `bk-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...newBooking,
      status: newBooking.status || "inquiry",
    };

    setBookings((current) => [...current, booking]);
  };

  return { bookings, addBooking };
}
