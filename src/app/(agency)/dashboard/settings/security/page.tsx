"use client";

import { useState } from "react";
import { Laptop, Smartphone, ShieldCheck } from "lucide-react";
import {
  Field,
  SettingsHeader,
  SettingsSection,
  TextInput,
  ToggleRow,
  useSettingsToast,
  useSettingsForm,
} from "@/components/agency/settings/settings-kit";

type Session = {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
  kind: "laptop" | "phone";
};

const MOCK_SESSIONS: Session[] = [
  { id: "s1", device: "Chrome · macOS", location: "Kathmandu, NP", lastActive: "Active now", current: true, kind: "laptop" },
  { id: "s2", device: "Safari · iPhone", location: "Pokhara, NP", lastActive: "2 hours ago", current: false, kind: "phone" },
  { id: "s3", device: "Firefox · Windows", location: "Kathmandu, NP", lastActive: "Yesterday", current: false, kind: "laptop" },
];

function scorePassword(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
const STRENGTH = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = ["bg-danger-500", "bg-danger-400", "bg-warning-500", "bg-success-400", "bg-success-600"];

export default function SecuritySettingsPage() {
  const toast = useSettingsToast();
  const { value, patch, save } = useSettingsForm("securitySettings", { twoFactor: false });

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  const strength = scorePassword(next);
  const mismatch = confirm.length > 0 && next !== confirm;
  const canSubmit = current.length > 0 && strength >= 2 && !mismatch;

  const changePassword = () => {
    if (!canSubmit) return;
    setCurrent("");
    setNext("");
    setConfirm("");
    toast("Password updated");
  };

  const revoke = (id: string) => setSessions((s) => s.filter((x) => x.id !== id));
  const revokeOthers = () => setSessions((s) => s.filter((x) => x.current));

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Security"
        description="Your password, two-factor authentication and where you're signed in."
      />

      <SettingsSection title="Change password">
        <div className="space-y-4">
          <Field label="Current password" required>
            <TextInput
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          <Field label="New password" required>
            <TextInput
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoComplete="new-password"
            />
            {next.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i < strength ? STRENGTH_COLOR[strength] : "bg-neutral-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs font-medium text-neutral-500">{STRENGTH[strength]}</p>
              </div>
            )}
          </Field>
          <Field label="Confirm new password" required>
            <TextInput
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className={mismatch ? "border-danger-300 focus:border-danger-400 focus:ring-danger-50" : ""}
            />
            {mismatch && (
              <p className="mt-1 text-xs font-medium text-danger-600">Passwords do not match.</p>
            )}
          </Field>
          <button
            type="button"
            onClick={changePassword}
            disabled={!canSubmit}
            className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-40"
          >
            Update password
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Two-factor authentication">
        <ToggleRow
          label="Require a 6-digit code at sign-in"
          description="Uses an authenticator app (Google Authenticator, 1Password, Authy)."
          checked={value.twoFactor}
          onChange={(v) => {
            patch({ twoFactor: v });
            save();
          }}
        />
        {value.twoFactor && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-success-50 px-3 py-2 text-xs font-medium text-success-800">
            <ShieldCheck className="h-4 w-4" /> Two-factor is on for your account.
          </div>
        )}
      </SettingsSection>

      <SettingsSection
        title="Active sessions"
        description="Devices currently signed in to your agency account."
        action={
          sessions.length > 1 ? (
            <button
              type="button"
              onClick={revokeOthers}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Sign out everywhere else
            </button>
          ) : undefined
        }
      >
        <ul className="divide-y divide-neutral-100">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-3">
              <span className="rounded-xl bg-neutral-100 p-2 text-neutral-500">
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
                  onClick={() => revoke(s.id)}
                  className="rounded-lg border border-danger-200 bg-danger-50 px-2.5 py-1.5 text-xs font-semibold text-danger-700 hover:bg-danger-100"
                >
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
      </SettingsSection>
    </div>
  );
}
