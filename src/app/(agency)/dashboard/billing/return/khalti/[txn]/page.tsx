'use client';

import { Suspense, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import PaymentReturn from '@/components/agency/settings/PaymentReturn';

function Inner() {
  const { txn } = useParams<{ txn: string }>();
  const q = useSearchParams();
  const job = useMemo(() => {
    const pidx = q.get('pidx');
    if (!pidx) return { provider: 'none', message: 'Khalti did not send a payment reference.' } as const;
    if (q.get('status') && q.get('status') !== 'Completed') return { provider: 'none', message: `The payment was ${String(q.get('status')).toLowerCase()}.` } as const;
    return { provider: 'khalti', token: pidx, transactionId: txn } as const;
  }, [q, txn]);
  return <PaymentReturn job={job} />;
}
export default function Page() { return <Suspense fallback={null}><Inner /></Suspense>; }
