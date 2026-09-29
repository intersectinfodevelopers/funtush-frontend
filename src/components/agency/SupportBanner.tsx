'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { clearSupportSession, getSupportSession } from '@/lib/api/session';
import { AUTH_CHANGED_EVENT, clearSessionCookie } from '@/lib/auth';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Persistent bar shown while a platform admin is acting as this agency. It can't be dismissed: the
 * admin (and anyone looking over their shoulder) should never mistake this for a normal login.
 */
export default function SupportBanner() {
  const { user } = useAuth();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  if (!user?.support) return null;
  const session = getSupportSession();
  const left = session ? Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - now) / 1000)) : 0;

  function end() {
    const back = session?.adminOrigin;
    clearSupportSession();
    clearSessionCookie();
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    // This tab was opened by the admin app: close it if the browser allows, else send the admin back.
    window.close();
    window.location.href = back || '/login';
  }

  return (
    <div role="status" aria-label="Support session" className="flex flex-wrap items-center justify-between gap-2 bg-warning-500 px-4 py-2 text-sm font-semibold text-neutral-950">
      <span className="inline-flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Support session — you are acting as {user.agency_name ?? 'this agency'}. Everything you do is recorded.</span>
      <span className="inline-flex items-center gap-3"><span aria-label="Time left" className="tabular-nums">{Math.floor(left / 60)}:{pad(left % 60)} left</span>
        <button type="button" onClick={end} className="rounded-lg bg-neutral-950 px-3 py-1 text-xs font-bold text-white hover:bg-neutral-800">End session</button></span>
    </div>
  );
}
