/**
 * Mock trek content — itineraries, packing lists, and the notification date
 * resolver. Frontend-only; keeps the page components free of hand-rolled sample
 * data.
 */

import itinerariesData from "../../../data/itineraries.json";
import type { Notification } from "@/types/user";
import type { ItineraryDay } from "@/types/trek";

const ITINERARIES = itinerariesData as Record<string, ItineraryDay[]>;

/**
 * Day-by-day plan for a package. Hand-authored where we have one, otherwise a
 * plausible generic plan so every trek detail page has something to show.
 */
export function getItinerary(packageId: string, durationDays: number): ItineraryDay[] {
  const authored = ITINERARIES[packageId];
  if (authored?.length) return authored;
  return genericItinerary(durationDays);
}

function genericItinerary(days: number): ItineraryDay[] {
  const n = Math.max(1, days);
  return Array.from({ length: n }, (_, i) => {
    const day = i + 1;
    if (day === 1)
      return { day, title: "Arrival & trek start", description: "Meet your guide, final kit check, and the first day on the trail." };
    if (day === n)
      return { day, title: "Trek ends & departure", description: "Final descent, farewell with the crew, and transfer onward." };
    if (day === Math.ceil(n / 2))
      return { day, title: "Acclimatisation day", description: "A rest day with a short hike high and a night low to adjust to the altitude." };
    return {
      day,
      title: `Day ${day} on the trail`,
      description: "A full trekking day through changing terrain, with tea-house stops and mountain views.",
    };
  });
}

/** Recommended packing, by trek difficulty band. The guide finalises the list. */
export function getPackingList(difficulty: string): string[] {
  const base = [
    "Hiking boots (broken-in) + camp shoes",
    "Trekking poles",
    "3-4 season sleeping bag",
    "Down jacket",
    "Waterproof shell (jacket + trousers)",
    "Base layers (2-3 sets)",
    "Sun hat + warm hat + gloves",
    "Headlamp + spare batteries",
    "Water bottles / bladder (3L capacity)",
    "Water purification tablets",
    "Sunscreen SPF 50+ and SPF lip balm",
    "Personal first-aid kit + blister care",
    "Power bank + charging cables",
  ];
  const d = difficulty.toLowerCase();
  if (d.includes("challenging") || d.includes("strenuous")) {
    return [
      ...base,
      "4-season sleeping bag (-15°C comfort)",
      "Insulated trousers",
      "Gaiters",
      "Diamox (consult your doctor) for altitude",
      "Crampons / microspikes (guide advises)",
    ];
  }
  if (d.includes("easy")) {
    return base.filter((x) => !x.includes("4 season") && !x.includes("crampons"));
  }
  return base;
}

/**
 * Resolve a notification's `created_at`. The mock file stores relative sentinels
 * (`"REL:-3h"`, `"REL:-2d"`) so the feed always looks current; anything else is
 * treated as a real ISO date.
 */
export function resolveNotificationDate(raw: string): string {
  const m = /^REL:(-?\d+)([hdm])$/.exec(raw);
  if (!m) return raw;
  const value = Number(m[1]);
  const unitMs = m[2] === "h" ? 3_600_000 : m[2] === "d" ? 86_400_000 : 60_000;
  return new Date(Date.now() + value * unitMs).toISOString();
}

/** Load a trekker's notifications with dates resolved, newest first. */
export function loadNotifications(
  all: Notification[],
  trekkerId: string | undefined,
): Notification[] {
  return all
    .filter((n) => !n.trekker_id || n.trekker_id === trekkerId)
    .map((n) => ({ ...n, created_at: resolveNotificationDate(n.created_at) }))
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}
