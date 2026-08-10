//src/components/layouts/dashboardlayout.tsx

'use client';

import React from 'react';
import { Sidebar } from '../navigation/sidebar';
import Navbar from '@/components/navigation/navbar';
import { useTheme } from '@/context/theme';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isDark } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-neutral-50 text-slate-900'}`}>
      <Navbar
        sidebarOpen={isSidebarOpen}
        onSidebarToggle={() => {
          setIsSidebarOpen((prev) => !prev);
        }}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className={`min-h-screen pt-16 transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : 'md:ml-0'}`}>
        <div className="w-full px-2 py-1 sm:px-6 sm:py-4">
          {children}
        </div>
      </main>
    </div>
  );
};