"use client";

/**
 * Notifications — the trekker's feed of booking updates, guide assignments,
 * payment reminders and review requests. Read state is kept in localStorage.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Compass,
  Clock,
  Calendar,
  Star,
  MessageSquare,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/hooks/useAuth";
import { getReadNotificationIds, markNotificationAsRead } from "@/lib/auth";
import { loadNotifications } from "@/lib/mock/trek-content";
import { HubHeader, HubCard, EmptyState } from "@/components/trekker/trekker-kit";
import type { Notification, NotificationType } from "@/types/user";

import notificationsData from "../../../../data/notifications.json";

const ALL = notificationsData as Notification[];

const TYPE_ICON: Record<NotificationType, { icon: React.ElementType; chip: string }> = {
  guide_assigned: { icon: Compass, chip: "bg-primary-50 text-primary-600" },
  booking_confirmed: { icon: CheckCircle2, chip: "bg-success-50 text-success-600" },
  payment_reminder: { icon: Clock, chip: "bg-warning-50 text-warning-600" },
  trek_reminder: { icon: Calendar, chip: "bg-accent-50 text-accent-600" },
  review_request: { icon: Star, chip: "bg-primary-50 text-primary-600" },
  message: { icon: MessageSquare, chip: "bg-neutral-100 text-neutral-600" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function bucketOf(dateStr: string): "Today" | "This week" | "Earlier" {
  const days = (Date.now() - new Date(dateStr).getTime()) / 86_400_000;
  if (days < 1) return "Today";
  if (days < 7) return "This week";
  return "Earlier";
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [readIds, setReadIds] = useState<string[]>(() => getReadNotificationIds());
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const items = useMemo(() => {
    const base = loadNotifications(ALL, user?.id).map((n) => ({
      ...n,
      read: n.read || readIds.includes(n.id),
    }));
    return filter === "unread" ? base.filter((n) => !n.read) : base;
  }, [user, readIds, filter]);

  const unreadCount = useMemo(
    () =>
      loadNotifications(ALL, user?.id).filter((n) => !(n.read || readIds.includes(n.id))).length,
    [user, readIds],
  );

  const grouped = useMemo(() => {
    const g: Record<string, typeof items> = { Today: [], "This week": [], Earlier: [] };
    items.forEach((n) => g[bucketOf(n.created_at)].push(n));
    return g;
  }, [items]);

  const markAllRead = () => {
    items.filter((n) => !n.read).forEach((n) => markNotificationAsRead(n.id));
    setReadIds(getReadNotificationIds());
  };
  const onClick = (id: string) => {
    markNotificationAsRead(id);
    setReadIds(getReadNotificationIds());
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <HubHeader
        title="Notifications"
        description="Booking updates, guide assignments and trek reminders."
        action={
          unreadCount > 0 ? (
            <button
              onClick={markAllRead}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Mark all as read
            </button>
          ) : undefined
        }
      />

      <div className="flex gap-2">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-colors",
              filter === f
                ? "bg-primary-900 text-white"
                : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
            )}
          >
            {f}
            {f === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-danger-500 px-1.5 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-7 w-7" />}
          title={filter === "unread" ? "You're all caught up" : "No notifications yet"}
          description="Updates about your treks will show up here."
        />
      ) : (
        <div className="space-y-6">
          {(["Today", "This week", "Earlier"] as const).map((bucket) =>
            grouped[bucket].length === 0 ? null : (
              <div key={bucket}>
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  {bucket}
                </p>
                <HubCard className="divide-y divide-neutral-100 p-0">
                  {grouped[bucket].map((n) => (
                    <NotificationRow key={n.id} n={n} onClick={() => onClick(n.id)} />
                  ))}
                </HubCard>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function NotificationRow({ n, onClick }: { n: Notification; onClick: () => void }) {
  const cfg = TYPE_ICON[n.type] ?? TYPE_ICON.message;
  const Icon = cfg.icon;
  const body = (
    <div
      onClick={onClick}
      className={cn(
        "flex gap-3 px-5 py-4 transition-colors",
        n.link && "cursor-pointer",
        !n.read ? "bg-primary-50/40 hover:bg-primary-50" : "hover:bg-neutral-50",
      )}
    >
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", cfg.chip)}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={cn(
              "text-sm leading-tight",
              !n.read ? "font-bold text-neutral-900" : "font-semibold text-neutral-800",
            )}
          >
            {n.title}
          </h3>
          {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-600" />}
        </div>
        <p className={cn("mt-1 text-sm leading-relaxed", !n.read ? "text-neutral-700" : "text-neutral-500")}>
          {n.message}
        </p>
        <p className="mt-1.5 text-xs text-neutral-400">{timeAgo(n.created_at)}</p>
      </div>
    </div>
  );
  return n.link ? (
    <Link href={n.link} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}
