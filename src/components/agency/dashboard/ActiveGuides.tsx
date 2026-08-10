//app/components/agency/dashboard/ActiveGuides.tsx
'use client';

import Link from 'next/link';
import guides from '@/../data/guides.json';
import Battery4BarIcon from '@mui/icons-material/Battery4Bar';

export default function ActiveGuides() {
  const activeGuides = guides.filter((guide) => guide.status === 'on_trek');

  return (
    <section className="flex flex-col gap-4 rounded-sm bg-white p-2 shadow-sm xl:min-w-[240px] xl:min-h-[175px]">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-xs md:text-[10px] lg:text-xs">Active Guides on Trek</h2>
        <Link
          href="/dashboard/guides"
          className="text-xs text-[#0D2DFC] font-semibold transition-transform hover:translate-y-[-1px] hover:underline "
        >
          View All
        </Link>
      </div>

      {activeGuides.map((guide) => (
        <div className="flex items-center justify-between gap-6" key={guide.id}>
          <div className="flex gap-2">
            <div className="w-[20px] h-[20px] flex justify-center items-center p-3 rounded-full bg-[#FF8D28] font-semibold text-[9px]">
              {getCapitalLetter(guide.name)}
            </div>
            <div className="flex flex-col gap-1 font-[500] text-[10px]">
              <p>{guide.name}</p>
              <p>Rating: {guide.rating.toFixed(1)} . On trek</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="self-start text-[10px] font-semibold text-success-700 whitespace-nowrap">
              <span className="relative top-[2px] text-lg">●</span> LIVE
            </span>
            <Battery4BarIcon sx={{ transform: 'rotate(90deg)' }} className="self-end text-success-700" />
          </div>
        </div>
      ))}
    </section>
  );
}

const getCapitalLetter = (name: string) => {
  const nameArr = name.toUpperCase().split(' ');
  return nameArr[0].slice(0, 1) + nameArr[1].slice(0, 1);
};
