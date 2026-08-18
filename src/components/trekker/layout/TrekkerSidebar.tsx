'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Bell, User as UserIcon, Mountain, LogOut } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/useAuth';

const NAV_LINKS = [
  { key: 'my-treks', label: 'My Treks', href: ROUTES.TREKKER.MY_TREKS, icon: Map },
  { key: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
  { key: 'profile', label: 'Profile', href: ROUTES.TREKKER.PROFILE, icon: UserIcon },
];

export function TrekkerSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-neutral-900/50 md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-300 ease-in-out md:static md:flex md:translate-x-0",
          isOpen ? "translate-x-0 flex" : "-translate-x-full hidden"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-neutral-200">
          <Link href={ROUTES.TREKKER.MY_TREKS} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <Mountain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary-600">FUNTUSH</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 sidebar-scrollbar overflow-y-auto">
          {NAV_LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;
            
            return (
              <Link
                key={link.key}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary-50 text-primary-700" 
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
                onClick={() => onClose()}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-primary-700" : "text-neutral-400")} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer (Logout) */}
        <div className="border-t border-neutral-200 p-4 shrink-0">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger-600 transition-colors hover:bg-danger-50"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}