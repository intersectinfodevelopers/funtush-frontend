'use client';

import Link from 'next/link';
import { useActiveIncidents } from '@/hooks/useAgencyDashboard';

/**
 * Shows only when this agency has a real ACTIVE / ACKNOWLEDGED SOS incident.
 * (It used to render a permanent fake "EBC Trek · Guide Bishal Tamang" alert on
 * every account — a false emergency banner is worse than none.)
 */
export default function ActiveSos() {
  const { data } = useActiveIncidents();
  if (!data || data.activeCount === 0) return null;

  const first = data.incidents[0];
  const detail = [
    first?.trekkerName && `Trekker ${first.trekkerName}`,
    first?.guideName && `Guide ${first.guideName}`,
    first?.minutesSinceTriggered != null && `${first.minutesSinceTriggered} min ago`,
    first?.coordinates && `${first.coordinates.lat.toFixed(3)}°N ${first.coordinates.lng.toFixed(3)}°E`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <section role="alert" className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-3 md:p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white md:h-11 md:w-11 md:text-xs">
        SOS
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-red-600 md:text-lg">
          {data.activeCount} Active SOS Alert{data.activeCount === 1 ? '' : 's'}
          {data.overdueCount > 0 && ` · ${data.overdueCount} overdue`}
        </h2>
        <p className="truncate text-xs font-medium text-neutral-600 md:text-sm">{detail || 'Open the alert for details'}</p>
      </div>
      <Link
        href="/dashboard/safety"
        className="ml-auto shrink-0 whitespace-nowrap rounded-md border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-100"
      >
        View Alert →
      </Link>
    </section>
  );
}
