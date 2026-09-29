'use client';

import { Suspense, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import PaymentReturn from '@/components/agency/settings/PaymentReturn';

function Inner() {
  const { txn } = useParams<{ txn: string }>();
  const q = useSearchParams();
  const job = useMemo(() => {
    const refId = q.get('refId');
    return refId ? ({ provider: 'esewa', refId, transactionId: txn } as const) : ({ provider: 'none', message: 'eSewa did not send a payment reference.' } as const);
  }, [q, txn]);
  return <PaymentReturn job={job} />;
}
export default function Page() { return <Suspense fallback={null}><Inner /></Suspense>; }
