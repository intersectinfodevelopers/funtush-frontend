'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Clock, Plus, ChevronDown } from 'lucide-react';
import users from '@/../data/users.json';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DashboardHeader() {
  const [isActive, setIsActive] = useState(false);
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    const updateDate = () => {
      setDate(new Date());
    };

    const timeout = setTimeout(updateDate, 1000);
    const interval = setInterval(updateDate, 60000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const user = users[0].name.split(' ')[0];
  const time = date
    ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '--:-- --';
  const dateLabel = date ? `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}` : 'Loading...';

  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Greeting */}
      <div className="shrink-0">
        <h1 className="text-lg font-medium sm:text-xl lg:text-2xl">Good Morning, {user}</h1>
        <p className="text-xs text-neutral-500 sm:text-sm">Here&apos;s what&apos;s happening with your agency today.</p>
      </div>

      {/* Weather + Time + Quick Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Weather */}
        <div className="flex h-11 items-center gap-2 rounded-lg bg-white px-3">
          <Sun size={17} className="shrink-0 text-neutral-500" />
          <div className="min-w-0 whitespace-nowrap text-xs leading-tight">
            <p className="text-neutral-700">Kathmandu, Nepal</p>
            <p>
              <span className="font-semibold">18°C</span> <span className="text-neutral-500">Cloudy</span>
            </p>
          </div>
        </div>

        {/* Time */}
        <div className="flex h-11 items-center gap-2 rounded-lg bg-white px-3">
          <Clock size={17} className="shrink-0 text-neutral-500" />
          <div className="min-w-0 whitespace-nowrap text-xs leading-tight">
            <p className="font-semibold">{time}</p>
            <p className="text-neutral-500">{dateLabel}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="relative">
          <button
            onClick={() => setIsActive((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
          >
            Quick Actions
            <ChevronDown size={16} className={`transition-transform ${isActive ? 'rotate-180' : ''}`} />
          </button>

          {isActive && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsActive(false)} />
              <div className="absolute right-0 z-20 mt-2 flex min-w-[180px] flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg">
                <Link
                  href="/dashboard/packages/new"
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium hover:bg-neutral-50"
                  onClick={() => setIsActive(false)}
                >
                  <Plus size={16} /> New Package
                </Link>
                <Link
                  href="/dashboard/blog/new"
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium hover:bg-neutral-50"
                  onClick={() => setIsActive(false)}
                >
                  <Plus size={16} /> New Blog
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
