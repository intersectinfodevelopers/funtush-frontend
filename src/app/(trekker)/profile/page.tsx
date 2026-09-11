"use client";

/**
 * Profile — the trekker's account hub: identity, personal details, travel
 * preferences, and account security (password, 2FA, sessions). Frontend-only
 * (mock + localStorage).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Pencil,
  Laptop,
  Smartphone,
  ShieldCheck,
  LogOut,
  Trash2,
  Mountain,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { getEmergencyContact } from "@/lib/auth";
import {
  HubHeader,
  HubSection,
  HubCard,
  Field,
  TextInput,
  SelectInput,
  ToggleRow,
  SaveBar,
  LinkRow,
  useMockForm,
  hubToast,
} from "@/components/trekker/trekker-kit";
import { cn } from "@/lib/utils/cn";
import type { TravelPreferences } from "@/types/user";

import bookingsData from "../../../../data/bookings.json";
import type { RawBooking } from "@/types/trek";

const bookings = bookingsData as RawBooking[];

const FLAGS: Record<string, string> = {
  Nepal: "🇳🇵",
  India: "🇮🇳",
  USA: "🇺🇸",
  UK: "🇬🇧",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Australia: "🇦🇺",
  Japan: "🇯🇵",
  China: "🇨🇳",
  Canada: "🇨🇦",
};

const PREF_DEFAULTS: TravelPreferences = {
  fitnessLevel: "moderate",
  preferredDifficulty: "moderate",
  dietary: "",
  languages: [],
  roomSharing: true,
  newsletterOptIn: false,
};

const LANGS = ["English", "Nepali", "Hindi", "French", "German", "Spanish", "Mandarin"];

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function scorePassword(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
const STRENGTH = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = ["bg-danger-500", "bg-danger-400", "bg-warning-500", "bg-success-400", "bg-success-600"];

const MOCK_SESSIONS = [
  { id: "s1", device: "Chrome · macOS", location: "Kathmandu, NP", lastActive: "Active now", current: true, kind: "laptop" as const },
  { id: "s2", device: "Funtush app · iPhone", location: "Pokhara, NP", lastActive: "3 hours ago", current: false, kind: "phone" as const },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const emergency = useMemo(() => getEmergencyContact(), []);

  const trekCount = useMemo(
    () => (user ? bookings.filter((b) => b.trekker_id === user.id && b.status === "completed").length : 0),
    [user],
  );

  const prefs = useMockForm<TravelPreferences>("trekkerPreferences", PREF_DEFAULTS);

  const [twoFactor, setTwoFactor] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("trekker2fa") === "on";
    } catch {
      return false;
    }
  });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  const strength = scorePassword(pw.next);
  const mismatch = pw.confirm.length > 0 && pw.next !== pw.confirm;
  const canChange = pw.current.length > 0 && strength >= 2 && !mismatch;

  if (!user) {
    return <div className="mx-auto max-w-2xl text-center text-sm text-neutral-500">Loading…</div>;
  }

  const flag = FLAGS[user.country] ?? "🌍";
  const memberSince = new Date(user.member_since).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const toggleLang = (l: string) => {
    const has = prefs.value.languages.includes(l);
    prefs.patch({
      languages: has ? prefs.value.languages.filter((x) => x !== l) : [...prefs.value.languages, l],
    });
  };

  const changePassword = () => {
    if (!canChange) return;
    setPw({ current: "", next: "", confirm: "" });
    hubToast("Password updated");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <HubHeader
        title="Profile"
        action={
          <Link
            href="/profile/edit"
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
        }
      />

      {/* Identity */}
      <HubCard className="overflow-hidden p-0">
        <div className="h-20 bg-primary-900" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-primary-600 text-2xl font-bold text-white shadow-md">
            {initials(user.name)}
          </div>
          <h2 className="mt-4 text-xl font-bold text-neutral-900">{user.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500">
            <span className="flex items-center gap-1">
              <span>{flag}</span> {user.country || "Location not set"}
            </span>
            <span>·</span>
            <span>Member since {memberSince}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Mountain className="h-3.5 w-3.5" /> {trekCount} trek{trekCount === 1 ? "" : "s"} completed
            </span>
          </div>
        </div>
      </HubCard>

      {/* Personal info (read-only) */}
      <HubSection
        title="Personal information"
        action={
          <Link href="/profile/edit" className="text-xs font-semibold text-primary-600 hover:underline">
            Edit
          </Link>
        }
      >
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Detail label="Full name" value={user.name} />
          <Detail label="Email" value={user.email} />
          <Detail label="Phone" value={user.phone || "—"} />
          <Detail label="Country" value={user.country || "—"} />
        </dl>
      </HubSection>

      {/* Emergency contact (read-only) */}
      <HubSection
        title="Emergency contact"
        description="Shared with your guide during active treks."
        action={
          <Link href="/profile/edit" className="text-xs font-semibold text-primary-600 hover:underline">
            Edit
          </Link>
        }
      >
        {emergency ? (
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <Detail label="Name" value={emergency.name} />
            <Detail label="Relationship" value={emergency.relationship} />
            <Detail label="Phone" value={emergency.phone} />
          </dl>
        ) : (
          <p className="text-sm text-neutral-500">
            Not set.{" "}
            <Link href="/profile/edit" className="font-medium text-primary-600 hover:underline">
              Add an emergency contact
            </Link>
            .
          </p>
        )}
      </HubSection>

      {/* Travel preferences */}
      <HubSection title="Travel preferences" description="Helps agencies match you to the right trek.">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fitness level">
              <SelectInput
                value={prefs.value.fitnessLevel}
                onChange={(e) => prefs.patch({ fitnessLevel: e.target.value as TravelPreferences["fitnessLevel"] })}
              >
                <option value="beginner">Beginner</option>
                <option value="moderate">Moderate</option>
                <option value="experienced">Experienced</option>
                <option value="expert">Expert</option>
              </SelectInput>
            </Field>
            <Field label="Preferred difficulty">
              <SelectInput
                value={prefs.value.preferredDifficulty}
                onChange={(e) =>
                  prefs.patch({ preferredDifficulty: e.target.value as TravelPreferences["preferredDifficulty"] })
                }
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging</option>
                <option value="strenuous">Strenuous</option>
              </SelectInput>
            </Field>
          </div>
          <Field label="Dietary requirements" hint="e.g. vegetarian, gluten-free, nut allergy">
            <TextInput
              value={prefs.value.dietary}
              onChange={(e) => prefs.patch({ dietary: e.target.value })}
              placeholder="None"
            />
          </Field>
          <div>
            <p className="mb-1.5 text-sm font-semibold text-neutral-700">Languages you speak</p>
            <div className="flex flex-wrap gap-2">
              {LANGS.map((l) => {
                const on = prefs.value.languages.includes(l);
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => toggleLang(l)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      on
                        ? "bg-primary-600 text-white"
                        : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50",
                    )}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>
          <ToggleRow
            label="Happy to share a room"
            description="Lets agencies pair you with another solo trekker to avoid the single supplement."
            checked={prefs.value.roomSharing}
            onChange={(v) => prefs.patch({ roomSharing: v })}
          />
          <ToggleRow
            label="Trek inspiration emails"
            description="Occasional new routes and seasonal tips. No booking spam."
            checked={prefs.value.newsletterOptIn}
            onChange={(v) => prefs.patch({ newsletterOptIn: v })}
          />
        </div>
        <SaveBar dirty={prefs.dirty} onSave={() => prefs.save("Preferences saved")} onReset={prefs.reset} />
      </HubSection>

      {/* Security */}
      <HubSection title="Password & security">
        <div className="space-y-5">
          <div className="space-y-4">
            <Field label="Current password" required>
              <TextInput
                type="password"
                autoComplete="current-password"
                value={pw.current}
                onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              />
            </Field>
            <Field label="New password" required>
              <TextInput
                type="password"
                autoComplete="new-password"
                value={pw.next}
                onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
              />
              {pw.next.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-1.5 flex-1 rounded-full",
                          i < strength ? STRENGTH_COLOR[strength] : "bg-neutral-200",
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs font-medium text-neutral-500">{STRENGTH[strength]}</p>
                </div>
              )}
            </Field>
            <Field label="Confirm new password" required error={mismatch ? "Passwords do not match." : undefined}>
              <TextInput
                type="password"
                autoComplete="new-password"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                className={mismatch ? "border-danger-300 focus:border-danger-400 focus:ring-danger-50" : ""}
              />
            </Field>
            <button
              type="button"
              onClick={changePassword}
              disabled={!canChange}
              className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-40"
            >
              Update password
            </button>
          </div>

          <ToggleRow
            label="Two-factor authentication"
            description="Require a 6-digit code from an authenticator app at sign-in."
            checked={twoFactor}
            onChange={(v) => {
              setTwoFactor(v);
              try {
                localStorage.setItem("trekker2fa", v ? "on" : "off");
              } catch {
                /* ignore */
              }
              hubToast(v ? "Two-factor turned on" : "Two-factor turned off");
            }}
          />

          <div>
            <p className="mb-2 text-sm font-semibold text-neutral-700">Active sessions</p>
            <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center gap-3 p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                    {s.kind === "phone" ? <Smartphone className="h-4 w-4" /> : <Laptop className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-800">
                      {s.device}
                      {s.current && (
                        <span className="ml-2 rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-bold uppercase text-success-700">
                          This device
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {s.location} · {s.lastActive}
                    </p>
                  </div>
                  {!s.current && (
                    <button
                      type="button"
                      onClick={() => setSessions((list) => list.filter((x) => x.id !== s.id))}
                      className="rounded-lg border border-danger-200 bg-danger-50 px-2.5 py-1.5 text-xs font-semibold text-danger-700 hover:bg-danger-100"
                    >
                      Revoke
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </HubSection>

      {/* Account actions */}
      <HubCard className="p-2">
        <LinkRow icon={<ShieldCheck className="h-5 w-5" />} title="Privacy & data" subtitle="What we store and how to export it" href="/profile" />
        <LinkRow
          icon={<LogOut className="h-5 w-5" />}
          title="Log out"
          subtitle="Sign out of your Funtush account"
          onClick={logout}
          tone="danger"
        />
        <LinkRow
          icon={<Trash2 className="h-5 w-5" />}
          title="Delete account"
          subtitle="Permanently remove your account and data"
          onClick={() => hubToast("Account deletion needs email confirmation (mock)", "info")}
          tone="danger"
        />
      </HubCard>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{label}</dt>
      <dd className="mt-0.5 text-neutral-900">{value}</dd>
    </div>
  );
}
