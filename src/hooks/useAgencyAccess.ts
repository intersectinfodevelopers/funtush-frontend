'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useAuth } from '@/hooks/useAuth';

interface Access { admin: boolean; permissions: string[] }

/** Where each dashboard area lives → the permission that opens it ("any" = every signed-in agency user). */
const AREA: [string, string][] = [
  ['/dashboard/packages', 'packages'], ['/dashboard/destinations', 'packages'], ['/dashboard/coupons', 'packages'],
  ['/dashboard/bookings', 'bookings'], ['/dashboard/safety', 'bookings'],
  ['/dashboard/customers', 'customers'], ['/dashboard/guides', 'guides'],
  ['/dashboard/blog', 'blog'], ['/dashboard/categories', 'blog'], ['/dashboard/videos', 'blog'], ['/dashboard/gallery', 'blog'], ['/dashboard/advertisements', 'blog'],
  ['/dashboard/reviews', 'reviews'], ['/dashboard/finance', 'finance'], ['/dashboard/analytics', 'analytics'],
  ['/dashboard/branches', 'settings'], ['/dashboard/appearance', 'settings'], ['/dashboard/settings', 'settings'],
  ['/dashboard/staff', 'staff'], ['/dashboard/roles', 'staff'],
];

/**
 * What the signed-in agency user may open. The owner (and a support session, which acts as the owner) sees
 * everything. This only decides what to SHOW — the API refuses anything not granted, whatever the UI does.
 */
export function useAgencyAccess() {
  const { user } = useAuth();
  const q = useQuery({ queryKey: ['agency', 'access'], queryFn: async () => (await api.get<{ data: Access }>('/agencies/me/access')).data, enabled: Boolean(user), staleTime: 60_000 });
  const perms = q.data ? (q.data.admin ? undefined : q.data.permissions) : user?.permissions;
  const can = (href: string): boolean => {
    if (perms === undefined) return true;
    const hit = AREA.find(([prefix]) => href === prefix || href.startsWith(prefix + '/'));
    if (!hit) return href === '/dashboard' || href.startsWith('/dashboard/profile') || href.startsWith('/dashboard/support');
    return hit[1] !== 'admin' && perms.includes(hit[1]);
  };
  // `can` is optimistic (true) until we know who this is; anything that FETCHES on the strength of it must wait for `known`.
  const known = q.data !== undefined || user?.permissions !== undefined;
  return { can, known, isStaff: perms !== undefined };
}
