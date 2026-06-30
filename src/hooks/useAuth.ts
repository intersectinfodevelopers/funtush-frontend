'use client';


import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSession,clearSessionEverywhere,SESSION_KEY} from '@/lib/auth';
import { ROUTES } from '@/lib/constants/routes';
import type { SessionUser, UserRole } from '@/types/user';

interface UseAuthReturn {
  user: SessionUser | null;
  isLoggedIn: boolean;
  role: UserRole | null;
  agencyId: string | null;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(() => getSession());


  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === SESSION_KEY) {
        setUser(getSession());
      }
    }

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  const logout = useCallback(() => {
    clearSessionEverywhere();
    setUser(null);
    router.push(ROUTES.AUTH.LOGIN);
  }, [router]);

  return {
    user,
    isLoggedIn: user !== null,
    role: user?.role ?? null,
    agencyId: user?.agency_id ?? null,
    logout,
  };
}