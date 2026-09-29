'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';

import { Pagination } from '@/components/ui/pagination';
import { useNotifications } from '@/hooks/useTrekker';
import { markNotificationsRead } from '@/lib/api/trekker';

const when = (d: string) => new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useNotifications(page);
  const refresh = () => { void qc.invalidateQueries({ queryKey: ['trekker', 'notifications'] }); void qc.invalidateQueries({ queryKey: ['trekker', 'unread'] }); };
  const read = useMutation({ mutationFn: (ids?: string[]) => markNotificationsRead(ids), onSuccess: refresh });
  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-neutral-900">Notifications</h1><p className="mt-1 text-sm text-neutral-600">Updates on your bookings and trips.</p></div>
        {(data?.unread ?? 0) > 0 && <button type="button" disabled={read.isPending} onClick={() => read.mutate(undefined)} className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50 disabled:opacity-50">Mark all as read ({data!.unread})</button>}
      </div>
      {isError && <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load your notifications.</p>}
      {isLoading ? <div className="h-32 animate-pulse rounded-2xl bg-white" /> : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-500"><Bell className="mx-auto mb-2 h-8 w-8 text-neutral-300" />You&apos;re all caught up.</div>
      ) : (
        <ul className="space-y-2">{items.map((n) => {
          const unread = n.readAt === null;
          const link = n.data?.bookingId ? `/my-treks/${n.data.bookingId}` : null;
          const inner = (<><div className="flex items-start justify-between gap-3"><p className={`text-sm ${unread ? 'font-bold text-neutral-900' : 'font-semibold text-neutral-700'}`}>{unread && <span aria-label="Unread" className="mr-2 inline-block h-2 w-2 rounded-full bg-primary-600" />}{n.title}</p><span className="shrink-0 text-xs text-neutral-400">{when(n.createdAt)}</span></div><p className="mt-1 text-sm text-neutral-600">{n.body}</p></>);
          return (
            <li key={n.id} className={`rounded-2xl border p-4 ${unread ? 'border-primary-200 bg-primary-50/40' : 'border-neutral-200 bg-white'}`}>
              {link ? <Link href={link} onClick={() => unread && read.mutate([n.id])} className="block">{inner}</Link> : <button type="button" onClick={() => unread && read.mutate([n.id])} className="block w-full text-left">{inner}</button>}
            </li>
          );
        })}</ul>
      )}
      <Pagination currentPage={page} totalPages={Math.max(1, data?.meta.pages ?? 1)} onPageChange={setPage} />
    </div>
  );
}
