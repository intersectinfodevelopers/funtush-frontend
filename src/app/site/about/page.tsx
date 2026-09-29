'use client';

import { PageFrame } from '@/components/site/PageFrame';
import { useSite } from '@/lib/site/SiteContext';

export default function AboutPage() {
  const { about, branding } = useSite();
  return (
    <PageFrame title={`About ${branding.brandName}`}>
      {about.description ? <p className="max-w-3xl whitespace-pre-line leading-relaxed text-neutral-700">{about.description}</p> : <p className="text-neutral-500">We&apos;re a trekking agency. More about us coming soon.</p>}
      {about.regions.length > 0 && <div className="mt-6"><p className="mb-2 text-sm font-semibold text-neutral-700">Where we operate</p><p className="flex flex-wrap gap-2">{about.regions.map((r) => <span key={r} className="rounded-full bg-neutral-100 px-3 py-1 text-sm">{r}</span>)}</p></div>}
    </PageFrame>
  );
}
