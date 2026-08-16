'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  CalendarCheck,
  Users,
  Briefcase,
  GitBranch,
  Newspaper,
  PlusCircle,
  Tag,
  DollarSign,
  BarChart3,
  UserCog,
  ShieldCheck,
  Shield,
  MapPin,
  Video,
  Image as ImageIcon,
  User,
  Megaphone,
  Settings,
  LifeBuoy,
  LogOut,
  Star,
  Ticket,
  Lock,
  X,
} from 'lucide-react';

interface AgencySidebarProps {
  isCollapsed: boolean;   // desktop: collapsed vs full width
  isMobileOpen: boolean;  // mobile: drawer open vs hidden
  onClose: () => void;    // closes the mobile drawer
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  section: 'main' | 'operations' | 'blog' | 'account';
  tier?: 'free' | 'medium' | 'large';
}

const navItems: NavItem[] = [
  // Main
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} />, section: 'main' },
  { label: 'Packages', href: '/dashboard/packages', icon: <Package size={20} />, section: 'main' },
  { label: 'Booking Approval', href: '/dashboard/bookings', icon: <CalendarCheck size={20} />, section: 'main' },
  { label: 'Customers', href: '/dashboard/customers', icon: <Users size={20} />, section: 'main' },
  { label: 'Guides', href: '/dashboard/guides', icon: <Briefcase size={20} />, section: 'main' },

  // Blog
  { label: 'Blog', href: '/dashboard/blog', icon: <Newspaper size={20} />, section: 'blog' },
  { label: 'Create Blog', href: '/dashboard/blog/new', icon: <PlusCircle size={20} />, section: 'blog' },
  { label: 'Create Categories', href: '/dashboard/categories', icon: <Tag size={20} />, section: 'blog' },
  { label: 'Manage Video', href: '/dashboard/videos', icon: <Video size={20} />, section: 'blog' },
  { label: 'Manage Gallery', href: '/dashboard/gallery', icon: <ImageIcon size={20} />, section: 'blog' },
  { label: 'Manage Advertisement', href: '/dashboard/advertisements', icon: <Megaphone size={20} />, section: 'blog' },

  // Operations
  { label: 'Finance', href: '/dashboard/finance', icon: <DollarSign size={20} />, section: 'operations' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: <BarChart3 size={20} />, section: 'operations' },
  { label: 'Staff', href: '/dashboard/staff', icon: <UserCog size={20} />, section: 'operations' },
  { label: 'Roles', href: '/dashboard/roles', icon: <ShieldCheck size={20} />, section: 'operations' },
  { label: 'Branches', href: '/dashboard/branches', icon: <GitBranch size={20} />, section: 'operations' },
  { label: 'Destinations', href: '/dashboard/destinations', icon: <MapPin size={20} />, section: 'main' },
  { label: 'Safety', href: '/dashboard/safety', icon: <Shield size={20} />, section: 'operations' },
  { label: 'Reviews', href: '/dashboard/reviews', icon: <Star size={20} />, section: 'operations' },
  { label: 'Coupons', href: '/dashboard/coupons', icon: <Ticket size={20} />, section: 'operations' },

  // Account
  { label: 'Profile', href: '/dashboard/profile', icon: <User size={20} />, section: 'account' },
  { label: 'Settings', href: '/dashboard/settings', icon: <Settings size={20} />, section: 'account' },
  { label: 'Support', href: '/dashboard/support', icon: <LifeBuoy size={20} />, section: 'account' },
];

const isTierLocked = (tier?: string) => {
  const userTier = 'free'; // Mock – replace with real tier from context
  if (!tier) return false;
  if (tier === 'medium' && userTier === 'free') return true;
  if (tier === 'large' && (userTier === 'free' || userTier === 'medium')) return true;
  return false;
};

export default function AgencySidebar({ isCollapsed, isMobileOpen, onClose }: AgencySidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const navigate = (href: string) => {
    router.push(href);
    onClose(); // auto-close drawer on mobile after picking a page
  };

  const mainItems = navItems.filter((item) => item.section === 'main');
  const blogItems = navItems.filter((item) => item.section === 'blog');
  const operationsItems = navItems.filter((item) => item.section === 'operations');
  const accountItems = navItems.filter((item) => item.section === 'account');

  // Labels always show on the mobile drawer, even if the desktop "collapsed" state happens to be true
  const showLabels = !isCollapsed || isMobileOpen;

  const renderSection = (items: NavItem[], sectionLabel: string) => (
    <div>
      {showLabels && (
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">
          {sectionLabel}
        </p>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const locked = isTierLocked(item.tier);
          return (
            <button
              key={item.href}
              onClick={() => !locked && navigate(item.href)}
              title={!showLabels ? item.label : undefined}
              className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive(item.href) && !locked
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : locked
                  ? 'text-neutral-400 cursor-not-allowed opacity-60'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              } ${!showLabels ? 'justify-center' : ''}`}
              disabled={locked}
            >
              <span className="shrink-0">{item.icon}</span>
              {showLabels && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {locked && <Lock size={14} className="text-neutral-400 shrink-0" />}
                </>
              )}
              {!showLabels && locked && (
                <Lock size={12} className="text-neutral-400 absolute right-0.5 top-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`sidebar-scrollbar bg-white border-r border-neutral-200 h-screen fixed md:sticky top-0 left-0 z-50 md:z-auto overflow-y-auto overflow-x-hidden shrink-0 transition-all duration-300 w-64 ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* Logo / Agency Name */}
        <div
          className={`p-4 border-b border-neutral-200 flex items-center gap-2 ${
            isCollapsed && !isMobileOpen ? 'md:justify-center md:px-0' : 'justify-between'
          }`}
        >
          <div className={`flex items-center gap-2 overflow-hidden ${isCollapsed && !isMobileOpen ? 'md:justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              GA
            </div>
            <span
              className={`text-xl font-bold text-blue-600 whitespace-nowrap ${
                isCollapsed ? 'md:hidden' : ''
              }`}
            >
              Green Agency
            </span>
          </div>

          {/* Close button - mobile drawer only */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-neutral-100 transition-colors shrink-0"
            aria-label="Close sidebar"
          >
            <X size={18} className="text-neutral-500" />
          </button>
        </div>

        <nav className="p-3 space-y-6">
          {renderSection(mainItems, 'Main')}
          {blogItems.length > 0 && renderSection(blogItems, 'Blog')}
          {renderSection(operationsItems, 'Operations')}
          {renderSection(accountItems, 'Account')}

          {/* Logout */}
          <div className="border-t border-neutral-200 pt-4">
            <button
              onClick={() => alert('Logout functionality coming soon')}
              title={!showLabels ? 'Logout' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors ${
                !showLabels ? 'justify-center' : ''
              }`}
            >
              <LogOut size={20} />
              {showLabels && <span>Logout</span>}
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}