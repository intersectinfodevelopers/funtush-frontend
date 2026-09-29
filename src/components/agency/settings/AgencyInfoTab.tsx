"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Field, SaveBar, TextArea, TextInput, ToggleRow } from "@/components/agency/settings/settings-kit";
import { KycVerificationSection } from "@/components/agency/settings/KycVerificationSection";
import FileUploadField from "@/components/ui/FileUploadField";
import { useApiForm } from "@/hooks/useApiForm";
import { settingsKeys, useAgencyProfile } from "@/hooks/useAgencySettings";
import { saveAgencyProfile, type AgencyProfile } from "@/lib/api/agency/settings";

const PHONE_RE = /^[+()\d][\d\s()+.-]{5,24}$/;
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const toList = (s: string) => s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);

export function AgencyInfoTab() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useAgencyProfile();
  const form = useApiForm<AgencyProfile>(data, (c) => {
    if (c.description && (c.description.length > 2000 || /[<>]/.test(c.description))) return Promise.reject({ message: "The description can be up to 2000 characters and can't contain < or >." });
    if (c.address && (c.address.length > 300 || /[<>]/.test(c.address))) return Promise.reject({ message: "The address can be up to 300 characters and can't contain < or >." });
    if (c.phone) { if (c.phone.length > 5) return Promise.reject({ message: "Add at most 5 phone numbers." }); const bad = c.phone.find((p) => !PHONE_RE.test(p)); if (bad) return Promise.reject({ message: `“${bad}” isn't a valid phone number.` }); }
    if (c.email) { if (c.email.length > 5) return Promise.reject({ message: "Add at most 5 email addresses." }); const bad = c.email.find((e) => !EMAIL_RE.test(e)); if (bad) return Promise.reject({ message: `“${bad}” isn't a valid email address.` }); }
    if (c.regions && c.regions.length > 20) return Promise.reject({ message: "Add at most 20 regions." });
    return saveAgencyProfile(c);
  }, () => void qc.invalidateQueries({ queryKey: [...settingsKeys.all, "profile"] }));

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (isError || !form.value) return <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load your agency details.</p>;
  const v = form.value;

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div><h2 className="text-lg font-bold text-neutral-900">Agency info</h2><p className="text-sm text-neutral-500">What trekkers see about you. Switch off anything you don&apos;t want on your website.</p></div>
        <FileUploadField label="Logo" value={v.logo} onChange={(u) => form.patch({ logo: u })} />
        <ToggleRow label="Show the logo on my website" checked={v.logoShowOnWebsite} onChange={(x) => form.patch({ logoShowOnWebsite: x })} />
        <Field label="About your agency" htmlFor="ai-desc" hint={`${(v.description ?? "").length}/2000 characters`}><TextArea id="ai-desc" rows={4} value={v.description ?? ""} maxLength={2000} onChange={(e) => form.patch({ description: e.target.value === "" ? null : e.target.value })} /></Field>
        <ToggleRow label="Show the description on my website" checked={v.descriptionShowOnWebsite} onChange={(x) => form.patch({ descriptionShowOnWebsite: x })} />
        <Field label="Address" htmlFor="ai-addr"><TextInput id="ai-addr" value={v.address ?? ""} maxLength={300} onChange={(e) => form.patch({ address: e.target.value === "" ? null : e.target.value })} /></Field>
        <ToggleRow label="Show the address on my website" checked={v.addressShowOnWebsite} onChange={(x) => form.patch({ addressShowOnWebsite: x })} />
        <Field label="Phone numbers" htmlFor="ai-phone" hint="Separate with commas — up to 5."><TextInput id="ai-phone" defaultValue={v.phone.join(", ")} key={`p${data?.phone.join()}`} onChange={(e) => form.patch({ phone: toList(e.target.value) })} /></Field>
        <ToggleRow label="Show phone numbers on my website" checked={v.phoneShowOnWebsite} onChange={(x) => form.patch({ phoneShowOnWebsite: x })} />
        <Field label="Email addresses" htmlFor="ai-email" hint="Separate with commas — up to 5."><TextInput id="ai-email" defaultValue={v.email.join(", ")} key={`e${data?.email.join()}`} onChange={(e) => form.patch({ email: toList(e.target.value) })} /></Field>
        <ToggleRow label="Show emails on my website" checked={v.emailShowOnWebsite} onChange={(x) => form.patch({ emailShowOnWebsite: x })} />
        <Field label="Regions you operate in" htmlFor="ai-regions" hint="Separate with commas — e.g. Everest, Annapurna, Langtang."><TextInput id="ai-regions" defaultValue={v.regions.join(", ")} key={`r${data?.regions.join()}`} onChange={(e) => form.patch({ regions: toList(e.target.value) })} /></Field>
        <ToggleRow label="Show regions on my website" checked={v.regionsShowOnWebsite} onChange={(x) => form.patch({ regionsShowOnWebsite: x })} />
      </section>
      <KycVerificationSection />
      <SaveBar dirty={form.dirty} onSave={form.submit} onReset={form.reset} saving={form.saving} error={form.error} />
    </div>
  );
}
