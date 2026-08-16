"use client";

import React from 'react';

const positions = [
  { id: 'homepage-top', label: 'Homepage Top' },
  { id: 'sidebar-1', label: 'Sidebar Slot 1' },
  { id: 'footer-1', label: 'Footer Slot 1' },
];

export default function Page() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Advertisement Positions</h1>

      <div className="rounded-lg border bg-white p-3">
        <ul className="space-y-2 text-sm">
          {positions.map((p) => (
            <li key={p.id} className="flex items-center justify-between border-b py-2 last:border-b-0">
              <div>
                <div className="font-semibold">{p.label}</div>
                <div className="text-xs text-neutral-500">ID: {p.id}</div>
              </div>
              <div className="text-sm text-neutral-600">Available</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
