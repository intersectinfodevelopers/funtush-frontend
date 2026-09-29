'use client';

import { useEffect } from 'react';
import '../globals.css';

/**
 * Full-bleed layout for the page editor — deliberately has no
 * AgencySidebar/DashboardTopbar, since the editor draws its own toolbar.
 * Lives in a separate route group so it doesn't inherit `(agency)/layout.tsx`.
 */
export default function EditorLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prevHtmlBg = document.documentElement.style.background;
    const prevBodyBg = document.body.style.background;
    document.documentElement.style.background = '#f9fafb';
    document.body.style.background = '#f9fafb';
    return () => {
      document.documentElement.style.background = prevHtmlBg || '';
      document.body.style.background = prevBodyBg || '';
    };
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden bg-neutral-50">
      {children}
    </div>
  );
}
