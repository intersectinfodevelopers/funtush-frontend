'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityVerb, getRecentPackageActivity } from '@/lib/api/agency/packages';
import { listBlogs } from '@/lib/api/agency/blog';
import { useActiveIncidents, useBookingList } from '@/hooks/useAgencyDashboard';
import { useAgencyAccess } from '@/hooks/useAgencyAccess';
import { useAuth } from '@/hooks/useAuth';

export type AgencyNotification = {
  id: string;
  type: 'booking' | 'sos' | 'payment' | 'review' | 'guide' | 'package' | 'blog';
  title: string;
  description: string;
  time: string;
  /** Where clicking it goes. */
  href?: string;
  read: boolean;
};

const READ_KEY = 'funtush_read_notifications';
/** Notifications the user has already LOOKED at (opened the bell) — they stop counting on the badge. */
const SEEN_KEY = 'funtush_seen_notifications';

function loadIds(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

function ago(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / (60 * 24))}d ago`;
}

/**
 * Real notifications, derived from what the API already knows: live SOS
 * incidents and booking inquiries waiting for a reply. "Read" is remembered per
 * browser (the API has no notification inbox for the dashboard).
 */
export function useAgencyNotifications() {
  const access = useAgencyAccess();
  const me = useAuth().user?.email;
  const canSeeBookings = access.known && access.can('/dashboard/bookings'); // staff without the bookings permission would only get 403s
  const incidents = useActiveIncidents(canSeeBookings);
  const inquiries = useBookingList({ status: 'INQUIRY', limit: 8 }, canSeeBookings);
  const canSeePackages = access.known && access.can('/dashboard/packages');
  // Who created / edited / published / deleted packages — everyone on the team, you included (shown as "You").
  const pkgActivity = useQuery({ queryKey: ['agency', 'package-activity'], queryFn: () => getRecentPackageActivity(false), enabled: canSeePackages, refetchInterval: 60_000 });
  const canSeeBlog = access.known && access.can('/dashboard/blog');
  // Who wrote the most recent posts — the author name is resolved once at creation.
  const blogActivity = useQuery({ queryKey: ['agency', 'blogs', 'recent'], queryFn: () => listBlogs({ limit: 10 }), enabled: canSeeBlog, refetchInterval: 60_000 });
  const [seenIds, setSeenIds] = useState<Set<string>>(() => (typeof window === 'undefined' ? new Set() : loadIds(SEEN_KEY)));
  const [readIds, setReadIds] = useState<Set<string>>(() => (typeof window === 'undefined' ? new Set() : loadIds(READ_KEY)));

  const notifications = useMemo<AgencyNotification[]>(() => {
    const sos = (incidents.data?.incidents ?? []).map((i) => ({
      id: `sos:${i.id}`,
      type: 'sos' as const,
      title: 'Active SOS Alert',
      description: [i.trekkerName && `Trekker ${i.trekkerName}`, i.guideName && `Guide ${i.guideName}`].filter(Boolean).join(' · ') || 'Open the alert for details',
      time: ago(i.triggeredAt),
    }));
    const bookings = (inquiries.data?.bookings ?? []).map((b) => ({
      id: `inq:${b.id}`,
      type: 'booking' as const,
      title: 'Booking inquiry waiting',
      description: `${b.trekkerName} asked about ${b.package?.title ?? 'a trek'} for ${b.groupSize}.`,
      time: ago(b.createdAt),
    }));
    const packages = (pkgActivity.data ?? []).map((a) => ({
      id: `pkg:${a.id}:${a.updatedAt}`,
      type: 'package' as const,
      title: `${a.actorEmail && a.actorEmail === me ? 'You' : a.actorName} ${activityVerb(a.action)} a package`,
      href: a.action === 'DELETED' ? undefined : `/dashboard/packages/${a.packageId}`,
      description: `${a.packageTitle}${a.action === 'UPDATED' && a.summary ? ` — ${a.summary.replace(/^Edited: /, '')}` : ''}`,
      time: ago(a.updatedAt),
    }));
    const blogs = (blogActivity.data?.data ?? []).map((p) => ({
      id: `blog:${p.id}:${p.createdAt}`,
      type: 'blog' as const,
      title: `${p.authorName ?? 'Someone'} created a blog post`,
      href: `/dashboard/blog/${p.id}`,
      description: p.title,
      time: ago(p.createdAt),
    }));
    return [...sos, ...bookings, ...packages, ...blogs].map((n) => ({ ...n, read: n.type !== 'sos' && readIds.has(n.id) }));
  }, [incidents.data, inquiries.data, pkgActivity.data, blogActivity.data, readIds, me]);

  const persist = (next: Set<string>) => {
    setReadIds(next);
    try {
      localStorage.setItem(READ_KEY, JSON.stringify([...next].slice(-200)));
    } catch {
      /* storage blocked — read state just won't persist */
    }
  };

  const markAsRead = useCallback((id: string) => persist(new Set(readIds).add(id)), [readIds]);
  const markAllAsRead = useCallback(() => persist(new Set([...readIds, ...notifications.map((n) => n.id)])), [readIds, notifications]);

  // Opening the bell counts as seeing everything in it: the red badge only counts what's NEW since you last looked
  // (an active SOS always counts). Items stay highlighted until you click them or "Mark all as read".
  const markAllSeen = useCallback(() => {
    const next = new Set([...seenIds, ...notifications.map((n) => n.id)]);
    setSeenIds(next);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...next].slice(-300)));
    } catch {
      /* storage blocked — the badge just comes back after a refresh */
    }
  }, [seenIds, notifications]);
  const badgeCount = notifications.filter((n) => !n.read && (n.type === 'sos' || !seenIds.has(n.id))).length;

  return { notifications, markAsRead, markAllAsRead, markAllSeen, badgeCount };
}
