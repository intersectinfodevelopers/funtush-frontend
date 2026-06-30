import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'active' | 'confirmed' | 'trial' | 'suspended' | 'draft';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'draft', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide border';

    const variants = {
      active: 'bg-green-50 text-green-700 border-green-200',
      confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      trial: 'bg-amber-50 text-amber-700 border-amber-200',
      suspended: 'bg-red-50 text-red-700 border-red-200',
      draft: 'bg-gray-50 text-gray-700 border-gray-200',
    };

    return (
      <span
        ref={ref}
        className={twMerge(clsx(baseClasses, variants[variant]), className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';