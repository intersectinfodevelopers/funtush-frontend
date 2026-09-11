"use client";

/**
 * Trek detail — everything about one booking: status, payment, day-by-day
 * itinerary, guide + emergency contacts, packing list, documents, and the
 * action for this trek's stage (pay balance, go to the active screen, leave a
 * review, request cancellation).
 */

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Clock,
  Wallet,
  Phone,
  MessageSquare,
  User,
  MapPin,
  CheckCircle2,
  FileText,
  Star,
  XCircle,
  Navigation,
  Mountain,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { buildTrekViewModel, formatCountdown } from "@/lib/treks";
import { getItinerary, getPackingList } from "@/lib/mock/trek-content";
import { getEmergencyContact } from "@/lib/auth";
import {
  HubHeader,
  HubSection,
  HubCard,
  StatCard,
  StatusPill,
  hubToast,
} from "@/components/trekker/trekker-kit";
import type { RawBooking, RawPackage, RawAgency, RawGuide } from "@/types/trek";

import bookingsData from "../../../../../data/bookings.json";
import packagesData from "../../../../../data/packages.json";
import agenciesData from "../../../../../data/agencies.json";
import guidesData from "../../../../../data/guides.json";

const bookings = bookingsData as RawBooking[];
const packages = packagesData as unknown as RawPackage[];
const agencies = agenciesData as RawAgency[];
const guides = guidesData as RawGuide[];

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function TrekDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [cancelRequested, setCancelRequested] = useState(false);

  const booking = useMemo(() => bookings.find((b) => b.id === id), [id]);
  const trek = useMemo(
    () => (booking ? buildTrekViewModel(booking, packages, agencies, guides) : null),
    [booking],
  );
  const emergency = useMemo(() => getEmergencyContact(), []);

  if (!booking || !trek) {
    return (
      <HubCard className="mx-auto max-w-2xl text-center">
        <p className="text-lg font-semibold text-neutral-900">Trek not found</p>
        <p className="mt-2 text-sm text-neutral-600">
          This booking doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link
          href="/my-treks"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:underline"
        >
          ← Back to My Treks
        </Link>
      </HubCard>
    );
  }

  if (user && booking.trekker_id !== user.id) {
    return (
      <HubCard className="mx-auto max-w-2xl text-center">
        <p className="text-lg font-semibold text-neutral-900">Access denied</p>
        <p className="mt-2 text-sm text-neutral-600">This trek belongs to another account.</p>
        <Link
          href="/my-treks"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:underline"
        >
          ← Back to My Treks
        </Link>
      </HubCard>
    );
  }

  const itinerary = getItinerary(trek.packageId, trek.durationDays);
  const packing = getPackingList(trek.difficulty);
  const pillStatus = trek.category === "active" ? "active" : trek.status;
  const paid = Boolean(trek.paymentReceivedAt);
  const balanceDue = trek.status === "pending" && !paid;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <HubHeader title={trek.packageName} description={`${trek.agencyName} · ${trek.destination}`} back="/my-treks" />

      {/* Status banner */}
      <HubCard className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StatusPill status={pillStatus} />
          <span className="text-sm font-medium text-neutral-600">
            {formatCountdown(trek.daysUntilDeparture, trek.status)}
          </span>
        </div>
        {trek.category === "active" && (
          <Link
            href={`/my-treks/${trek.bookingId}/active`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
          >
            <Navigation className="h-4 w-4" /> Open trek view
          </Link>
        )}
        {balanceDue && (
          <button
            type="button"
            onClick={() => hubToast("Payment link sent to your email (mock)")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-warning-600 px-4 py-2 text-sm font-semibold text-white hover:bg-warning-700"
          >
            <Wallet className="h-4 w-4" /> Pay balance
          </button>
        )}
      </HubCard>

      {/* Key facts */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Calendar className="h-4 w-4" />} label="Departure" value={formatDate(trek.departureDate)} tone="primary" />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Duration" value={`${trek.durationDays} days`} tone="accent" />
        <StatCard icon={<Users className="h-4 w-4" />} label="Group" value={`${trek.groupSize} ${trek.groupSize === 1 ? "person" : "people"}`} tone="neutral" />
        <StatCard
          icon={<Wallet className="h-4 w-4" />}
          label="Total price"
          value={trek.totalPrice > 0 ? `$${trek.totalPrice.toLocaleString()}` : "TBD"}
          tone={paid ? "success" : balanceDue ? "warning" : "neutral"}
          hint={paid ? "Paid in full" : balanceDue && trek.paymentDueDate ? `Due ${formatDate(trek.paymentDueDate)}` : undefined}
        />
      </div>

      {/* Payment */}
      <HubSection title="Payment" icon={<Wallet className="h-4 w-4" />}>
        <div className="space-y-3 text-sm">
          <Row label="Status">
            {paid ? (
              <span className="font-semibold text-success-700">Paid on {formatDate(trek.paymentReceivedAt!)}</span>
            ) : balanceDue ? (
              <span className="font-semibold text-warning-700">
                Balance due{trek.paymentDueDate ? ` by ${formatDate(trek.paymentDueDate)}` : ""}
              </span>
            ) : (
              <span className="text-neutral-500">Awaiting agency quote</span>
            )}
          </Row>
          {trek.addOns.length > 0 && (
            <Row label="Add-ons">
              <span className="text-neutral-700">
                {trek.addOns.map((a) => `${a.name} ($${a.price})`).join(", ")}
              </span>
            </Row>
          )}
          <Row label="Receipt">
            {paid ? (
              <button
                type="button"
                onClick={() => hubToast("Receipt downloaded (mock)")}
                className="inline-flex items-center gap-1.5 font-medium text-primary-600 hover:underline"
              >
                <FileText className="h-3.5 w-3.5" /> Download receipt
              </button>
            ) : (
              <span className="text-neutral-400">Available after payment</span>
            )}
          </Row>
        </div>
      </HubSection>

      {/* Itinerary */}
      <HubSection
        title="Itinerary"
        description={`${itinerary.length} days · finalised by your guide on arrival`}
        icon={<Mountain className="h-4 w-4" />}
      >
        <ol className="space-y-0">
          {itinerary.map((d, i) => {
            const isToday = trek.category === "active" && trek.currentDay === d.day;
            const isPast = trek.category === "active" && d.day < trek.currentDay;
            return (
              <li
                key={d.day}
                className={`flex gap-4 border-l-2 py-3 pl-4 ${
                  isToday ? "border-l-primary-500" : "border-l-neutral-200"
                } ${i === 0 ? "" : "-mt-px"}`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isToday
                      ? "bg-primary-600 text-white"
                      : isPast
                        ? "bg-success-100 text-success-700"
                        : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {isPast ? <CheckCircle2 className="h-4 w-4" /> : d.day}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900">
                    Day {d.day}: {d.title}
                    {isToday && (
                      <span className="ml-2 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold uppercase text-primary-700">
                        Today
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-sm text-neutral-600">{d.description}</p>
                  {(d.altitudeM || d.distanceKm || d.nightAt) && (
                    <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-neutral-400">
                      {d.distanceKm ? <span>{d.distanceKm} km</span> : null}
                      {d.altitudeM ? <span>{d.altitudeM.toLocaleString()} m</span> : null}
                      {d.nightAt ? <span>Night at {d.nightAt}</span> : null}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </HubSection>

      {/* Guide + emergency */}
      <div className="grid gap-6 lg:grid-cols-2">
        <HubSection title="Your guide" icon={<User className="h-4 w-4" />}>
          {trek.guideId ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">{trek.guideName}</p>
                  {trek.guideLanguages.length > 0 && (
                    <p className="text-xs text-neutral-500">Speaks {trek.guideLanguages.join(", ")}</p>
                  )}
                </div>
              </div>
              {trek.guidePhone && (
                <div className="flex gap-2 border-t border-neutral-100 pt-3">
                  <a
                    href={`tel:${trek.guidePhone.replace(/\s/g, "")}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    <Phone className="h-4 w-4" /> Call
                  </a>
                  <a
                    href={`sms:${trek.guidePhone.replace(/\s/g, "")}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    <MessageSquare className="h-4 w-4" /> Message
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              Your guide will be assigned closer to departure. You&apos;ll get a notification.
            </p>
          )}
        </HubSection>

        <HubSection title="Emergency contact" icon={<Phone className="h-4 w-4" />}>
          {emergency ? (
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-neutral-900">{emergency.name}</p>
              <p className="text-neutral-600">{emergency.relationship}</p>
              <p className="text-neutral-600">{emergency.phone}</p>
              <p className="pt-2 text-xs text-neutral-400">
                Shared with your guide during active treks. Edit in{" "}
                <Link href="/profile/edit" className="text-primary-600 hover:underline">
                  your profile
                </Link>
                .
              </p>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              No emergency contact set.{" "}
              <Link href="/profile/edit" className="font-medium text-primary-600 hover:underline">
                Add one now
              </Link>
              .
            </p>
          )}
        </HubSection>
      </div>

      {/* Packing list */}
      <HubSection
        title="Packing list"
        description="Recommended — your guide gives you the final list on arrival."
        icon={<CheckCircle2 className="h-4 w-4" />}
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {packing.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-neutral-700">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-neutral-300" />
              {item}
            </li>
          ))}
        </ul>
      </HubSection>

      {/* Documents */}
      <HubSection title="Documents" icon={<FileText className="h-4 w-4" />}>
        <div className="divide-y divide-neutral-100">
          <DocRow label="Itinerary PDF" available onOpen={() => hubToast("Itinerary PDF opened (mock)")} />
          <DocRow
            label="Invoice / receipt"
            available={paid}
            onOpen={() => hubToast("Invoice downloaded (mock)")}
          />
          <DocRow label="Insurance certificate" available={false} />
        </div>
      </HubSection>

      {/* Stage-specific action */}
      {trek.category === "completed" && (
        <HubCard className="flex flex-wrap items-center justify-between gap-3 border-primary-200 bg-primary-50/50">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-primary-600" />
            <div>
              <p className="text-sm font-semibold text-neutral-900">How was this trek?</p>
              <p className="text-xs text-neutral-600">Your review helps other trekkers choose.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => hubToast("Review form opened (mock)")}
            className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
          >
            Write a review
          </button>
        </HubCard>
      )}

      {trek.category === "upcoming" && (
        <HubCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="text-sm font-semibold text-neutral-900">Need to cancel?</p>
                <p className="text-xs text-neutral-600">
                  {cancelRequested
                    ? "Request sent — the agency will contact you about the refund."
                    : "Send a cancellation request to the agency. Refunds follow their policy."}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={cancelRequested}
              onClick={() => {
                setCancelRequested(true);
                hubToast("Cancellation request sent to the agency (mock)");
              }}
              className="rounded-xl border border-danger-300 bg-white px-4 py-2 text-sm font-semibold text-danger-700 hover:bg-danger-50 disabled:opacity-50"
            >
              {cancelRequested ? "Request sent" : "Request cancellation"}
            </button>
          </div>
        </HubCard>
      )}

      {booking.reject_reason && (
        <HubCard className="border-danger-200 bg-danger-50/50">
          <p className="flex items-center gap-2 text-sm font-medium text-danger-700">
            <MapPin className="h-4 w-4" /> {booking.reject_reason}
          </p>
        </HubCard>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-neutral-500">{label}</span>
      {children}
    </div>
  );
}

function DocRow({
  label,
  available,
  onOpen,
}: {
  label: string;
  available: boolean;
  onOpen?: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="flex items-center gap-2 text-sm text-neutral-700">
        <FileText className="h-4 w-4 text-neutral-400" />
        {label}
      </span>
      {available ? (
        <button
          type="button"
          onClick={onOpen}
          className="text-sm font-medium text-primary-600 hover:underline"
        >
          Open
        </button>
      ) : (
        <span className="text-xs text-neutral-400">Not available yet</span>
      )}
    </div>
  );
}
