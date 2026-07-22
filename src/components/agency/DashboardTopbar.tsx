'use client';

import { useState } from 'react';
import { Bell, Search, User, ChevronDown, LogOut, Settings } from 'lucide-react';
import usersData from '../../.././data/users.json';

interface DashboardTopbarProps {
  title?: string;
}

export default function DashboardTopbar({ title = 'Dashboard' }: DashboardTopbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // fetch data from users.json
  const user = usersData[0] || { name: 'Admin', agency: 'Green Agency' };
  const agencyName = user.name || 'Green Agency';
  const userName = user.name || 'Admin';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      {/* Left side - Agency name + Page title */}
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold text-blue-600 whitespace-nowrap">
          {agencyName}
        </span>
        <span className="text-neutral-300 hidden sm:block">|</span>
        <h1 className="text-xl font-semibold text-neutral-900 hidden sm:block">
          {title}
        </h1>
      </div>

      {/* Right side - Search, Bell, User */}
      <div className="flex items-center text-black gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48  md:w-64 border border-neutral-300 rounded-lg px-3 py-1.5 pl-9 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        </div>

        {/* Notification Bell */}
        <button className="relative p-1.5 rounded-full hover:bg-neutral-100 transition-colors">
          <Bell size={20} className="text-neutral-600" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
              {initial}
            </div>
            <ChevronDown size={16} className="text-neutral-400" />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-30 py-1">
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50 transition-colors">
                  <User size={16} /> Profile
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50 transition-colors">
                  <Settings size={16} /> Settings
                </button>
                <hr className="my-1 border-neutral-200" />
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}