'use client';

import { SectionView } from '@/components/site/Sections';
import { Note } from '@/components/site/PageFrame';
import { useSite } from '@/lib/site/SiteContext';

export default function SiteHome() {
  const { page } = useSite();
  if (page.sections.length === 0) return <div className="mx-auto max-w-6xl px-4 py-20"><Note>This site is being set up. Please check back soon.</Note></div>;
  return <>{page.sections.map((s) => <SectionView key={s.id} s={s} />)}</>;
}
