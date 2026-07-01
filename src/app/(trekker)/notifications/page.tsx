'use client';

/**
 * Notifications Page
 * 
 * - Shows mock notifications array
 * - Click → mark as read
 * - Unread items styled differently
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  UserPlus,
  CreditCard,
  Calendar,
  CheckCheck,
} from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { getReadNotificationIds, markNotificationAsRead } from '@/lib/auth';
import type { Notification, NotificationType } from '@/types/user';

// ─── Mock Notifications ─────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: 'Your Everest Base Camp Trek has been confirmed. Departure: Oct 5, 2026.',
    created_at: '2026-06-20T10:00:00Z',
    read: false,
    link: '/my-treks/bk-1001',
  },
  {
    id: 'notif-002',
    type: 'guide_assigned',
    title: 'Guide Assigned',
    message: 'Suresh Tamang has been assigned as your guide for Everest Base Camp Trek.',
    created_at: '2026-06-18T14:30:00Z',
    read: false,
    link: '/my-treks/bk-1001',
  },
  {
    id: 'notif-003',
    type: 'payment_reminder',
    title: 'Payment Reminder',
    message: 'Final payment of $1,200 due in 30 days for your Annapurna Circuit booking.',
    created_at: '2026-06-15T09:00:00Z',
    read: false,
    link: '/my-treks/bk-1002',
  },
  {
    id: 'notif-004',
    type: 'trek_reminder',
    title: 'Trek Starting Soon',
    message: 'Your Langtang Valley Trek begins in 7 days. Check your packing list.',
    created_at: '2026-06-08T08:00:00Z',
    read: true,
    link: '/my-treks/bk-1003',
  },
  {
    id: 'notif-005',
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: 'Your Mustang Heritage trek booking has been confirmed.',
    created_at: '2026-05-30T11:15:00Z',
    read: true,
  },
];

// ─── Icon Per Type ──────────────────────────────────────

const TYPE_ICONS: Record<NotificationType, React.ReactNode> = {
  booking_confirmed: <CheckCircle2 className="h-5 w-5 text-green-600" />,
  guide_assigned: <UserPlus className="h-5 w-5 text-blue-600" />,
  payment_reminder: <CreditCard className="h-5 w-5 text-yellow-600" />,
  trek_reminder: <Calendar className="h-5 w-5 text-primary-600" />,
};

const TYPE_BG: Record<NotificationType, string> = {
  booking_confirmed: 'bg-green-50',
  guide_assigned: 'bg-blue-50',
  payment_reminder: 'bg-yellow-50',
  trek_reminder: 'bg-primary-50',
};

// ─── Format Time ────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Component ──────────────────────────────────────────

export default function NotificationsPage() {
  // Track which notifications are read (combines mock + localStorage)
  const [readIds, setReadIds] = useState<string[]>(() => getReadNotificationIds());

  // Merge mock data with localStorage read state
  const notifications = useMemo(() => {
    return MOCK_NOTIFICATIONS.map((n) => ({
      ...n,
      read: n.read || readIds.includes(n.id),
    }));
  }, [readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Mark all as read ──
  function handleMarkAllRead() {
    const allIds = notifications.filter((n) => !n.read).map((n) => n.id);
    allIds.forEach((id) => markNotificationAsRead(id));
    setReadIds(getReadNotificationIds());
  }

  // ── Mark one as read on click ──
  function handleClickNotification(id: string) {
    markNotificationAsRead(id);
    setReadIds(getReadNotificationIds());
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
            <Bell className="h-6 w-6" />
            Notifications
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Updates about your treks, bookings, and payments
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* ── Notifications List ── */}
      <div className="space-y-2">

        {notifications.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-white p-12 text-center">
            <Bell className="mx-auto h-8 w-8 text-neutral-400" />
            <p className="mt-4 text-sm font-medium text-neutral-700">
              No notifications yet
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isUnread = !notif.read;
            const content = (
              <div
                onClick={() => handleClickNotification(notif.id)}
                className={cn(
                  'flex gap-3 rounded-xl border p-4 transition cursor-pointer',
                  isUnread
                    ? 'border-primary-200 bg-primary-50/30 hover:bg-primary-50'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50'
                )}
              >

                {/* Icon */}
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                    TYPE_BG[notif.type]
                  )}
                >
                  {TYPE_ICONS[notif.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={cn(
                      'text-sm',
                      isUnread ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'
                    )}>
                      {notif.title}
                    </h3>
                    <span className="shrink-0 text-xs text-neutral-500">
                      {formatTimeAgo(notif.created_at)}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-neutral-600">
                    {notif.message}
                  </p>

                  {/* Unread dot */}
                  {isUnread && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-primary-600" />
                      <span className="text-xs font-medium text-primary-600">New</span>
                    </div>
                  )}
                </div>
              </div>
            );

            // Wrap in Link if notification has a link
            return notif.link ? (
              <Link key={notif.id} href={notif.link} className="block">
                {content}
              </Link>
            ) : (
              <div key={notif.id}>{content}</div>
            );
          })
        )}

      </div>

    </div>
  );
}