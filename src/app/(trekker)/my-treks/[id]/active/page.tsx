"use client";

/**
 * Active Trek — the field screen for a trek that is currently under way.
 * Progress, today's stage, guide contact, an SOS button, emergency numbers,
 * and check-in status.
 */

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  Phone,
  MessageSquare,
  ShieldAlert,
  MapPin,
  Navigation,
  CheckCircle2,
  Circle,
  Radio,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { buildTrekViewModel } from "@/lib/treks";
import { getItinerary } from "@/lib/mock/trek-content";
import { getEmergencyContact } from "@/lib/auth";
import { HubHeader, HubCard, HubSection, hubToast } from "@/components/trekker/trekker-kit";
import { cn } from "@/lib/utils/cn";
import type { RawBooking, RawPackage, RawAgency, RawGuide } from "@/types/trek";

import bookingsData from "../../../../../../data/bookings.json";
import packagesData from "../../../../../../data/packages.json";
import agenciesData from "../../../../../../data/agencies.json";
import guidesData from "../../../../../../data/guides.json";
import emergencyData from "../../../../../../data/emergency-numbers.json";

const bookings = bookingsData as RawBooking[];
const packages = packagesData as unknown as RawPackage[];
const agencies = agenciesData as RawAgency[];
const guides = guidesData as RawGuide[];
const emergencyNumbers = emergencyData as {
  country: string;
  numbers: Array<{ label: string; number: string; note: string }>;
};

