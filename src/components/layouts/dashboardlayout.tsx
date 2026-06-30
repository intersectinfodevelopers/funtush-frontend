import React from 'react';
import { Sidebar } from '../navigation/sidebar';
import { Navbar } from '../navigation/navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="flex">
        {/* Left Drawer Container Panel Shell */}
        <Sidebar />
        
        {/* Right Main Panel Body Wrapper */}
        <main className="flex-1 pl-64 pt-16 min-h-[calc(100vh-4rem)]">
          <div className="p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};