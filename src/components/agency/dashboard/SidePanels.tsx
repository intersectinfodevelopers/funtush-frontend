'use client';

import Link from 'next/link';
import { BatteryFull, Plus, MessageCircle, Star, FileText, User } from 'lucide-react';
import guides from '@/../data/guides.json';

const getInitials = (name: string) => {
  const [first, last] = name.toUpperCase().split(' ');
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`;
};

export function ActiveGuides() {
  const activeGuides = guides.filter((g) => g.status === 'on_trek');

  return (
    <section className="flex flex-col gap-3 rounded-lg bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold sm:text-sm">Active Guides on Trek</h2>
        <Link href="/dashboard/guides" className="text-[11px] font-semibold text-blue-600 hover:underline">
          View All
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {activeGuides.map((guide) => (
          <div key={guide.id} className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[10px] font-semibold text-white">
                {getInitials(guide.name)}
              </div>
              <div className="min-w-0 text-xs">
                <p className="truncate font-medium">{guide.name}</p>
                <p className="text-neutral-500">Rating {guide.rating.toFixed(1)} · On trek</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> LIVE
              </span>
              <BatteryFull size={16} className="text-green-600" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const destinations = [
  { name: 'Everest Region', value: 425 },
  { name: 'Annapurna Region', value: 325 },
  { name: 'Langtang Region', value: 225 },
  { name: 'Manaslu Region', value: 125 },
  { name: 'Upper Mustang', value: 95 },
];

export function TopDestinations() {
  const max = Math.max(...destinations.map((d) => d.value));

  return (
    <section className="flex flex-col gap-3 rounded-lg bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold sm:text-sm">Top Destinations</h2>
        <select defaultValue="30" className="rounded border border-neutral-200 px-1.5 py-1 text-[10px] outline-none focus:ring-1 focus:ring-blue-500">
          <option value="30">Last 30 days</option>
        </select>
      </div>
      <div className="flex flex-col gap-2.5">
        {destinations.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="w-20 shrink-0 truncate text-[11px] font-medium sm:w-24">{d.name}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-purple-200">
              <div className="h-full rounded-full bg-purple-500" style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
            <span className="w-7 shrink-0 text-right text-[11px] font-medium">{d.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const quickStats = [
  { label: 'New Inquiries', value: 8, icon: Plus },
  { label: 'Unread Messages', value: 12, icon: MessageCircle },
  { label: 'Reviews Received', value: 24, icon: Star },
  { label: 'Blog Posts', value: 6, icon: FileText },
  { label: 'Staff On Leave', value: 3, icon: User },
];

export function QuickState() {
  return (
    <section className="flex flex-col gap-3 rounded-lg bg-white p-3 shadow-sm">
      <h2 className="text-xs font-semibold sm:text-sm">Quick Stats</h2>
      <div className="flex flex-col gap-2.5">
        {quickStats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-2.5">
            <Icon size={16} className="shrink-0 text-neutral-400" />
            <span className="flex-1 text-[11px] font-semibold sm:text-xs">{label}</span>
            <span className="text-[11px] font-semibold sm:text-xs">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}