export default function ActiveTrekPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [sosArmed, setSosArmed] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  const booking = useMemo(() => bookings.find((b) => b.id === id), [id]);
  const trek = useMemo(
    () => (booking ? buildTrekViewModel(booking, packages, agencies, guides) : null),
    [booking],
  );
  const emergencyContact = useMemo(() => getEmergencyContact(), []);

  if (!booking || !trek || (user && booking.trekker_id !== user.id)) {
    return (
      <HubCard className="mx-auto max-w-2xl text-center">
        <p className="text-lg font-semibold text-neutral-900">Trek not found</p>
        <Link href="/my-treks" className="mt-4 inline-block text-sm font-medium text-primary-600 hover:underline">
          ← Back to My Treks
        </Link>
      </HubCard>
    );
  }

  if (trek.category !== "active") {
    return (
      <HubCard className="mx-auto max-w-2xl text-center">
        <p className="text-lg font-semibold text-neutral-900">This trek isn&apos;t active</p>
        <p className="mt-2 text-sm text-neutral-600">
          The live trek view opens once you&apos;ve checked in on departure day.
        </p>
        <Link
          href={`/my-treks/${trek.bookingId}`}
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:underline"
        >
          ← Back to trek details
        </Link>
      </HubCard>
    );
  }

  const itinerary = getItinerary(trek.packageId, trek.durationDays);
  const currentDay = Math.min(trek.currentDay, trek.durationDays);
  const pct = Math.round((currentDay / trek.durationDays) * 100);
  const today = itinerary.find((d) => d.day === currentDay);
  const tomorrow = itinerary.find((d) => d.day === currentDay + 1);

  const triggerSos = () => {
    if (!sosArmed) {
      setSosArmed(true);
      window.setTimeout(() => setSosArmed(false), 4000);
      return;
    }
    setSosSent(true);
    setSosArmed(false);
    hubToast("SOS sent to your agency and emergency contact", "success");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <HubHeader
        title={trek.packageName}
        description={`${trek.agencyName} · Day ${currentDay} of ${trek.durationDays}`}
        back={`/my-treks/${trek.bookingId}`}
      />

      {/* Progress */}
      <HubCard>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-neutral-900">Trek progress</span>
          <span className="text-neutral-500">{pct}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-neutral-600">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
          </span>
          <Radio className="h-3.5 w-3.5" /> Live tracking on · last position shared 12 min ago
        </div>
      </HubCard>

      {/* SOS */}
      <HubCard className={cn(sosSent ? "border-success-300 bg-success-50/60" : "border-danger-200 bg-danger-50/40")}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className={cn("mt-0.5 h-6 w-6", sosSent ? "text-success-600" : "text-danger-600")} />
            <div>
              <p className="text-sm font-bold text-neutral-900">
                {sosSent ? "SOS sent" : "Emergency SOS"}
              </p>
              <p className="text-xs text-neutral-600">
                {sosSent
                  ? "Your agency's 24h line and your emergency contact have been alerted with your location."
                  : sosArmed
                    ? "Tap again to confirm — this alerts your agency and emergency contact."
                    : "Alerts your agency and your emergency contact with your last known location."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={triggerSos}
            disabled={sosSent}
            className={cn(
              "rounded-xl px-5 py-2.5 text-sm font-bold text-white transition disabled:opacity-60",
              sosSent ? "bg-success-600" : sosArmed ? "bg-danger-700 animate-pulse" : "bg-danger-600 hover:bg-danger-700",
            )}
          >
            {sosSent ? "Sent" : sosArmed ? "Confirm SOS" : "SOS"}
          </button>
        </div>
      </HubCard>

      {/* Today / tomorrow */}
      <div className="grid gap-6 sm:grid-cols-2">
        <HubSection title="Today" icon={<Navigation className="h-4 w-4" />}>
          {today ? (
            <>
              <p className="text-sm font-semibold text-neutral-900">Day {today.day}: {today.title}</p>
              <p className="mt-1 text-sm text-neutral-600">{today.description}</p>
              {(today.distanceKm || today.altitudeM || today.nightAt) && (
                <p className="mt-2 flex flex-wrap gap-x-3 text-xs text-neutral-400">
                  {today.distanceKm ? <span>{today.distanceKm} km</span> : null}
                  {today.altitudeM ? <span>{today.altitudeM.toLocaleString()} m</span> : null}
                  {today.nightAt ? <span>Night at {today.nightAt}</span> : null}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-neutral-500">Rest day — follow your guide&apos;s plan.</p>
          )}
        </HubSection>

        <HubSection title="Tomorrow" icon={<MapPin className="h-4 w-4" />}>
          {tomorrow ? (
            <>
              <p className="text-sm font-semibold text-neutral-900">Day {tomorrow.day}: {tomorrow.title}</p>
              <p className="mt-1 text-sm text-neutral-600">{tomorrow.description}</p>
            </>
          ) : (
            <p className="text-sm text-neutral-500">Last day — you&apos;re almost there.</p>
          )}
        </HubSection>
      </div>

      {/* Guide */}
      <HubSection title="Your guide" icon={<Phone className="h-4 w-4" />}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-neutral-900">{trek.guideName}</p>
            {trek.guideLanguages.length > 0 && (
              <p className="text-xs text-neutral-500">Speaks {trek.guideLanguages.join(", ")}</p>
            )}
          </div>
          {trek.guidePhone && (
            <div className="flex gap-2">
              <a
                href={`tel:${trek.guidePhone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
              >
                <Phone className="h-4 w-4" /> Call
              </a>
              <a
                href={`sms:${trek.guidePhone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <MessageSquare className="h-4 w-4" /> Message
              </a>
            </div>
          )}
        </div>
      </HubSection>

      {/* Emergency numbers */}
      <HubSection
        title={`Emergency numbers · ${emergencyNumbers.country}`}
        icon={<ShieldAlert className="h-4 w-4" />}
      >
        <ul className="divide-y divide-neutral-100">
          {emergencyNumbers.numbers.map((n) => (
            <li key={n.label} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-800">{n.label}</p>
                <p className="truncate text-xs text-neutral-500">{n.note}</p>
              </div>
              <a
                href={`tel:${n.number.replace(/[^\d+]/g, "")}`}
                className="shrink-0 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                {n.number}
              </a>
            </li>
          ))}
          {emergencyContact && (
            <li className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-800">
                  {emergencyContact.name} <span className="font-normal text-neutral-400">· your contact</span>
                </p>
                <p className="truncate text-xs text-neutral-500">{emergencyContact.relationship}</p>
              </div>
              <a
                href={`tel:${emergencyContact.phone.replace(/[^\d+]/g, "")}`}
                className="shrink-0 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                {emergencyContact.phone}
              </a>
            </li>
          )}
        </ul>
      </HubSection>

      {/* Check-in status */}
      <HubSection title="Check-in" icon={<CheckCircle2 className="h-4 w-4" />}>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            {trek.checkInAt ? (
              <CheckCircle2 className="h-4 w-4 text-success-600" />
            ) : (
              <Circle className="h-4 w-4 text-neutral-300" />
            )}
            <span className={trek.checkInAt ? "text-neutral-700" : "text-neutral-400"}>
              Checked in{" "}
              {trek.checkInAt
                ? `on ${new Date(trek.checkInAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : "— pending"}
            </span>
          </li>
          <li className="flex items-center gap-2">
            {trek.checkOutAt ? (
              <CheckCircle2 className="h-4 w-4 text-success-600" />
            ) : (
              <Circle className="h-4 w-4 text-neutral-300" />
            )}
            <span className={trek.checkOutAt ? "text-neutral-700" : "text-neutral-400"}>
              Checked out {trek.checkOutAt ? "" : "— on completion"}
            </span>
          </li>
        </ul>
      </HubSection>
    </div>
  );
}
