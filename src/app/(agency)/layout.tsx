/**
 * Agency Dashboard Layout
 * Sidebar + topbar layout for authenticated agency users
 */

import Link from 'next/link';

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col">
      {/* Top Navigation */}
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <h1 className="text-lg font-bold text-neutral-900">Agency Dashboard</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-neutral-200 bg-neutral-50 p-4 overflow-y-auto">
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
            >
              Overview
            </Link>
            <Link
              href="/dashboard/packages"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
            >
              Packages
            </Link>
            <Link
              href="/dashboard/bookings"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
            >
              Bookings
            </Link>
            <Link
              href="/dashboard/analytics"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
            >
              Analytics
            </Link>
            <Link
              href="/dashboard/settings"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
            >
              Settings
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
