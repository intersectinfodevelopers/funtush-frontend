"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Field, SaveBar, TextInput } from "@/components/agency/settings/settings-kit";
import { useApiForm } from "@/hooks/useApiForm";
import { siteKeys, useSocial } from "@/hooks/useAgencySite";
import { saveSocial, type SocialValues } from "@/lib/api/agency/site";

const URL_FIELDS: { key: keyof SocialValues; label: string; placeholder: string }[] = [
  { key: "facebookUrl", label: "Facebook", placeholder: "https://facebook.com/yourpage" },
  { key: "instagramUrl", label: "Instagram", placeholder: "https://instagram.com/yourhandle" },
  { key: "tiktokUrl", label: "TikTok", placeholder: "https://tiktok.com/@yourhandle" },
  { key: "youtubeUrl", label: "YouTube", placeholder: "https://youtube.com/@yourchannel" },
];
const isHttp = (s: string) => { try { const u = new URL(s); return u.protocol === "http:" || u.protocol === "https:"; } catch { return false; } };

export function SocialTab() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useSocial();
  const form = useApiForm<SocialValues>(data, (changed) => {
    for (const f of URL_FIELDS) {
      const val = changed[f.key];
      if (val && !isHttp(val)) return Promise.reject({ message: `${f.label} must be a full link starting with https://` });
    }
    if (changed.whatsappNumber && !/^\+?\d{7,15}$/.test(changed.whatsappNumber)) return Promise.reject({ message: "WhatsApp number must be 7–15 digits, optionally starting with +." });
    return saveSocial(changed);
  }, () => void qc.invalidateQueries({ queryKey: [...siteKeys.all, "social"] }));

  if (isLoading) return <div className="h-48 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (isError || !form.value) return <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load your social links.</p>;
  const v = form.value;
  const set = (k: keyof SocialValues) => (e: { target: { value: string } }) => form.patch({ [k]: e.target.value.trim() === "" ? null : e.target.value.trim() });

  return (
    <div className="space-y-5">
      <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div><h2 className="text-lg font-bold text-neutral-900">Social links</h2><p className="text-sm text-neutral-500">Shown in your site&apos;s footer and contact page. Leave a field empty to hide it.</p></div>
        <div className="grid gap-5 sm:grid-cols-2">
          {URL_FIELDS.map((f) => (
            <Field key={f.key} label={f.label} htmlFor={`soc-${f.key}`}>
              <TextInput id={`soc-${f.key}`} value={v[f.key] ?? ""} onChange={set(f.key)} placeholder={f.placeholder} />
            </Field>
          ))}
          <Field label="WhatsApp number" htmlFor="soc-whatsapp" hint="Digits only, with country code — e.g. +9779800000000">
            <TextInput id="soc-whatsapp" value={v.whatsappNumber ?? ""} onChange={set("whatsappNumber")} placeholder="+9779800000000" />
          </Field>
        </div>
      </section>
      <SaveBar dirty={form.dirty} onSave={form.submit} onReset={form.reset} saving={form.saving} error={form.error} />
    </div>
  );
}
