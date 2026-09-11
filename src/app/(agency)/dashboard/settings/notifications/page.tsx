"use client";

import { useState } from "react";
import { Bell, Users } from "lucide-react";
import {
  Field,
  SaveBar,
  SettingsHeader,
  SettingsSection,
  TextInput,
  ToggleRow,
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
  EVENTS.map((e) => [e.key, { email: false, inApp: true }]),
) as Prefs;
// SOS is the one event that must always reach you by email, no matter what.
DEFAULTS.sosTriggered = { email: true, inApp: true };

type VisitorPopup = {
  enabled: boolean;
  message: string;
};

const VISITOR_DEFAULTS: VisitorPopup = {
  enabled: true,
  message: "Welcome back! Ready to plan your next trek with us?",
};

export default function NotificationSettingsPage() {
  const { value, setValue, dirty, save, reset } = useSettingsForm("notificationSettings", DEFAULTS);
  const visitorForm = useSettingsForm<VisitorPopup>("visitorPopupSettings", VISITOR_DEFAULTS);
  const [showPreview, setShowPreview] = useState(false);

  const toggle = (key: string, ch: keyof Channel) => {
    if (key === "sosTriggered" && ch === "email") return; // enforced on
    setValue({ ...value, [key]: { ...value[key], [ch]: !value[key]?.[ch] } });
  };

  const allDirty = dirty || visitorForm.dirty;
  const saveAll = () => {
    save();
    visitorForm.save();
  };
  const resetAll = () => {
    reset();
    visitorForm.reset();
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Notifications"
        description="In-app is the default and shows instantly — turn on email only for what you'd want to know about away from your desk."
      />

      {/* In-app popup to returning visitors */}
      <SettingsSection
        title="Welcome-back popup"
        description="A one-time in-app popup shown to trekkers who have visited or booked with you before, based on their booking history."
        icon={<Users className="h-4 w-4" />}
      >
        <div className="space-y-4">
          <ToggleRow
            label="Show a welcome-back popup to returning trekkers"
            description="Fires once per visit for a signed-in trekker who has an inquiry, booking, or completed trek with your agency."
            checked={visitorForm.value.enabled}
            onChange={(v) => visitorForm.patch({ enabled: v })}
          />
          <Field label="Popup message" hint="Keep it short — this appears as a small card, not a full page.">
            <TextInput
              value={visitorForm.value.message}
              onChange={(e) => visitorForm.patch({ message: e.target.value })}
              disabled={!visitorForm.value.enabled}
              maxLength={140}
              placeholder="Welcome back! Ready to plan your next trek with us?"
            />
          </Field>
          <button
            type="button"
            onClick={() => setShowPreview((s) => !s)}
            className="text-xs font-semibold text-primary-700 hover:underline"
          >
            {showPreview ? "Hide preview" : "Preview"}
          </button>
          {showPreview && (
            <div className="pointer-events-none flex max-w-xs items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-lg">
              <span className="mt-0.5 rounded-lg bg-primary-50 p-1.5 text-primary-700">
                <Bell className="h-4 w-4" />
              </span>
              <p className="text-sm text-neutral-800">
                {visitorForm.value.message || "Welcome back! Ready to plan your next trek with us?"}
              </p>
            </div>
          )}
        </div>
      </SettingsSection>

      {/* Per-event channels */}
      <SettingsSection
        title="Event alerts"
        description="Choose which events notify you, and how."
      >
        <div className="hidden grid-cols-[1fr_5rem_5rem] items-center gap-2 pb-2 text-[11px] font-bold uppercase tracking-wide text-neutral-400 sm:grid">
          <span>Event</span>
          <span className="text-center">In-app</span>
          <span className="text-center">Email</span>
        </div>
        <ul className="divide-y divide-neutral-100">
          {EVENTS.map((e) => {
            const ch = value[e.key] ?? { email: false, inApp: true };
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
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      checked={ch.inApp}
                      onChange={() => toggle(e.key, "inApp")}
                    />
                    <span className="sm:hidden">In-app</span>
                  </label>
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
                </div>
              </li>
            );
          })}
        </ul>
      </SettingsSection>

      <SaveBar dirty={allDirty} onSave={saveAll} onReset={resetAll} />
    </div>
  );
}
