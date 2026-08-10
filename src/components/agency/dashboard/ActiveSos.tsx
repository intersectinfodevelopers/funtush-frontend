'use client';

import Link from 'next/link';

export default function ActiveSos() {
  return (
    <section className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-3 md:p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white md:h-11 md:w-11 md:text-xs">
        SOS
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-red-600 md:text-lg">Active SOS Alert</h2>
        <p className="truncate text-xs font-medium text-neutral-600 md:text-sm">
          EBC Trek · Guide Bishal Tamang · 4:52 elapsed · 28.007°N 86.852°E
        </p>
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