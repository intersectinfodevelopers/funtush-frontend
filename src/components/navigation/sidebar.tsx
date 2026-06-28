import React from 'react';
import { Compass, Layers, ShieldCheck, Milestone, Users } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export const Sidebar: React.FC = () => {
  // Mock active path matching setup logic
  const currentPath = '/dashboard/packages'; 

  const navigationGroups = [
    {
      label: 'Core Admin',
      items: [
        { label: 'Overview Panel', href: '/dashboard', icon: Compass },
        { label: 'Verify Agencies', href: '/dashboard/verify', icon: ShieldCheck },
      ],
    },
    {
      label: 'Management',
      items: [
        { label: 'Trek Packages', href: '/dashboard/packages', icon: Layers },
        { label: 'Destinations', href: '/dashboard/destinations', icon: Milestone },
        { label: 'User Operations', href: '/dashboard/users', icon: Users },
      ],
    },
  ];

  return (
    <aside className="fixed top-0 bottom-0 left-0 z-30 w-64 border-r border-neutral-200 bg-neutral-900 text-neutral-300 flex flex-col pt-16">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7 custom-scrollbar">
        {navigationGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {group.label}
            </p>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = currentPath === item.href;
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 group',
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
                    )}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300')} />
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
};