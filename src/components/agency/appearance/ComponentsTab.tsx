"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Field, SaveBar, TextArea, TextInput, ToggleRow } from "@/components/agency/settings/settings-kit";
import { useApiForm } from "@/hooks/useApiForm";
import { siteKeys, useBrandingOptions, useSiteConfig, useSiteConfigOptions } from "@/hooks/useAgencySite";
import { saveSiteConfig, type SiteConfig, type SiteConfigValues } from "@/lib/api/agency/site";

export type TopBarStyle = "default" | "scrolling";

const selectClass = "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50";
const isHttp = (s: string) => { try { const u = new URL(s); return u.protocol === "http:" || u.protocol === "https:"; } catch { return false; } };
const len = (s: string | null | undefined, min: number, max: number, label: string) => (s != null && (s.trim().length < min || s.length > max) ? `${label} must be ${min}–${max} characters.` : null);

function Section({ title, description, note, children }: { title: string; description: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm" aria-label={title}>
      <div><h3 className="text-lg font-bold text-neutral-900">{title}</h3><p className="text-sm text-neutral-500">{description}</p></div>
      {note && <p className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-2.5 text-sm text-warning-800">{note}</p>}
      {children}
    </section>
  );
}

/** Wraps the flat values object so useApiForm can diff and patch it. */
export function ComponentsTab() {
  const qc = useQueryClient();
  const config = useSiteConfig();
  const options = useSiteConfigOptions();
  const branding = useBrandingOptions();
  const form = useApiForm<SiteConfigValues>(config.data?.values, (c) => {
    const problems = [
      len(c.constructionHeadline, 2, 80, "Headline"), len(c.constructionMessage, 2, 500, "Message"), len(c.topBarText, 1, 200, "Announcement text"),
      len(c.popupTitle, 2, 80, "Popup title"), len(c.popupBody, 2, 1000, "Popup text"), len(c.popupCtaLabel, 1, 40, "Button label"),
      c.topBarLinkUrl && !isHttp(c.topBarLinkUrl) ? "The announcement link must start with https://" : null,
      c.popupCtaUrl && !isHttp(c.popupCtaUrl) ? "The popup button link must start with https://" : null,
    ].filter(Boolean);
    if (problems.length) return Promise.reject({ message: problems[0] });
    return saveSiteConfig(c);
  }, () => void qc.invalidateQueries({ queryKey: [...siteKeys.all, "site-config"] }));

  if (config.isLoading || options.isLoading) return <div className="h-64 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (config.isError || options.isError || !form.value || !options.data || !config.data) return <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load your site settings.</p>;
  const v = form.value;
  const caps: SiteConfig["capabilities"] = config.data.capabilities;
  const o = options.data;
  const nullable = (k: keyof SiteConfigValues) => (e: { target: { value: string } }) => form.patch({ [k]: e.target.value === "" ? null : e.target.value } as Partial<SiteConfigValues>);
  const palette = branding.data?.palette ?? [];

  return (
    <div className="space-y-5">
      <Section title="Site status" description="Take your site offline for visitors while you get it ready.">
        <ToggleRow label="Under construction" description="Visitors see a “coming soon” page instead of your site." checked={v.underConstruction} onChange={(x) => form.patch({ underConstruction: x })} />
        {v.underConstruction && (
          <div className="grid gap-4">
            <Field label="Headline" htmlFor="sc-head"><TextInput id="sc-head" value={v.constructionHeadline ?? ""} onChange={nullable("constructionHeadline")} maxLength={80} placeholder="We're launching soon" /></Field>
            <Field label="Message" htmlFor="sc-msg"><TextArea id="sc-msg" rows={3} value={v.constructionMessage ?? ""} onChange={nullable("constructionMessage")} maxLength={500} /></Field>
          </div>
        )}
      </Section>

      <Section title="Announcement bar" description="A slim bar above your header — sales, closures, notices.">
        <ToggleRow label="Show the announcement bar" checked={v.topBarEnabled} onChange={(x) => form.patch({ topBarEnabled: x })} />
        {v.topBarEnabled && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field label="Text" htmlFor="sc-bar-text"><TextInput id="sc-bar-text" value={v.topBarText ?? ""} onChange={nullable("topBarText")} maxLength={200} /></Field></div>
            <Field label="Link (optional)" htmlFor="sc-bar-link"><TextInput id="sc-bar-link" value={v.topBarLinkUrl ?? ""} onChange={nullable("topBarLinkUrl")} placeholder="https://…" /></Field>
            <Field label="Behaviour" htmlFor="sc-bar-beh"><select id="sc-bar-beh" className={selectClass} value={v.topBarBehavior} onChange={(e) => form.patch({ topBarBehavior: e.target.value })}>{o.topBarBehaviors.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}</select></Field>
            <Field label="Background colour" htmlFor="sc-bar-col" hint="Leave on “Brand colour” to match your theme.">
              {caps.topBarColorMode === "free" ? (
                <TextInput id="sc-bar-col" value={v.topBarBackgroundColor ?? ""} onChange={nullable("topBarBackgroundColor")} placeholder="#0F766E" />
              ) : (
                <select id="sc-bar-col" className={selectClass} value={v.topBarBackgroundColor ?? ""} onChange={nullable("topBarBackgroundColor")}><option value="">Brand colour</option>{palette.map((p) => <option key={p.id} value={p.hex}>{p.label}</option>)}</select>
              )}
            </Field>
            <div className="self-end"><ToggleRow label="Visitors can dismiss it" checked={v.topBarDismissible} onChange={(x) => form.patch({ topBarDismissible: x })} /></div>
          </div>
        )}
      </Section>

      <Section title="Popup" description="A modal that greets visitors — one clear offer works best." note={caps.popupModal ? undefined : o.notes.popupModal}>
        <div className={caps.popupModal ? "space-y-4" : "pointer-events-none space-y-4 opacity-50"} aria-disabled={!caps.popupModal}>
          <ToggleRow label="Show the popup" checked={v.popupEnabled} disabled={!caps.popupModal} onChange={(x) => form.patch({ popupEnabled: x })} />
          {v.popupEnabled && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" htmlFor="sc-pop-title"><TextInput id="sc-pop-title" value={v.popupTitle ?? ""} onChange={nullable("popupTitle")} maxLength={80} /></Field>
              <Field label="Button label" htmlFor="sc-pop-cta"><TextInput id="sc-pop-cta" value={v.popupCtaLabel ?? ""} onChange={nullable("popupCtaLabel")} maxLength={40} /></Field>
              <div className="sm:col-span-2"><Field label="Text" htmlFor="sc-pop-body"><TextArea id="sc-pop-body" rows={3} value={v.popupBody ?? ""} onChange={nullable("popupBody")} maxLength={1000} /></Field></div>
              <Field label="Button link" htmlFor="sc-pop-url"><TextInput id="sc-pop-url" value={v.popupCtaUrl ?? ""} onChange={nullable("popupCtaUrl")} placeholder="https://…" /></Field>
              <Field label="When it opens" htmlFor="sc-pop-trig"><select id="sc-pop-trig" className={selectClass} value={v.popupTrigger} onChange={(e) => form.patch({ popupTrigger: e.target.value })}>{o.popupTriggers.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select></Field>
              {v.popupTrigger === "AFTER_DELAY" && <Field label="Delay (seconds)" htmlFor="sc-pop-delay"><TextInput id="sc-pop-delay" type="number" min={0} max={120} value={v.popupDelaySeconds} onChange={(e) => form.patch({ popupDelaySeconds: Math.min(120, Math.max(0, Math.round(Number(e.target.value) || 0))) })} /></Field>}
              <Field label="How often" htmlFor="sc-pop-freq"><select id="sc-pop-freq" className={selectClass} value={v.popupFrequency} onChange={(e) => form.patch({ popupFrequency: e.target.value })}>{o.popupFrequencies.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}</select></Field>
            </div>
          )}
        </div>
      </Section>

      <p className="text-xs text-neutral-500">{o.notes.funtushBadge}</p>
      <div className="flex justify-end"><Link href="/dashboard/appearance?tab=domain" className="inline-flex items-center gap-2 rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800">Continue to Domain &amp; Publish <ArrowRight className="h-4 w-4" /></Link></div>
      <SaveBar dirty={form.dirty} onSave={form.submit} onReset={form.reset} saving={form.saving} error={form.error} />
    </div>
  );
}
