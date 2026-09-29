"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Field, SaveBar, TextInput, ToggleRow } from "@/components/agency/settings/settings-kit";
import { useApiForm } from "@/hooks/useApiForm";
import { settingsKeys, useNotificationOptions, useNotificationPrefs } from "@/hooks/useAgencySettings";
import { saveNotificationPrefs, type ChannelPref, type NotificationEvent, type NotificationPatch } from "@/lib/api/agency/settings";

const EVENTS: { key: NotificationEvent; label: string; description: string }[] = [
  { key: "newInquiry", label: "New booking inquiry", description: "A trekker submits an inquiry for one of your packages." },
  { key: "paymentReceived", label: "Payment received", description: "A trekker completes payment on an accepted booking." },
  { key: "bookingCancelled", label: "Booking cancelled or expired", description: "A booking is cancelled, rejected, or its payment window expires." },
  { key: "newReview", label: "New review", description: "A customer leaves a review for a completed trek." },
  { key: "sosTriggered", label: "SOS / safety incident", description: "A guide or trekker triggers an SOS. Always on for email." },
  { key: "lowSlots", label: "Departure almost full", description: "A departure date drops below 3 remaining seats." },
  { key: "subscription", label: "Subscription & billing", description: "Renewals, failed payments and plan changes." },
  { key: "weeklyDigest", label: "Weekly summary", description: "A Monday digest of bookings, revenue and reviews." },
];
const MSG_MAX = 200;

interface Flat { preferences: Record<NotificationEvent, ChannelPref>; welcomeEnabled: boolean; welcomeMessage: string | null }

export function NotificationsTab() {
  const qc = useQueryClient();
  const prefs = useNotificationPrefs();
  const options = useNotificationOptions();
  const server = useMemo<Flat | undefined>(() => prefs.data && { preferences: prefs.data.preferences, welcomeEnabled: prefs.data.welcomeBackPopup.enabled, welcomeMessage: prefs.data.welcomeBackPopup.message }, [prefs.data]);
  const form = useApiForm<Flat>(server, (c) => {
    if (c.welcomeMessage && (c.welcomeMessage.length > MSG_MAX || /[<>]/.test(c.welcomeMessage))) return Promise.reject({ message: `The message must be under ${MSG_MAX} characters and can't contain < or >.` });
    const patch: NotificationPatch = {};
    if (c.preferences && server) {
      const diff: NotificationPatch["preferences"] = {};
      for (const k of Object.keys(c.preferences) as NotificationEvent[]) {
        const now = c.preferences[k], was = server.preferences[k];
        const ch: Partial<ChannelPref> = {};
        if (now.email !== was.email) ch.email = now.email;
        if (now.inApp !== was.inApp) ch.inApp = now.inApp;
        if (Object.keys(ch).length) diff[k] = ch;
      }
      patch.preferences = diff;
    }
    if (c.welcomeEnabled !== undefined) patch.welcomeBackPopupEnabled = c.welcomeEnabled;
    if (c.welcomeMessage !== undefined) patch.welcomeBackPopupMessage = c.welcomeMessage;
    return saveNotificationPrefs(patch);
  }, () => void qc.invalidateQueries({ queryKey: [...settingsKeys.all, "notifications"] }));

  if (prefs.isLoading || options.isLoading) return <div className="h-64 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (prefs.isError || options.isError || !form.value || !options.data) return <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load your notification settings.</p>;
  const v = form.value;
  const locked = new Set(options.data.events.filter((e) => e.emailLocked).map((e) => e.id));
  const set = (k: NotificationEvent, ch: keyof ChannelPref, on: boolean) => form.patch({ preferences: { ...v.preferences, [k]: { ...v.preferences[k], [ch]: on } } });

  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div><h2 className="text-lg font-bold text-neutral-900">Notifications</h2><p className="text-sm text-neutral-500">Choose how you hear about each event.</p></div>
        <div className="overflow-x-auto"><table className="min-w-full text-left text-sm">
          <thead className="text-[10px] uppercase tracking-[0.2em] text-neutral-500"><tr><th className="py-2 pr-4">Event</th><th className="px-3 py-2">In-app</th><th className="px-3 py-2">Email</th></tr></thead>
          <tbody>{EVENTS.map((e) => (
            <tr key={e.key} className="border-t border-neutral-200">
              <td className="py-3 pr-4"><div className="font-semibold text-neutral-900">{e.label}</div><div className="text-xs text-neutral-500">{e.description}</div></td>
              <td className="px-3 py-3"><input type="checkbox" aria-label={`${e.label}: in-app`} checked={v.preferences[e.key].inApp} onChange={(x) => set(e.key, "inApp", x.target.checked)} /></td>
              <td className="px-3 py-3"><input type="checkbox" aria-label={`${e.label}: email`} checked={v.preferences[e.key].email} disabled={locked.has(e.key)} onChange={(x) => set(e.key, "email", x.target.checked)} /></td>
            </tr>))}</tbody>
        </table></div>
      </section>
      <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div><h3 className="text-lg font-bold text-neutral-900">Welcome-back popup</h3><p className="text-sm text-neutral-500">Greets returning trekkers on your site.</p></div>
        <ToggleRow label="Show the welcome-back popup" checked={v.welcomeEnabled} onChange={(x) => form.patch({ welcomeEnabled: x })} />
        <Field label="Message" htmlFor="nf-welcome" hint={`${(v.welcomeMessage ?? "").length}/${MSG_MAX} characters`}><TextInput id="nf-welcome" value={v.welcomeMessage ?? ""} maxLength={MSG_MAX} onChange={(e) => form.patch({ welcomeMessage: e.target.value === "" ? null : e.target.value })} /></Field>
      </section>
      <SaveBar dirty={form.dirty} onSave={form.submit} onReset={form.reset} saving={form.saving} error={form.error} />
    </div>
  );
}
