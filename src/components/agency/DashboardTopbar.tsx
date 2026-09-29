'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  User,
  ChevronDown,
  LogOut,
  Settings,
  Menu,
  CalendarCheck,
  Package,
  AlertTriangle,
  DollarSign,
  Star,
  UserPlus,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAgencyNotifications, type AgencyNotification } from '@/hooks/useAgencyNotifications';

interface DashboardTopbarProps {
  onMenuClick: () => void;
}

const notificationStyles: Record<AgencyNotification['type'], { icon: React.ElementType; bg: string; color: string }> = {
  sos: { icon: AlertTriangle, bg: 'bg-red-100', color: 'text-red-600' },
  booking: { icon: CalendarCheck, bg: 'bg-blue-100', color: 'text-blue-600' },
  payment: { icon: DollarSign, bg: 'bg-green-100', color: 'text-green-600' },
  review: { icon: Star, bg: 'bg-amber-100', color: 'text-amber-600' },
  guide: { icon: UserPlus, bg: 'bg-indigo-100', color: 'text-indigo-600' },
  package: { icon: Package, bg: 'bg-violet-100', color: 'text-violet-600' },
  blog: { icon: FileText, bg: 'bg-sky-100', color: 'text-sky-600' },
};

export default function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, markAsRead, markAllAsRead, markAllSeen, badgeCount } = useAgencyNotifications();
  const { user: sessionUser } = useAuth();

  const unreadCount = notifications.filter((n) => !n.read).length; // highlighted in the list
  const opening = () => {
    if (!showNotifications) markAllSeen();
    setShowNotifications((prev) => !prev);
  };

  // The signed-in account (this used to be the first entry of a mock users file).
  const userName = sessionUser?.name ?? '';
  const userRole = sessionUser?.support ? 'Support session' : sessionUser?.role === 'agency_admin' ? 'Agency Admin' : 'Staff';
  const initial = (userName || '?').charAt(0).toUpperCase();
  const avatarUrl: string | null = null;

  return (
    <header className="bg-white border-b border-neutral-200 px-3 sm:px-6 h-16 flex items-center justify-between w-full shadow-sm">
      {/* Left side - Hamburger + Search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} className="text-neutral-700" />
        </button>

        <div className="relative w-full max-w-xs hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-3 py-2 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <button className="sm:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors" aria-label="Search">
          <Search size={19} className="text-neutral-600" />
        </button>
      </div>

      {/* Right side - Bell, User */}
      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={opening}
            className="relative p-2 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={19} className="text-neutral-600" />
            {badgeCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white ring-2 ring-white">
                {badgeCount > 9 ? '9+' : badgeCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-[320px] sm:w-[360px] bg-white border border-neutral-200 rounded-lg shadow-lg z-30 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                  <h3 className="text-sm font-semibold text-neutral-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-neutral-400">No notifications yet</p>
                  ) : (
                    notifications.map((n) => {
                      const { icon: Icon, bg, color } = notificationStyles[n.type];
                      return (
                        <button
                          key={n.id}
                          onClick={() => { markAsRead(n.id); if (n.href) { setShowNotifications(false); router.push(n.href); } }}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50 ${
                            !n.read ? 'bg-blue-50/60' : ''
                          }`}
                        >
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}>
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-neutral-900">{n.title}</p>
                            <p className="mt-0.5 text-xs text-neutral-500 line-clamp-2">{n.description}</p>
                            <p className="mt-1 text-[11px] text-neutral-400">{n.time}</p>
                          </div>
                          {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-neutral-100 px-4 py-2.5 text-center">
                  <button className="text-xs font-semibold text-blue-600 hover:underline">
                    See all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <span className="hidden sm:block w-px h-8 bg-neutral-200 mx-1" />

        {/* User Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="flex items-center gap-2 p-1 pr-1 sm:pr-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-sm font-semibold text-neutral-900">{userName}</p>
              <p className="text-xs text-neutral-500">{userRole}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium overflow-hidden shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <ChevronDown size={16} className="hidden sm:block text-neutral-400" />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-30 py-1">
                <div className="px-4 py-2 sm:hidden border-b border-neutral-100 mb-1">
                  <p className="text-sm font-semibold text-neutral-900">{userName}</p>
                  <p className="text-xs text-neutral-500">{userRole}</p>
                </div>
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