import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs Layout">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={cn(
                  'border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-all cursor-pointer focus:outline-none',
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="py-2 focus:outline-none">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};