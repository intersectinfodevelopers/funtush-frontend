'use client';

/**
 * Notifications Page 
 */

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Compass,
  Clock,
  Calendar,
  Star,
} from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { getReadNotificationIds, markNotificationAsRead } from '@/lib/auth';
import type { Notification, NotificationType } from '@/types/user';

// ─── Mock Notifications ──────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    type: 'guide_assigned',
    title: 'Guide assigned to your trek',
    message: 'Bishal Tamang has been assigned as your guide for Everest Base Camp Trek.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false,
    link: '/my-treks/bk-1001',
  },
  {
    id: 'notif-002',
    type: 'booking_confirmed',
    title: 'Payment confirmed',
    message: 'Your payment of $2,450 for Everest Base Camp Trek was received.',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: false,
    link: '/my-treks/bk-1001',
  },
  {
    id: 'notif-003',
    type: 'payment_reminder',
    title: 'Payment reminder',
    message: 'Complete payment for Langtang Valley Trek within 48 hours to secure your slot.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
    read: true,
    link: '/my-treks/bk-1002',
  },
  {
    id: 'notif-004',
    type: 'trek_reminder',
    title: 'Trek starts in 48 hours',
    message: 'Your Annapurna Base Camp Trek departs soon — review your packing list.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
    read: true,
    link: '/my-treks/bk-1003',
  },
  {
    id: 'notif-005',
    type: 'trek_reminder',
    title: 'How was your trek?',
    message: 'Leave a review for Manaslu Circuit Trek with Summit Trails Nepal.',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks
    read: true,
  },
];

// ─── Icon Config Per Type ──────────────────

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; bg: string; color: string }> = {
  guide_assigned: {
    icon: Compass,
    bg: 'bg-orange-100',
    color: 'text-orange-600',
  },
  booking_confirmed: {
    icon: CheckCircle2,
    bg: 'bg-green-100',
    color: 'text-green-600',
  },
  payment_reminder: {
    icon: Clock,
    bg: 'bg-yellow-100',
    color: 'text-yellow-600',
  },
  trek_reminder: {
    icon: Calendar,
    bg: 'bg-blue-100',
    color: 'text-blue-600',
  },
};

// Special icon for review type (mapped via title)
const REVIEW_CONFIG = {
  icon: Star,
  bg: 'bg-purple-100',
  color: 'text-purple-600',
};

// ─── Format Time Ago ──────────────────────

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Component ────────────────────────────

export default function NotificationsPage() {
  const [readIds, setReadIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Initialize mounted/read ids asynchronously to avoid synchronous setState in effect.
  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      setReadIds(getReadNotificationIds());
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const notifications = useMemo(() => {
    return MOCK_NOTIFICATIONS.map((n) => ({
      ...n,
      read: n.read || readIds.includes(n.id),
    }));
  }, [readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleMarkAllRead() {
    const allIds = notifications.filter((n) => !n.read).map((n) => n.id);
    allIds.forEach((id) => markNotificationAsRead(id));
    setReadIds(getReadNotificationIds());
  }

  function handleClickNotification(id: string) {
    markNotificationAsRead(id);
    setReadIds(getReadNotificationIds());
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Booking updates, guide assignments and trek reminders
          </p>
        </div>

        {mounted && unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* ── Notifications Card ── */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">

        {!mounted ? (
          /* Loading skeleton */
          <div className="divide-y divide-neutral-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 p-4">
                <div className="h-10 w-10 rounded-lg bg-neutral-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-neutral-100" />
                  <div className="h-3 w-full rounded bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
              <Bell className="h-7 w-7 text-neutral-400" />
            </div>
            <p className="mt-4 text-base font-semibold text-neutral-700">
              No notifications yet
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              You&apos;ll see updates about your treks here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onClick={() => handleClickNotification(notif.id)}
              />
            ))}
          </div>
        )}

      </div>

    </div>
  );
}

// ─── Notification Item ────────────────────

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const isUnread = !notification.read;

  // Get icon config (special case for review)
  const isReview = notification.title.toLowerCase().includes('review') ||
                    notification.title.toLowerCase().includes('how was');
  const config = isReview ? REVIEW_CONFIG : TYPE_CONFIG[notification.type];
  const Icon = config.icon;

  const content = (
    <div
      onClick={onClick}
      className={cn(
        'flex gap-3 px-5 py-4 transition-colors cursor-pointer',
        isUnread ? 'bg-blue-50/60 hover:bg-blue-50' : 'bg-white hover:bg-neutral-50'
      )}
    >

      {/* Icon Badge */}
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
        config.bg
      )}>
        <Icon className={cn('h-5 w-5', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn(
            'text-sm leading-tight',
            isUnread ? 'font-bold text-neutral-900' : 'font-semibold text-neutral-800'
          )}>
            {notification.title}
          </h3>

          {/* Unread dot */}
          {isUnread && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-600" />
          )}
        </div>

        <p className={cn(
          'mt-1 text-sm leading-relaxed',
          isUnread ? 'text-neutral-700' : 'text-neutral-500'
        )}>
          {notification.message}
        </p>

        <p className="mt-1.5 text-xs text-neutral-400">
          {formatTimeAgo(notification.created_at)}
        </p>
      </div>
    </div>
  );

  return notification.link ? (
    <Link href={notification.link} className="block">
      {content}
    </Link>
  ) : (
    <div>{content}</div>
  );
}