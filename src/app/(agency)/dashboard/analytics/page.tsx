'use client';

import Link from 'next/link';
import SummarizedResult from '@/components/agency/analytics/SummarizedResult';
import OriginAndPerformance from '@/components/agency/analytics/OriginAndPerformance';

const agencyId = 'ag-001';

export default function Page() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/dashboard">Dashboard</Link>
        <span>/</span>
        <span className="font-semibold text-neutral-900">Analytics</span>
      </div>
      <SummarizedResult agencyId={agencyId} />
      <OriginAndPerformance /> {/*placeholder*/}
    </div>
  );
}
