'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_CHANGED_EVENT, getSession, getSessionSnapshot } from '@/lib/auth';
import { ROUTES } from '@/lib/constants/routes';
import { logoutEverywhere } from '@/lib/api/auth';
import type { SessionUser, UserRole } from '@/types/user';

interface UseAuthReturn {
  user: SessionUser | null;
  isLoggedIn: boolean;
  role: UserRole | null;
  agencyId: string | null;
  logout: () => void;
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange); // other tabs
  window.addEventListener(AUTH_CHANGED_EVENT, onChange); // this tab
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(AUTH_CHANGED_EVENT, onChange);
  };
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();

  // The server (and the first client render) see "no session"; the real one
  // appears right after hydration. Reading localStorage in the initial render
  // instead made server and client HTML differ (a hydration error).
  const snapshot = useSyncExternalStore(subscribe, getSessionSnapshot, () => '');
  const user = useMemo<SessionUser | null>(() => (snapshot ? getSession() : null), [snapshot]);

  const logout = useCallback(() => {
    // Revokes the refresh token server-side too — clearing localStorage alone
    // would leave a stolen copy of the token usable.
    void logoutEverywhere().finally(() => router.push(ROUTES.AUTH.LOGIN));
  }, [router]);

  return {
    user,
    isLoggedIn: user !== null,
    role: user?.role ?? null,
    agencyId: user?.agency_id ?? null,
    logout,
  };
}
