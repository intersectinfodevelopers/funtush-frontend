'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle } from 'lucide-react';
import { confirmPayment } from '@/lib/api/agency/settings';
import type { ApiError } from '@/lib/api/client';

type Job = { provider: 'esewa'; refId: string; transactionId: string } | { provider: 'khalti'; token: string; transactionId: string } | { provider: 'none'; message: string };

/** The page a payment provider sends the payer back to. It never trusts the URL: the server asks the provider. */
export default function PaymentReturn({ job }: { job: Job }) {
  const qc = useQueryClient();
  const started = useRef(false);
  const [state, setState] = useState<'working' | 'ok' | 'error'>(job.provider === 'none' ? 'error' : 'working');
  const [message, setMessage] = useState(job.provider === 'none' ? job.message : '');

  useEffect(() => {
    if (job.provider === 'none' || started.current) return;
    started.current = true;
    confirmPayment(job)
      .then(() => { setState('ok'); void qc.invalidateQueries(); })
      .catch((e: ApiError) => { setState('error'); setMessage(e.message || "We couldn't confirm this payment."); });
  }, [job, qc]);

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
      {state === 'working' && <><div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-700" /><p className="mt-4 text-sm text-neutral-600" role="status">Confirming your payment…</p></>}
      {state === 'ok' && <><CheckCircle2 className="mx-auto h-12 w-12 text-success-600" /><h1 className="mt-3 text-xl font-bold text-neutral-900">Payment confirmed</h1><p className="mt-1 text-sm text-neutral-600">Your plan has been upgraded.</p></>}
      {state === 'error' && <><XCircle className="mx-auto h-12 w-12 text-danger-600" /><h1 className="mt-3 text-xl font-bold text-neutral-900">Payment not completed</h1><p role="alert" className="mt-1 text-sm text-neutral-600">{message}</p></>}
      {state !== 'working' && <Link href="/dashboard/settings?tab=subscription" className="mt-5 inline-block rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800">Back to plans</Link>}
    </div>
  );
}
