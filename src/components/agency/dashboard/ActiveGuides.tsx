'use client';

import Image from 'next/image';
import guides from '../../../../data/guides.json';

export default function ActiveGuides() {
  const activeGuides = guides.filter((guide) => guide.status === 'on_trek');

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6">
      <h3 className="font-semibold text-neutral-900">Active Guides</h3>

      {activeGuides.map((guide) => (
        <div className="flex items-center gap-6" key={guide.id}>
          <Image src={guide.photo} alt="guide's image" width={40} height={40} className="rounded-full" />

          <p>{guide.name}</p>
        </div>
      ))}
    </div>
  );
}
