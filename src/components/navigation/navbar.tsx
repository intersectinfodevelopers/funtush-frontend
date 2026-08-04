import React, { useState } from 'react';
import { Bell, Menu, MessageCircle, Moon, Search, SunMedium,X } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/context/theme';

type NavbarProps = {
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
  isDarkMode?: boolean;
  onDarkModeToggle?: () => void;
};

export const Navbar: React.FC<NavbarProps> = ({
  sidebarOpen = false,
  onSidebarToggle,
  isDarkMode,
  onDarkModeToggle,
}) => {
  const [isMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const canToggleSidebar = typeof onSidebarToggle === 'function';
  const theme = useTheme();
  const effectiveIsDark = typeof isDarkMode === 'boolean' ? isDarkMode : theme.isDark;
  const effectiveToggle = onDarkModeToggle ?? theme.toggle;
  // const baseBtnClass = effectiveIsDark
  //   ? 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
  //   : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50';
  const searchBgClass = effectiveIsDark
    ? 'border-slate-800 bg-slate-900/95 text-slate-200 placeholder:text-slate-500 shadow-sm'
    : 'border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-500 shadow-sm';
  const searchFocusClass = effectiveIsDark
    ? 'focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
    : 'focus:border-slate-700 focus:ring-2 focus:ring-slate-700/20';
  const subtitleColorClass = effectiveIsDark ? 'text-slate-100' : 'text-slate-700';
  const iconBtnWrapper = 'inline-flex p-2 rounded focus:outline-none';
  const iconColorClass = effectiveIsDark ? 'text-slate-200 hover:text-white' : 'text-neutral-700 hover:text-neutral-900';

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Packages', href: '/dashboard/packages' },
    { label: 'Bookings', href: '/dashboard/bookings' },
  ];

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl ${
        effectiveIsDark
          ? 'border-slate-800 bg-slate-950/95'
          : 'border-neutral-200 bg-white/95'
      }`}
    >
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {canToggleSidebar && (
            <button
              type="button"
              onClick={onSidebarToggle}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              className={iconBtnWrapper}
            >
              {sidebarOpen ? <X className={`h-5 w-5 ${iconColorClass}`} /> : <Menu className={`h-5 w-5 ${iconColorClass}`} />}
            </button>
          )}

          <div className="flex flex-col">
            <span
              className="inline-flex items-center rounded-full border border-[#1c3762] px-2 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-[#0077ff]"
              style={{ fontFamily: 'VAG Round Next Shine, Arial, Helvetica, sans-serif' }}
            >
              FUNTUSh
            </span>
            <span className={`text-sm font-semibold ${subtitleColorClass}`}>Digital Marketing Dashboard</span>
          </div>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center px-4">
          <label className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Search for anything..."
              className={`w-full rounded-full py-3 pl-12 pr-4 text-sm outline-none transition ${searchBgClass} ${searchFocusClass}`}
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`${iconBtnWrapper} relative`}
          >
            <Bell className={`h-5 w-5 ${iconColorClass}`} />
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
              3
            </span>
          </button>

          <button
            type="button"
            className={`${iconBtnWrapper} relative`}
          >
            <MessageCircle className={`h-5 w-5 ${iconColorClass}`} />
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-semibold text-white">
              2
            </span>
          </button>

          <button
            type="button"
            onClick={effectiveToggle}
            className={iconBtnWrapper}
          >
            {effectiveIsDark ? <Moon className={`h-5 w-5 ${iconColorClass}`} /> : <SunMedium className={`h-5 w-5 ${iconColorClass}`} />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserDropdownOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 focus:outline-none"
            >
              <span className="text-sm font-bold">GA</span>
            </button>

            {isUserDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsUserDropdownOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-3 w-64 rounded-3xl border border-slate-800 bg-slate-950 p-3 shadow-xl shadow-black/20">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-sm font-semibold text-slate-100">Manisha Rai</p>
                    <p className="mt-1 text-xs text-slate-500">Agency Admin</p>
                  </div>
                  <div className="mt-3 space-y-2">
                    <button className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-800">
                      Profile Settings
                    </button>
                    <button className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-left text-sm text-rose-300 transition hover:bg-rose-950/80">
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Online status removed per request */}
        </div>
      </div>

      {/* Notification summary removed per UX request */}

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pb-4 pt-3">
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-800"
              >
                {link.label}
              </Link>
            ))}
          </div>
          {/* mobile notification summary removed */}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
