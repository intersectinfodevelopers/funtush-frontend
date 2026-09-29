"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Field, SaveBar, TextArea, TextInput } from "@/components/agency/settings/settings-kit";
import FileUploadField from "@/components/ui/FileUploadField";
import { useApiForm } from "@/hooks/useApiForm";
import { siteKeys, useSeo } from "@/hooks/useAgencySite";
import { saveSeo, type SeoValues } from "@/lib/api/agency/site";

const TITLE_MAX = 60;
const DESC_MAX = 160;

export function SeoTab() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useSeo();
  const form = useApiForm<SeoValues>(data, (changed) => {
    const bad = (changed.metaTitle ?? "").length > TITLE_MAX || (changed.metaDescription ?? "").length > DESC_MAX;
    if (bad) return Promise.reject({ message: "Your title or description is too long." });
    return saveSeo(changed);
  }, () => void qc.invalidateQueries({ queryKey: [...siteKeys.all, "seo"] }));

  if (isLoading) return <div className="h-48 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (isError || !form.value) return <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load your SEO settings.</p>;
  const v = form.value;
  const text = (k: "metaTitle" | "metaDescription") => (e: { target: { value: string } }) => form.patch({ [k]: e.target.value.trim() === "" ? null : e.target.value });

  return (
    <div className="space-y-5">
      <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Search & sharing</h2>
          <p className="text-sm text-neutral-500">How your site appears in Google results and when a link is shared.</p>
        </div>
        <Field label="Meta title" htmlFor="seo-title" hint={`${(v.metaTitle ?? "").length}/${TITLE_MAX} characters`}>
          <TextInput id="seo-title" value={v.metaTitle ?? ""} onChange={text("metaTitle")} maxLength={TITLE_MAX} />
        </Field>
        <Field label="Meta description" htmlFor="seo-desc" hint={`${(v.metaDescription ?? "").length}/${DESC_MAX} characters`}>
          <TextArea id="seo-desc" rows={3} value={v.metaDescription ?? ""} onChange={text("metaDescription")} maxLength={DESC_MAX} />
        </Field>
        <FileUploadField label="Social sharing image" value={v.ogImageUrl} onChange={(url) => form.patch({ ogImageUrl: url })} />
      </section>
      <SaveBar dirty={form.dirty} onSave={form.submit} onReset={form.reset} saving={form.saving} error={form.error} />
    </div>
  );
}
