'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  Palette,
  Building2,
  Globe,
  Users,
  Shield,
  Bell,
  Mail,
  Lock,
  CreditCard,
  Share2,
  Wallet,
  Compass,
  SearchCode,
  Crown
} from 'lucide-react';

// Settings navigation items
const settingsNavItems = [
  { label: 'Branding', href: '/dashboard/settings/branding', icon: <Palette size={18} /> },
  { label: 'Agency Info', href: '/dashboard/settings/agency-info', icon: <Building2 size={18} /> },
  { label: 'Domain', href: '/dashboard/settings/domain', icon: <Globe size={18} /> },
  { label: 'Social', href: '/dashboard/settings/social', icon: <Share2 size={18} /> },
  { label: 'Payments', href: '/dashboard/settings/payments', icon: <Wallet size={18} /> },
  { label: 'Navigation', href: '/dashboard/settings/navigation', icon: <Compass size={18} /> },
  { label: 'Seo', href: '/dashboard/settings/seo', icon: <SearchCode size={18} /> },
  { label: 'Subscription', href: '/dashboard/settings/subscription', icon: <Crown size={18} /> },
  { label: 'Team', href: '/dashboard/settings/team', icon: <Users size={18} /> },
  { label: 'Security', href: '/dashboard/settings/security', icon: <Shield size={18} /> },
  { label: 'Notifications', href: '/dashboard/settings/notifications', icon: <Bell size={18} /> },
  { label: 'Email', href: '/dashboard/settings/email', icon: <Mail size={18} /> },
  { label: 'Password', href: '/dashboard/settings/password', icon: <Lock size={18} /> },
  { label: 'Billing', href: '/dashboard/settings/billing', icon: <CreditCard size={18} /> },
];

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Settings</h1>

      {/* Settings Sub-Nav */}
      <div className="border-b border-neutral-200 mb-6">
        <nav className="flex gap-1 overflow-x-auto pb-0.5">
          {settingsNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (pathname === '/dashboard/settings' && item.href === '/dashboard/settings/branding');
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Palette size={48} className="text-neutral-300 mb-4" />
          <h2 className="text-lg font-semibold text-neutral-900">Branding</h2>
          <p className="text-sm text-neutral-500 max-w-md">
            Customize your agency brand appearance. Configure colors, fonts, and logos.
          </p>
          <button
            onClick={() => router.push('/dashboard/settings/branding')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Go to Branding
          </button>
        </div>
      </div>
    </div>
  );
}