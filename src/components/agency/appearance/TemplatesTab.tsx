"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lock, Pencil } from "lucide-react";
import { useSettingsToast } from "@/components/agency/settings/settings-kit";
import { siteKeys, useSitePage, useSitePageOptions } from "@/hooks/useAgencySite";
import { applyTemplate } from "@/lib/api/agency/site";
import type { ApiError } from "@/lib/api/client";

export function TemplatesTab() {
  const qc = useQueryClient();
  const toast = useSettingsToast();
  const page = useSitePage();
  const options = useSitePageOptions();
  const [error, setError] = useState<string | null>(null);
  const apply = useMutation({
    mutationFn: (id: string) => applyTemplate(id),
    onSuccess: () => { setError(null); toast("Template applied"); void qc.invalidateQueries({ queryKey: [...siteKeys.all, "site-page"] }); },
    onError: (e) => setError((e as unknown as ApiError).message || "Couldn't apply the template."),
  });

  if (page.isLoading || options.isLoading) return <div className="h-64 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (page.isError || options.isError || !page.data || !options.data) return <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load your templates.</p>;
  const current = page.data.templateId;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-bold text-neutral-900">Templates</h2><p className="text-sm text-neutral-500">Start from a ready-made layout, then adjust it in the editor. Applying a template replaces your current sections.</p></div>
        <Link href="/dashboard/appearance/editor" className="inline-flex items-center gap-2 rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"><Pencil className="h-4 w-4" /> Open editor</Link>
      </div>
      {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {options.data.templates.map((t) => (
          <article key={t.id} aria-label={t.name} className="flex flex-col justify-between space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div>
              <div className="flex items-start justify-between gap-2"><h3 className="font-bold text-neutral-900">{t.name}</h3>{current === t.id && <span className="rounded-full bg-success-50 px-2 py-0.5 text-xs font-bold text-success-700">In use</span>}{t.locked && <Lock className="h-4 w-4 text-neutral-400" aria-label="Paid plan" />}</div>
              <p className="mt-1 text-sm text-neutral-600">{t.description}</p>
              <p className="mt-2 text-xs text-neutral-400">{t.sections.join(" · ")}</p>
            </div>
            {t.locked
              ? <Link href="/dashboard/settings?tab=subscription" className="rounded-xl border border-neutral-300 px-3 py-2 text-center text-sm font-semibold hover:bg-neutral-50">Upgrade to use</Link>
              : <button type="button" disabled={apply.isPending || current === t.id} onClick={() => { if (window.confirm(`Apply “${t.name}”? Your current sections will be replaced.`)) apply.mutate(t.id); }} className="rounded-xl bg-primary-900 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{current === t.id ? "Currently applied" : "Apply template"}</button>}
          </article>
        ))}
      </div>
    </div>
  );
}
