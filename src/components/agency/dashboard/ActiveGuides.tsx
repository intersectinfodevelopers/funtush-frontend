'use client';

import Image from 'next/image';
import Link from 'next/link';
import guides from '@/../data/guides.json';
import Battery4BarIcon from '@mui/icons-material/Battery4Bar';

export default function ActiveGuides() {
  const activeGuides = guides.filter((guide) => guide.status === 'on_trek');

  return (
    <section className="flex flex-col gap-4 rounded-lg bg-white p-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm leading-[20px]">Active Guides on Trek</h3>
        <Link
          href="/dashboard/guides"
          className="text-xs text-[#0D2DFC] font-semibold transition-transform hover:translate-y-[-1px] hover:underline "
        >
          View All
        </Link>
      </div>

      {activeGuides.map((guide) => (
        <div className="flex items-center justify-between gap-6" key={guide.id}>
          <div className="flex items-center gap-4">
            <Image src={guide.photo} alt="guide's image" width={40} height={40} className="rounded-full" />
            <div className="flex flex-col gap-1 text-xs">
              <p>{guide.name}</p>
              <p>Rating: {guide.rating.toFixed(1)} . On trek</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-success-700">● LIVE</span>
            <Battery4BarIcon sx={{ transform: 'rotate(90deg)' }} className="text-success-700" />
          </div>
        </div>
      ))}
    </section>
  );
}
