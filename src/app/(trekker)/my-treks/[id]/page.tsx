'use client';

/**
 * Trek Detail Page
 */

import { use, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Building2,
  Package as PackageIcon,
  CheckCircle2,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils/cn';
import { buildTrekViewModel, formatCountdown } from '@/lib/treks';
import type {
  RawBooking,
  RawPackage,
  RawAgency,
  RawGuide,
} from '@/types/trek';

// Import JSON data
import bookingsData from '../../../../../data/bookings.json';
import packagesData from '../../../../../data/packages.json';
import agenciesData from '../../../../../data/agencies.json';
import guidesData from '../../../../../data/guides.json';

const bookings = bookingsData as RawBooking[];
const packages = packagesData as unknown as RawPackage[];
const agencies = agenciesData as RawAgency[];
const guides = guidesData as RawGuide[];

// ─── Status Badge Colors ────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  inquiry: 'bg-blue-100 text-blue-700',
  completed: 'bg-neutral-100 text-neutral-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-red-100 text-red-700',
};

// ─── Format Date ────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Component ──────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TrekDetailPage({ params }: PageProps) {
  
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const booking = useMemo(
    () => bookings.find((b) => b.id === id),
    [id]
  );

  const trek = useMemo(() => {
    if (!booking) return null;
    return buildTrekViewModel(booking, packages, agencies, guides);
  }, [booking]);

  const guide = useMemo(
    () => guides.find((g) => g.id === booking?.guide_id),
    [booking]
  );

  if (!booking || !trek) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
        <p className="text-lg font-medium text-neutral-900">Trek not found</p>
        <p className="mt-2 text-sm text-neutral-600">
          This booking does not exist or you do not have access.
        </p>
        <Link
          href="/my-treks"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:underline"
        >
          ← Back to My Treks
        </Link>
      </div>
    );
  }

  if (user && booking.trekker_id !== user.id) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
        <p className="text-lg font-medium text-neutral-900">Access Denied</p>
        <p className="mt-2 text-sm text-neutral-600">
          This trek belongs to another user.
        </p>
        <Link
          href="/my-treks"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:underline"
        >
          ← Back to My Treks
        </Link>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[trek.status] ?? 'bg-neutral-100 text-neutral-700';
  const countdownText = formatCountdown(trek.daysUntilDeparture, trek.status);

  const packingList = [
    'Hiking boots (broken-in)',
    'Trekking poles',
    'Sleeping bag (-10°C)',
    'Down jacket',
    'Water bottles (2L)',
    'Headlamp + batteries',
    'First aid kit',
    'Sunscreen + lip balm',
  ];

  return (
    <div className="space-y-6">

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {trek.packageName}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
              <Building2 className="h-4 w-4" />
              <span>{trek.agencyName}</span>
            </div>
          </div>

          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium capitalize',
              statusStyle
            )}
          >
            {trek.status}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700">
          <Clock className="h-4 w-4" />
          {countdownText}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <InfoCard
          icon={<Calendar className="h-5 w-5" />}
          label="Departure"
          value={formatDate(trek.departureDate)}
        />

        <InfoCard
          icon={<Clock className="h-5 w-5" />}
          label="Duration"
          value={`${trek.durationDays} days`}
        />

        <InfoCard
          icon={<Users className="h-5 w-5" />}
          label="Group Size"
          value={`${trek.groupSize} ${trek.groupSize > 1 ? 'people' : 'person'}`}
        />

        <InfoCard
          icon={<PackageIcon className="h-5 w-5" />}
          label="Total Price"
          value={`$${trek.totalPrice.toLocaleString()}`}
        />

      </div>

      
      <div className="grid gap-6 lg:grid-cols-2">

      
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-neutral-900">
            <User className="h-4 w-4" />
            Your Guide
          </h2>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">{trek.guideName}</p>
                {guide?.languages && (
                  <p className="text-xs text-neutral-500">
                    Speaks: {guide.languages.join(', ')}
                  </p>
                )}
              </div>
            </div>


            <div className="space-y-2 border-t border-neutral-100 pt-3 text-sm">
              <div className="flex items-center gap-2 text-neutral-600">
                <Phone className="h-4 w-4" />
                <span>+977-98XXXXXXXX (placeholder)</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <Mail className="h-4 w-4" />
                <span>guide@funtush.com (placeholder)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Highlights ── */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-neutral-900">
            <MapPin className="h-4 w-4" />
            Highlights
          </h2>

          {trek.highlights.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {trek.highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-neutral-700"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-neutral-500">
              No highlights available
            </p>
          )}
        </div>

      </div>

      {/* ── Packing List Placeholder ── */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-neutral-900">
          <PackageIcon className="h-4 w-4" />
          Packing List
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Recommended items (final list will be provided by your guide)
        </p>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {packingList.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-sm text-neutral-700"
            >
              <CheckCircle2 className="h-4 w-4 text-neutral-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}


function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2 text-neutral-500">
        {icon}
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 text-sm font-semibold text-neutral-900">{value}</p>
    </div>
  );
}