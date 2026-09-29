'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ServerSlugContext } from '@/lib/site/slug';
import type { SeedEntry } from '@/lib/site/serverPrefetch';

/**
 * Puts the data the server fetched into the query cache before anything renders, so the site's HTML arrives with its
 * real content. On the server each request gets its own cache (the app-wide one is shared between visitors); in the
 * browser the seed goes into the app's normal cache.
 */
export default function SiteSeed({ slug, entries, children }: { slug: string; entries: SeedEntry[]; children: ReactNode }) {
  const parent = useQueryClient();
  const [client] = useState(() => {
    const c = typeof window === 'undefined' ? new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: false } } }) : parent;
    for (const [key, data] of entries) if (c.getQueryData(key) === undefined) c.setQueryData(key, data);
    return c;
  });
  return (
    <QueryClientProvider client={client}>
      <ServerSlugContext.Provider value={slug}>{children}</ServerSlugContext.Provider>
    </QueryClientProvider>
  );
}
