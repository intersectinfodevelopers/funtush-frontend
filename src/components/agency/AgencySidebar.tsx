'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  CalendarCheck,
  Users,
  Briefcase,
  GitBranch,
  Newspaper,
  DollarSign,
  BarChart3,
  UserCog,
  Shield,
  MapPin,
  User,
  Settings,
  LifeBuoy,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';
import SubscriptionBanner from './SubscriptionBanner';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  section?: 'main' | 'operations' | 'account';
  tier?: 'free' | 'medium' | 'large';
}

const navItems: NavItem[] = [
  // Main section
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} />, section: 'main' },
  { label: 'Packages', href: '/dashboard/packages', icon: <Package size={20} />, section: 'main' },
  { label: 'Booking Approval', href: '/dashboard/bookings', icon: <CalendarCheck size={20} />, section: 'main' },
  { label: 'Customers', href: '/dashboard/customers', icon: <Users size={20} />, section: 'main' },
  { label: 'Guides', href: '/dashboard/guides', icon: <Briefcase size={20} />, section: 'main' },
  { label: 'Blog', href: '/dashboard/blog', icon: <Newspaper size={20} />, section: 'main', },
  
  // Operations section
  { label: 'Finance', href: '/dashboard/finance', icon: <DollarSign size={20} />, section: 'operations' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: <BarChart3 size={20} />, section: 'operations' },
  { label: 'Staff & Roles', href: '/dashboard/staff', icon: <UserCog size={20} />, section: 'operations' },
  { label: 'Branches', href: '/dashboard/branches', icon: <GitBranch size={20} />, section: 'operations' },
  { label: 'Safety', href: '/dashboard/safety', icon: <Shield size={20} />, section: 'operations' },
  { label: 'Destinations', href: '/dashboard/destinations', icon: <MapPin size={20} />, section: 'operations' },
  
  // Account section
  { label: 'Profile', href: '/dashboard/profile', icon: <User size={20} />, section: 'account' },
  { label: 'Settings', href: '/dashboard/settings', icon: <Settings size={20} />, section: 'account' },
  { label: 'API Keys', href: '/dashboard/api-keys', icon: <Lock size={20} />, section: 'account', tier: 'large' },
  { label: 'Support', href: '/dashboard/support', icon: <LifeBuoy size={20} />, section: 'account' },
];

const isTierLocked = (tier?: string) => {
  const userTier = 'free'; // Mock – replace with real tier from context
  if (!tier) return false;
  if (tier === 'medium' && userTier === 'free') return true;
  if (tier === 'large' && (userTier === 'free' || userTier === 'medium')) return true;
  return false;
};

export default function AgencySidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Mock tier – replace with real data from context
  const userTier = 'free';

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const mainItems = navItems.filter(item => item.section === 'main');
  const operationsItems = navItems.filter(item => item.section === 'operations');
  const accountItems = navItems.filter(item => item.section === 'account');

  return (
    <aside className={`bg-white border-r border-neutral-200 h-screen sticky top-0 overflow-y-auto transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo / Agency Name */}
      <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-xl font-bold text-blue-600 whitespace-nowrap">
            {isCollapsed ? 'GA' : 'Green Agency'}
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded hover:bg-neutral-100 transition-colors shrink-0"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="p-3 space-y-6">
        {/* Main Section */}
        <div>
          {!isCollapsed && (
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">
              Main
            </p>
          )}
          <div className="space-y-1">
            {mainItems.map((item) => {
              const locked = isTierLocked(item.tier);
              return (
                <button
                  key={item.href}
                  onClick={() => !locked && router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive(item.href) && !locked
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : locked
                      ? 'text-neutral-400 cursor-not-allowed opacity-60'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                  disabled={locked}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {locked && <Lock size={14} className="text-neutral-400 shrink-0" />}
                    </>
                  )}
                  {isCollapsed && locked && (
                    <Lock size={14} className="text-neutral-400 absolute right-1 top-1/2 -translate-y-1/2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Operations Section */}
        <div>
          {!isCollapsed && (
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">
              Operations
            </p>
          )}
          <div className="space-y-1">
            {operationsItems.map((item) => {
              const locked = isTierLocked(item.tier);
              return (
                <button
                  key={item.href}
                  onClick={() => !locked && router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive(item.href) && !locked
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : locked
                      ? 'text-neutral-400 cursor-not-allowed opacity-60'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                  disabled={locked}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {locked && <Lock size={14} className="text-neutral-400 shrink-0" />}
                    </>
                  )}
                  {isCollapsed && locked && (
                    <Lock size={14} className="text-neutral-400 absolute right-1 top-1/2 -translate-y-1/2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Account Section */}
        <div>
          {!isCollapsed && (
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">
              Account
            </p>
          )}
          <div className="space-y-1">
            {accountItems.map((item) => {
              const locked = isTierLocked(item.tier);
              return (
                <button
                  key={item.href}
                  onClick={() => !locked && router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive(item.href) && !locked
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : locked
                      ? 'text-neutral-400 cursor-not-allowed opacity-60'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                  disabled={locked}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {locked && <Lock size={14} className="text-neutral-400 shrink-0" />}
                    </>
                  )}
                  {isCollapsed && locked && (
                    <Lock size={14} className="text-neutral-400 absolute right-1 top-1/2 -translate-y-1/2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subscription Banner – only for free tier */}
        <SubscriptionBanner tier={userTier} onUpgrade={() => alert('Upgrade flow')} />

        {/* Logout */}
        <div className="border-t border-neutral-200 pt-4">
          <button
            onClick={() => alert('Logout functionality coming soon')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}
