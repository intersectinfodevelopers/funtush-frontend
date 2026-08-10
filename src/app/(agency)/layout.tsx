'use client';

import { useState, useEffect } from 'react';
import '../globals.css';
import AgencySidebar from '@/components/agency/AgencySidebar';
import DashboardTopbar from '@/components/agency/DashboardTopbar';

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setIsMobileOpen(false);
    };
    handleChange(mq);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const handleMenuClick = () => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setIsSidebarCollapsed((prev) => !prev);
    } else {
      setIsMobileOpen((prev) => !prev);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Sidebar */}
      <AgencySidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />

      {/* Main Content */}
      <div className="flex h-screen min-w-0 flex-1 flex-col">
        {/* Topbar - stays put, never scrolls */}
        <div className="z-30 w-full shrink-0 bg-white">
          <DashboardTopbar onMenuClick={handleMenuClick} />
        </div>

        {/* Page Content - the ONLY scrollable region */}
        <main className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 bg-[#F2F2F7]">
          {children}
        </main>
      </div>
    </div>
  );
}