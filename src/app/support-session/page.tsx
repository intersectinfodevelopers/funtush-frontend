'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api/client';
import { saveSupportSession, type SupportSession } from '@/lib/api/session';
import { getSession, saveSessionCookie } from '@/lib/auth';
import { AUTH_CHANGED_EVENT } from '@/lib/auth';

const ADMIN_URL = (process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3000').replace(/\/+$/, '');

/**
 * Landing page for an admin's "View agency dashboard" click.
 *
 * The admin app opens this tab with a one-time, 60-second code (never the tokens). We take the code out
 * of the address bar straight away, exchange it once over a POST body, keep the resulting tokens in this
 * TAB's sessionStorage only (not localStorage — a normal login in another tab is untouched), and go to
 * the dashboard.
 */
function Exchange() {
  const router = useRouter();
  const params = useSearchParams();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return; // React strict mode runs effects twice; the code is single-use
    started.current = true;
    const code = params.get('code');
    // Don't leave the code in the URL/history.
    window.history.replaceState(null, '', '/support-session');
    if (!code) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('This support link is missing its code. Open it again from the admin dashboard.');
      return;
    }
    api.post<Omit<SupportSession, 'adminOrigin'>>('/auth/support-session/exchange', { code })
      .then((s) => {
        saveSupportSession({ ...s, adminOrigin: ADMIN_URL });
        const user = getSession();
        if (user) saveSessionCookie(user);
        window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
        router.replace('/dashboard');
      })
      .catch((e: { message?: string }) => setError(e.message || "We couldn't start the support session."));
  }, [params, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 p-6">
      <div className="max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        {error ? (
          <>
            <h1 className="text-lg font-bold text-neutral-900">Couldn&apos;t open the dashboard</h1>
            <p role="alert" className="mt-2 text-sm text-danger-600">{error}</p>
            <p className="mt-2 text-xs text-neutral-500">Support links work once and expire after a minute.</p>
            <a href={ADMIN_URL} className="mt-4 inline-block rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800">Back to admin</a>
          </>
        ) : (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-700" />
            <p className="mt-4 text-sm text-neutral-600">Starting support session…</p>
          </>
        )}
      </div>
    </main>
  );
}

export default function SupportSessionPage() {
  return <Suspense fallback={null}><Exchange /></Suspense>;
}
