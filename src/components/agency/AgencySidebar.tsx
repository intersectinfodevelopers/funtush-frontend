'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  section?: 'main' | 'operations' | 'account';
}

const navItems: NavItem[] = [
  // Main section
  { label: 'Dashboard', href: '/dashboard', icon: '📊', section: 'main' },
  { label: 'Packages', href: '/dashboard/packages', icon: '📦', section: 'main' },
  { label: 'Booking Approval', href: '/dashboard/bookings', icon: '✅', section: 'main' },
  { label: 'Customers', href: '/dashboard/customers', icon: '👤', section: 'main' },
  { label: 'Guides', href: '/dashboard/guides', icon: '🧭', section: 'main' },
  { label: 'Blog', href: '/dashboard/blog', icon: '📝', section: 'main' },
  
  // Operations section
  { label: 'Finance', href: '/dashboard/finance', icon: '💰', section: 'operations' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: '📈', section: 'operations' },
  { label: 'Staff & Roles', href: '/dashboard/staff', icon: '👥', section: 'operations' },
  { label: 'Safety', href: '/dashboard/safety', icon: '🛡️', section: 'operations' },
  { label: 'Destinations', href: '/dashboard/destinations', icon: '🌍', section: 'operations' },
  
  // Account section
  { label: 'Profile', href: '/dashboard/profile', icon: '👤', section: 'account' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️', section: 'account' },
  { label: 'Support', href: '/dashboard/support', icon: '❓', section: 'account' },
];

export default function AgencySidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
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
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-600">Green Agency</span>
          {isCollapsed && <span className="text-xl font-bold text-blue-600">GA</span>}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white border border-neutral-200 rounded-full p-1 hover:bg-neutral-50"
      >
        {isCollapsed ? '▶' : '◀'}
      </button>

      <nav className="p-3 space-y-6">
        {/* Main Section */}
        <div>
          {!isCollapsed && (
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">
              Main
            </p>
          )}
          <div className="space-y-1">
            {mainItems.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            ))}
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
            {operationsItems.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            ))}
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
            {accountItems.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg text-sm transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="border-t border-neutral-200 pt-4">
          <button
            onClick={() => {
              // Handle logout
              alert('Logout functionality coming soon');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
          >
            <span className="text-lg">🚪</span>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}