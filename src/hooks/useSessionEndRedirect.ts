'use client';

import { useEffect } from 'react';
import { SESSION_ENDED_EVENT } from '@/lib/api/client';
import { clearSupportSession, isSupportSession } from '@/lib/api/session';
import { clearSessionEverywhere } from '@/lib/auth';

/**
 * The API client fires this when a request is refused and the session can't be renewed (expired, revoked, the
 * account was removed). Without it the page just keeps showing errors; instead, sign out and go to the login page.
 */
export function useSessionEndRedirect() {
  useEffect(() => {
    let done = false;
    const onEnd = () => {
      if (done) return;
      done = true;
      const wasSupport = isSupportSession();
      clearSupportSession();
      clearSessionEverywhere();
      window.location.assign(wasSupport ? '/login?ended=support' : '/login?expired=1');
    };
    window.addEventListener(SESSION_ENDED_EVENT, onEnd);
    return () => window.removeEventListener(SESSION_ENDED_EVENT, onEnd);
  }, []);
}
