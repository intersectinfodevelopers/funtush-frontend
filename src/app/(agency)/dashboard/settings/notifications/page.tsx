"use client";

import {
  SaveBar,
  SettingsHeader,
  SettingsSection,
  useSettingsForm,
} from "@/components/agency/settings/settings-kit";

type Channel = { email: boolean; inApp: boolean };
type Prefs = Record<string, Channel>;

const EVENTS: { key: string; label: string; description: string }[] = [
  { key: "newInquiry", label: "New booking inquiry", description: "A trekker submits an inquiry for one of your packages." },
  { key: "paymentReceived", label: "Payment received", description: "A trekker completes payment on an accepted booking." },
  { key: "bookingCancelled", label: "Booking cancelled or expired", description: "A booking is cancelled, rejected, or its payment window expires." },
  { key: "newReview", label: "New review", description: "A customer leaves a review for a completed trek." },
  { key: "sosTriggered", label: "SOS / safety incident", description: "A guide or trekker triggers an SOS. Always on for email." },
  { key: "lowSlots", label: "Departure almost full", description: "A departure date drops below 3 remaining seats." },
  { key: "subscription", label: "Subscription & billing", description: "Renewals, failed payments and plan changes." },
  { key: "weeklyDigest", label: "Weekly summary", description: "A Monday digest of bookings, revenue and reviews." },
];

const DEFAULTS: Prefs = Object.fromEntries(
  EVENTS.map((e) => [e.key, { email: true, inApp: true }]),
) as Prefs;

export default function NotificationSettingsPage() {
  const { value, setValue, dirty, save, reset } = useSettingsForm("notificationSettings", DEFAULTS);

  const toggle = (key: string, ch: keyof Channel) => {
    if (key === "sosTriggered" && ch === "email") return; // enforced on
    setValue({ ...value, [key]: { ...value[key], [ch]: !value[key]?.[ch] } });
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Notifications"
        description="Choose how you're told about activity in your workspace. SOS alerts always email you."
      />

      <SettingsSection>
        <div className="hidden grid-cols-[1fr_5rem_5rem] items-center gap-2 pb-2 text-[11px] font-bold uppercase tracking-wide text-neutral-400 sm:grid">
          <span>Event</span>
          <span className="text-center">Email</span>
          <span className="text-center">In-app</span>
        </div>
        <ul className="divide-y divide-neutral-100">
          {EVENTS.map((e) => {
            const ch = value[e.key] ?? { email: false, inApp: false };
            return (
              <li
                key={e.key}
                className="grid grid-cols-1 gap-3 py-3.5 sm:grid-cols-[1fr_5rem_5rem] sm:items-center sm:gap-2"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{e.label}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{e.description}</p>
                </div>
                <div className="flex gap-6 sm:contents">
                  <label className="flex items-center gap-2 text-xs text-neutral-500 sm:justify-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 disabled:opacity-40"
                      checked={ch.email}
                      disabled={e.key === "sosTriggered"}
                      onChange={() => toggle(e.key, "email")}
                    />
                    <span className="sm:hidden">Email</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-neutral-500 sm:justify-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      checked={ch.inApp}
                      onChange={() => toggle(e.key, "inApp")}
                    />
                    <span className="sm:hidden">In-app</span>
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      </SettingsSection>

      <SaveBar dirty={dirty} onSave={save} onReset={reset} />
    </div>
  );
}
