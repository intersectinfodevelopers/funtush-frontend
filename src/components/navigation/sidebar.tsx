'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useTheme } from '@/context/theme';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';
import {
  AnalyticsOutlined,
  BadgeOutlined,
  CalendarMonthOutlined,
  PhotoLibraryOutlined,
  OndemandVideoOutlined,
  CampaignOutlined,
  ChevronRight,
  ChevronLeft,
  CompassCalibrationOutlined,
  DashboardCustomizeOutlined,
  Inventory2Outlined,
  ManageAccountsOutlined,
  PersonOutlineOutlined,
  PublicOutlined,
  SecurityOutlined,
  SettingsOutlined,
  SupportAgentOutlined,
  WalletOutlined,
} from '@mui/icons-material';
import { cn } from '@/lib/utils/cn';

type NavChild = {
  label: string;
  href: string;
  icon?: OverridableComponent<SvgIconTypeMap<unknown, 'svg'>>;
};

type NavItem = {
  label: string;
  href?: string;
  icon: OverridableComponent<SvgIconTypeMap<unknown, 'svg'>>;
  children?: NavChild[];
  badge?: string;
};

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { isDark } = useTheme();

  // Navigation Data Structure (Preserved exact data)
  const navigationGroups: Array<{ label: string; items: NavItem[] }> = [
    {
      label: 'Main',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: DashboardCustomizeOutlined },
        { label: 'Packages', href: '/dashboard/packages', icon: Inventory2Outlined },
        {
          label: 'Booking Approval',
          icon: BadgeOutlined,
          badge: '5',
          children: [
            { label: 'All Bookings', href: '/dashboard/bookings', icon: CalendarMonthOutlined },
            { label: 'Pending', href: '/dashboard/bookings/pending', icon: CalendarMonthOutlined },
          ],
        },
        { label: 'Customers', href: '/dashboard/customers', icon: PersonOutlineOutlined },
      ],
    },
    {
      label: 'Operations',
      items: [
        { label: 'Guides', href: '/dashboard/guides', icon: CompassCalibrationOutlined },
        { label: 'Gallery', href: '/dashboard/gallery', icon: PhotoLibraryOutlined },
        { label: 'Videos', href: '/dashboard/videos', icon: OndemandVideoOutlined },
        { label: 'Finance', href: '/dashboard/finance', icon: WalletOutlined },
        { label: 'Analytics', href: '/dashboard/analytics', icon: AnalyticsOutlined },
        { label: 'Staff & Roles', href: '/dashboard/staff', icon: ManageAccountsOutlined },
        { label: 'Safety', href: '/dashboard/safety', icon: SecurityOutlined },
        { label: 'Destinations', href: '/dashboard/destinations', icon: PublicOutlined },
        {
          label: 'Advertisements',
          icon: CampaignOutlined,
          children: [
            { label: 'All Ads', href: '/dashboard/advertisements', icon: CalendarMonthOutlined },
            { label: 'Positions', href: '/dashboard/advertisements/positions', icon: CalendarMonthOutlined },
          ],
        },
      ],
    },
    {
      label: 'Account',
      items: [
        { label: 'Profile', href: '/dashboard/profile', icon: PersonOutlineOutlined },
        { label: 'Settings', href: '/dashboard/settings', icon: SettingsOutlined },
        { label: 'Support', href: '/dashboard/support', icon: SupportAgentOutlined },
      ],
    },
  ];

  // Helper function to evaluate active route states
  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // State for accordion items with children (keyed by item label)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Automatically expand parent items if a child route is currently active
  useEffect(() => {
    navigationGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children?.some((child) => isActive(child.href))) {
          setExpandedItems((prev) => ({ ...prev, [item.label]: true }));
        }
      });
    });
  }, [pathname]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for Mobile Overlay */}
      <div
        className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed left-0 top-16 bottom-0 z-40 flex flex-col border-r transition-all duration-300 ease-in-out select-none md:w-72',
          'w-16 md:w-72',
          isDark
            ? 'border-slate-800 bg-slate-950 text-slate-200 shadow-2xl'
            : 'border-neutral-200 bg-white text-neutral-900 shadow-sm'
        )}
      >        {/* Header Section */}
        <div
          className={cn(
            'flex items-center justify-center border-b px-2 py-2 md:justify-between md:px-4 md:py-3.5',
            isDark ? 'border-slate-800/80' : 'border-neutral-100'
          )}
        >
          <div
            className={cn(
              'flex flex-1 items-center justify-center rounded-2xl border px-1 py-2 md:justify-start md:gap-3 md:px-3 md:py-2.5',
              isDark
                ? 'border-slate-800 bg-slate-900/60'
                : 'border-neutral-200/80 bg-neutral-50/80'
            )}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#6C72FF] text-white shadow-sm shadow-[#6C72FF]/20 md:h-9 md:w-9">
              <CompassCalibrationOutlined className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <div className="hidden overflow-hidden md:block">
              <p className={cn('text-xs font-bold truncate', isDark ? 'text-white' : 'text-neutral-900')}>
                FUNTUSh
              </p>
              <p className={cn('text-[11px] truncate', isDark ? 'text-slate-400' : 'text-neutral-500')}>
                Digital Marketing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className={cn(
              'ml-2 hidden h-8 w-8 items-center justify-center rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-[#6C72FF] md:inline-flex',
              isDark
                ? 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Group Items */}
        <div className="flex-1 overflow-y-auto px-1 py-2 space-y-3 md:px-3 md:py-4 md:space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p
                className={cn(
                  'mb-2 hidden px-3 text-[11px] font-bold uppercase tracking-wider md:block',
                  isDark ? 'text-slate-500' : 'text-neutral-400'
                )}
              >
                {group.label}
              </p>

              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const hasChildren = Boolean(item.children?.length);
                  const isParentActive = hasChildren
                    ? item.children!.some((child) => isActive(child.href))
                    : isActive(item.href);
                  const isExpanded = Boolean(expandedItems[item.label]);

                  return (
                    <div key={item.label}>
                      {hasChildren ? (
                        /* Parent Accordion Button */
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.label)}
                          className={cn(
                            'flex w-full items-center justify-center rounded-xl px-1.5 py-2.5 text-xs font-semibold transition-all duration-150 md:justify-between md:px-3',
                            isParentActive
                              ? isDark
                                ? 'bg-[#6C72FF]/15 text-[#6C72FF]'
                                : 'bg-[#6C72FF]/10 text-[#6C72FF]'
                              : isDark
                              ? 'text-slate-300 hover:bg-slate-900 hover:text-white'
                              : 'text-neutral-700 hover:bg-neutral-100/70 hover:text-neutral-900'
                          )}
                        >
                          <span className="flex items-center justify-center md:justify-start md:gap-3">
                            <Icon
                              className={cn(
                                'h-4 w-4',
                                isParentActive
                                  ? 'text-[#6C72FF]'
                                  : isDark
                                  ? 'text-slate-400'
                                  : 'text-neutral-400'
                              )}
                            />
                            <span className="hidden md:inline">{item.label}</span>
                          </span>

                          <span className="hidden items-center gap-2 md:flex">
                            {item.badge && (
                              <span className="rounded-full bg-[#6C72FF] px-2 py-0.5 text-[10px] font-bold text-white">
                                {item.badge}
                              </span>
                            )}
                            {isExpanded ? (
                              <ChevronLeft className="h-4 w-4 -rotate-90 transition-transform duration-200" />
                            ) : (
                              <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                            )}
                          </span>
                        </button>
                      ) : (
                        /* Direct Navigation Link */
                        <Link
                          href={item.href!}
                          className={cn(
                            'flex items-center justify-center rounded-xl px-1.5 py-2.5 text-xs font-semibold transition-all duration-150 md:justify-between md:px-3',
                            isParentActive
                              ? 'bg-[#6C72FF] text-white shadow-sm shadow-[#6C72FF]/20'
                              : isDark
                              ? 'text-slate-300 hover:bg-slate-900 hover:text-white'
                              : 'text-neutral-700 hover:bg-neutral-100/70 hover:text-neutral-900'
                          )}
                        >
                          <span className="flex items-center justify-center md:gap-3">
                            <Icon
                              className={cn(
                                'h-4 w-4',
                                isParentActive
                                  ? 'text-white'
                                  : isDark
                                  ? 'text-slate-400'
                                  : 'text-neutral-400'
                              )}
                            />
                            <span className="hidden md:inline">{item.label}</span>
                          </span>

                          {item.badge && (
                            <span
                              className={cn(
                                'hidden rounded-full px-2 py-0.5 text-[10px] font-bold md:inline-block',
                                isParentActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-[#6C72FF]/10 text-[#6C72FF]'
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )}

                      {/* Sub-menu Navigation Links */}
                      {hasChildren && isExpanded && (
                        <div
                          className={cn(
                            'mt-1 ml-0 space-y-1 border-l pl-1 py-1 md:ml-4 md:pl-3',
                            isDark ? 'border-slate-800' : 'border-neutral-200'
                          )}
                        >
                          {item.children!.map((child) => {
                            const ChildIcon = child.icon;
                            const childActive = isActive(child.href);

                            return (
                              <Link
                                key={child.label}
                                href={child.href}
                                className={cn(
                                  'flex items-center justify-center gap-0 rounded-lg px-2 py-2 text-xs font-medium transition-colors md:justify-start md:gap-2.5 md:px-2.5',
                                  childActive
                                    ? isDark
                                      ? 'bg-slate-800/80 text-white font-semibold'
                                      : 'bg-[#6C72FF]/10 text-[#6C72FF] font-semibold'
                                    : isDark
                                    ? 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                )}
                              >
                                {ChildIcon ? (
                                  <ChildIcon
                                    className={cn(
                                      'h-3.5 w-3.5',
                                      childActive
                                        ? isDark
                                          ? 'text-[#6C72FF]'
                                          : 'text-[#6C72FF]'
                                        : 'text-neutral-400'
                                    )}
                                  />
                                ) : (
                                  <span
                                    className={cn(
                                      'h-1.5 w-1.5 rounded-full',
                                      childActive ? 'bg-[#6C72FF]' : 'bg-neutral-300'
                                    )}
                                  />
                                )}
                                <span className="hidden md:inline">{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Daily Summary Footer Section */}
        <div
          className={cn(
            'border-t p-3',
            isDark ? 'border-slate-800/80 bg-slate-950' : 'border-neutral-200 bg-white'
          )}
        >
          <div
            className={cn(
              'rounded-2xl border p-3 text-xs transition-colors',
              isDark
                ? 'border-slate-800 bg-slate-900/50 text-slate-300'
                : 'border-neutral-200/70 bg-neutral-50/70 text-neutral-700'
            )}
          >
            <p className={cn('font-bold', isDark ? 'text-white' : 'text-neutral-900')}>
              Daily Summary
            </p>
            <p className={cn('mt-1 text-[11px] leading-snug', isDark ? 'text-slate-400' : 'text-neutral-500')}>
              You have 5 pending approvals and 2 new messages.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-semibold">
              <div
                className={cn(
                  'rounded-xl px-2.5 py-1.5 text-center',
                  isDark ? 'bg-slate-950 text-slate-300' : 'bg-white border border-neutral-200/60 text-neutral-800'
                )}
              >
                Bookings: <span className="text-[#6C72FF]">24</span>
              </div>
              <div
                className={cn(
                  'rounded-xl px-2.5 py-1.5 text-center',
                  isDark ? 'bg-slate-950 text-slate-300' : 'bg-white border border-neutral-200/60 text-neutral-800'
                )}
              >
                Revenue: <span className="text-emerald-600">$12.4k</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};