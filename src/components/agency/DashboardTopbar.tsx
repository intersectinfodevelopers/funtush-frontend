'use client';

import { useState } from 'react';

interface DashboardTopbarProps {
  title?: string;
}

export default function DashboardTopbar({ title = 'Dashboard' }: DashboardTopbarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      {/* Left side - Page title */}
      <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>

      {/* Right side - Search and user */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 md:w-64 border border-neutral-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">🔍</span>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
            A
          </div>
          <span className="text-sm font-medium hidden md:block">Admin</span>
        </div>
      </div>
    </header>
  );
}