'use client';

import { ReactNode } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
// import { SessionProvider } from 'next-auth/react';

/**
 * Initialize React Query client
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Root providers wrapper
 * Wraps the app with necessary providers (React Query, NextAuth, etc.)
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <SessionProvider> */}
      {children}
      {/* </SessionProvider> */}
    </QueryClientProvider>
  );
}
