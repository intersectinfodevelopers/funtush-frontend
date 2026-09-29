'use client';

import Link from 'next/link';
import { Bell, Menu } from 'lucide-react';
import { useUnreadCount } from '@/hooks/useTrekker';

import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants/routes';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function TrekkerTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();

  const unread = useUnreadCount().data ?? 0;
  const userName = user?.name ?? 'Guest';
  const initials = getInitials(userName);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-neutral-200 bg-white px-4 sm:gap-x-6 sm:px-6 lg:px-8">
      
      {/* Mobile Menu Button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-neutral-700 md:hidden hover:bg-neutral-100 rounded-md"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator for mobile */}
      <div className="h-6 w-px bg-neutral-200 md:hidden" aria-hidden="true" />

      {/* Spacer to push items to the right */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex-1" /> {/* Empty space */}
        
        {/* Right side items */}
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Link href="/notifications" className="relative rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-500">
            <span className="sr-only">{unread > 0 ? `${unread} unread notifications` : 'Notifications'}</span>
            <Bell className="h-6 w-6" />
            {unread > 0 && <span aria-hidden className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-danger-500 px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-white">{unread > 9 ? '9+' : unread}</span>}
          </Link>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-neutral-200" aria-hidden="true" />

          {/* Profile Dropdown Trigger */}
          <Link href={ROUTES.TREKKER.PROFILE} className="flex items-center gap-x-4 hover:opacity-80 transition-opacity">
            <span className="sr-only">Your profile</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700 ring-2 ring-white">
              {initials}
            </div>
            <span className="hidden lg:flex lg:items-center">
              <span className="text-sm font-semibold leading-6 text-neutral-900" aria-hidden="true">
                {userName}
              </span>
            </span>
          </Link>

        </div>
      </div>
    </header>
  );
}