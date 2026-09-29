"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Field, SaveBar, TextArea, TextInput, ToggleRow } from "@/components/agency/settings/settings-kit";
import { useApiForm } from "@/hooks/useApiForm";
import { settingsKeys, useEmailSettings } from "@/hooks/useAgencySettings";
import { saveEmailSettings, type EmailValues } from "@/lib/api/agency/settings";

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const EMAIL_FIELDS: { key: "fromAddress" | "replyTo" | "bccBookingsTo"; label: string; hint: string }[] = [
  { key: "fromAddress", label: "From address", hint: "The address your emails appear to come from." },
  { key: "replyTo", label: "Reply-to address", hint: "Where trekkers' replies go." },
  { key: "bccBookingsTo", label: "Copy booking emails to", hint: "Every booking email is also sent here." },
];

export function EmailTab() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useEmailSettings();
  const form = useApiForm<EmailValues>(data, (c) => {
    for (const f of EMAIL_FIELDS) { const x = c[f.key]; if (x && !EMAIL_RE.test(x)) return Promise.reject({ message: `${f.label}: enter a valid email address.` }); }
    for (const k of ["senderName", "footerText"] as const) if (c[k] && /[<>]/.test(c[k] as string)) return Promise.reject({ message: "Text can't contain < or >." });
    return saveEmailSettings(c);
  }, () => void qc.invalidateQueries({ queryKey: [...settingsKeys.all, "email"] }));

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (isError || !form.value) return <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load your email settings.</p>;
  const v = form.value;
  const set = (k: keyof EmailValues) => (e: { target: { value: string } }) => form.patch({ [k]: e.target.value.trim() === "" ? null : e.target.value } as Partial<EmailValues>);

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div><h2 className="text-lg font-bold text-neutral-900">Email</h2><p className="text-sm text-neutral-500">How the emails Funtush sends for you look and who receives copies.</p></div>
        <Field label="Sender name" htmlFor="em-name"><TextInput id="em-name" value={v.senderName ?? ""} onChange={set("senderName")} maxLength={80} placeholder="Demo Trek Co" /></Field>
        {EMAIL_FIELDS.map((f) => <Field key={f.key} label={f.label} htmlFor={`em-${f.key}`} hint={f.hint}><TextInput id={`em-${f.key}`} type="email" value={v[f.key] ?? ""} onChange={set(f.key)} /></Field>)}
        <Field label="Email footer" htmlFor="em-footer"><TextArea id="em-footer" rows={2} value={v.footerText ?? ""} onChange={set("footerText")} maxLength={300} /></Field>
        <ToggleRow label="Include an unsubscribe link" checked={v.includeUnsubscribe} onChange={(x) => form.patch({ includeUnsubscribe: x })} />
      </section>
      <SaveBar dirty={form.dirty} onSave={form.submit} onReset={form.reset} saving={form.saving} error={form.error} />
    </div>
  );
}
