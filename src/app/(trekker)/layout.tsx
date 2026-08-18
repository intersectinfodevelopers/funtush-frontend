'use client';

import { useState } from "react";
import { TrekkerTopbar } from "@/components/trekker/layout/trekkers";
import { TrekkerSidebar } from "@/components/trekker/layout/TrekkerSidebar";

export default function TrekkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      
      {/* ── Sidebar ── */}
      <TrekkerSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* ── Main Content Wrapper ── */}
      <div className="flex flex-1 flex-col overflow-hidden w-full">
        
        {/* ── Top Navigation ── */}
        <TrekkerTopbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-y-auto bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
}