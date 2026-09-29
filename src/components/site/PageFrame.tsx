'use client';

import type { ReactNode } from 'react';

export function PageFrame({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8"><h1 className="text-3xl font-extrabold text-neutral-900">{title}</h1>{subtitle && <p className="mt-2 max-w-2xl text-neutral-600">{subtitle}</p>}</div>
      {children}
    </div>
  );
}
export const Note = ({ children }: { children: ReactNode }) => <p className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">{children}</p>;
export const Loading = () => <div className="h-40 animate-pulse rounded-2xl bg-neutral-100" role="status" aria-label="Loading" />;
