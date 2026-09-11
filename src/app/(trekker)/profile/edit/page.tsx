"use client";

/**
 * Edit profile — personal information and emergency contact. The rest of the
 * account (preferences, security) lives on /profile.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { updateSession, saveEmergencyContact, getEmergencyContact } from "@/lib/auth";
import {
  HubHeader,
  HubSection,
  Field,
  TextInput,
  SaveBar,
  hubToast,
} from "@/components/trekker/trekker-kit";

const COUNTRIES = ["Nepal", "India", "USA", "UK", "France", "Germany", "Australia", "Japan", "China", "Canada"];

export default function ProfileEditPage() {
  const router = useRouter();
  const { user } = useAuth();

  const initial = useMemo(() => {
    const ec = getEmergencyContact();
    return {
      fullName: user?.name ?? "",
      phone: user?.phone ?? "",
      country: user?.country ?? "",
      nationality: user?.country ?? "",
      emName: ec?.name ?? "",
      emPhone: ec?.phone ?? "",
      emRelationship: ec?.relationship ?? "",
    };
  }, [user]);

  const [form, setForm] = useState(initial);
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const phoneClean = (v: string) => v.replace(/[^\d\s+\-()]/g, "");
  const nameError = form.fullName.trim().length < 2 ? "Enter your full name" : "";
  const emError =
    (form.emName || form.emPhone || form.emRelationship) &&
    !(form.emName.trim() && form.emPhone.trim() && form.emRelationship.trim())
      ? "Fill in all three emergency-contact fields, or leave them all blank"
      : "";

  const save = () => {
    if (nameError || emError) return;
    updateSession({
      name: form.fullName.trim(),
      phone: form.phone.trim(),
      country: form.country.trim(),
    });
    if (form.emName.trim()) {
      saveEmergencyContact({
        name: form.emName.trim(),
        phone: form.emPhone.trim(),
        relationship: form.emRelationship.trim(),
      });
    }
    hubToast("Profile updated");
    router.push("/profile");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <HubHeader title="Edit profile" description="Update your details and emergency contact." back="/profile" />

      <HubSection title="Personal information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required error={nameError}>
            <TextInput value={form.fullName} onChange={(e) => set({ fullName: e.target.value })} />
          </Field>
          <Field label="Email" hint="Contact support to change your email.">
            <TextInput value={user?.email ?? ""} disabled />
          </Field>
          <Field label="Phone">
            <TextInput
              type="tel"
              value={form.phone}
              onChange={(e) => set({ phone: phoneClean(e.target.value) })}
              placeholder="+977 98XXXXXXXX"
            />
          </Field>
          <Field label="Country of residence">
            <select
              value={form.country}
              onChange={(e) => set({ country: e.target.value })}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50"
            >
              <option value="">Select…</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </HubSection>

      <HubSection
        title="Emergency contact"
        description="Shared with your assigned guide during active treks."
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact name" error={emError}>
              <TextInput
                value={form.emName}
                onChange={(e) => set({ emName: e.target.value })}
                placeholder="Marc Laurent"
              />
            </Field>
            <Field label="Relationship">
              <TextInput
                value={form.emRelationship}
                onChange={(e) => set({ emRelationship: e.target.value })}
                placeholder="Spouse"
              />
            </Field>
          </div>
          <Field label="Phone number">
            <TextInput
              type="tel"
              value={form.emPhone}
              onChange={(e) => set({ emPhone: phoneClean(e.target.value) })}
              placeholder="+33 6 98 76 54 32"
            />
          </Field>
        </div>
      </HubSection>

      <SaveBar dirty={dirty && !nameError && !emError} onSave={save} onReset={() => setForm(initial)} />
    </div>
  );
}
