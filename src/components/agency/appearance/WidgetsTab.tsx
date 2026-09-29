"use client";

import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Field, TextArea, TextInput, ToggleRow, useSettingsToast } from "@/components/agency/settings/settings-kit";
import { siteKeys, useBrandingOptions, useWidgets } from "@/hooks/useAgencySite";
import { saveAnalytics, saveLiveChat, savePixel, saveWhatsapp, setCurrencyConverter, setWeather } from "@/lib/api/agency/site";
import type { ApiError } from "@/lib/api/client";

const TIER_RANK: Record<string, number> = { FREE: 0, SMALL: 1, MEDIUM: 2, LARGE: 3 };

function Card({ title, description, locked, children }: { title: string; description: string; locked?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm" aria-label={title}>
      <div><h3 className="text-base font-bold text-neutral-900">{title}</h3><p className="text-sm text-neutral-500">{description}</p></div>
      {locked && <p className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-2.5 text-sm text-warning-800">{locked}</p>}
      <div className={locked ? "pointer-events-none opacity-50" : ""} aria-disabled={Boolean(locked)}>{children}</div>
    </section>
  );
}

function SaveButton({ pending, onClick, label = "Save" }: { pending: boolean; onClick: () => void; label?: string }) {
  return <button type="button" onClick={onClick} disabled={pending} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{pending ? "Saving…" : label}</button>;
}

/** Runs a save, refreshes the widget list, and reports success/failure next to the button. */
function useWidgetSave(run: () => Promise<unknown>, validate?: () => string | null) {
  const qc = useQueryClient();
  const toast = useSettingsToast();
  const [error, setError] = useState<string | null>(null);
  const m = useMutation({ mutationFn: run, onSuccess: () => { setError(null); toast(); void qc.invalidateQueries({ queryKey: [...siteKeys.all, "widgets"] }); }, onError: (e) => setError((e as unknown as ApiError).message || "Couldn't save.") });
  return { pending: m.isPending, error, save: () => { const p = validate?.() ?? null; if (p) return setError(p); setError(null); m.mutate(); } };
}
const Err = ({ msg }: { msg: string | null }) => (msg ? <p role="alert" className="mt-2 text-sm text-danger-600">{msg}</p> : null);

function WhatsappCard({ enabled, number, locked }: { enabled: boolean; number: string; locked?: string }) {
  const [on, setOn] = useState(enabled);
  const [num, setNum] = useState(number);
  const s = useWidgetSave(() => saveWhatsapp({ whatsappEnabled: on, whatsappNumber: num.trim() || null }), () => (on && !num.trim() ? "Add a WhatsApp number to turn this on." : num.trim() && !/^\+?\d{7,15}$/.test(num.trim()) ? "Use 7–15 digits, optionally starting with +." : null));
  return (
    <Card title="WhatsApp chat button" description="A floating button that opens a WhatsApp conversation." locked={locked}>
      <div className="space-y-3"><ToggleRow label="WhatsApp button" checked={on} onChange={setOn} /><Field label="WhatsApp number" htmlFor="w-wa" hint="With country code, e.g. +9779800000000."><TextInput id="w-wa" value={num} onChange={(e) => setNum(e.target.value)} /></Field><SaveButton pending={s.pending} onClick={s.save} /><Err msg={s.error} /></div>
    </Card>
  );
}

function LiveChatCard({ enabled, code, locked }: { enabled: boolean; code: string; locked?: string }) {
  const [on, setOn] = useState(enabled);
  const [c, setC] = useState(code);
  const s = useWidgetSave(() => saveLiveChat({ liveChatEnabled: on, liveChatCode: c.trim() || null }), () => (on && !c.trim() ? "Paste your live-chat embed code to turn this on." : c.length > 5000 ? "That code is too long (max 5000 characters)." : null));
  return (
    <Card title="Live chat" description="Paste the embed snippet from your chat provider (Tawk.to, Crisp…). It runs on every page of your site — only paste code from a provider you trust." locked={locked}>
      <div className="space-y-3"><ToggleRow label="Live chat" checked={on} onChange={setOn} /><Field label="Embed code" htmlFor="w-chat"><TextArea id="w-chat" rows={4} value={c} onChange={(e) => setC(e.target.value)} className="font-mono text-xs" /></Field><SaveButton pending={s.pending} onClick={s.save} /><Err msg={s.error} /></div>
    </Card>
  );
}

function IdCard({ title, description, id, label, placeholder, check, run, locked }: { title: string; description: string; id: string; label: string; placeholder: string; check: RegExp; run: (v: string | null) => Promise<unknown>; locked?: string }) {
  const [v, setV] = useState(label);
  const s = useWidgetSave(() => run(v.trim() || null), () => (v.trim() && !check.test(v.trim()) ? `That doesn't look like a valid ID (e.g. ${placeholder}).` : null));
  return (
    <Card title={title} description={description} locked={locked}>
      <div className="space-y-3"><Field label="ID" htmlFor={id} hint="Leave empty to turn tracking off."><TextInput id={id} value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} /></Field><SaveButton pending={s.pending} onClick={s.save} /><Err msg={s.error} /></div>
    </Card>
  );
}

function SwitchCard({ title, description, enabled, run, locked }: { title: string; description: string; enabled: boolean; run: (on: boolean) => Promise<unknown>; locked?: string }) {
  const [on, setOn] = useState(enabled);
  const s = useWidgetSave(() => run(on));
  return (
    <Card title={title} description={description} locked={locked}>
      <div className="space-y-3"><ToggleRow label={title} checked={on} onChange={setOn} /><SaveButton pending={s.pending} onClick={s.save} /><Err msg={s.error} /></div>
    </Card>
  );
}

export function WidgetsTab() {
  const widgets = useWidgets();
  const opts = useBrandingOptions();
  if (widgets.isLoading || opts.isLoading) return <div className="h-64 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (widgets.isError || !widgets.data || !opts.data) return <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load your widgets.</p>;
  const w = widgets.data;
  const rank = TIER_RANK[opts.data.tier] ?? 0;
  const need = (min: "MEDIUM" | "LARGE") => (rank >= TIER_RANK[min] ? undefined : `Available on the ${min === "MEDIUM" ? "Medium and Large" : "Large"} plan${min === "MEDIUM" ? "s" : ""}.`);

  return (
    <div className="space-y-5">
      <div><h2 className="text-base font-bold text-neutral-900">Widgets</h2><p className="text-sm text-neutral-500">Optional tools shown across your site.</p></div>
      <WhatsappCard enabled={Boolean(w.whatsapp.enabled)} number={w.whatsapp.number ?? ""} />
      <IdCard title="Google Analytics" description="Track visits with your GA4 measurement ID." id="w-ga" label={w.googleAnalytics.id ?? ""} placeholder="G-XXXXXXXXXX" check={/^(G|GT|AW|UA)-[A-Z0-9-]{4,20}$/i} run={saveAnalytics} locked={need("MEDIUM")} />
      <IdCard title="Facebook Pixel" description="Measure ad conversions with your Pixel ID." id="w-fb" label={w.facebookPixel.id ?? ""} placeholder="1234567890" check={/^\d{5,20}$/} run={savePixel} locked={need("MEDIUM")} />
      <SwitchCard title="Weather widget" description="Show trail-head weather on package pages." enabled={Boolean(w.weather.enabled)} run={setWeather} locked={need("MEDIUM")} />
      <SwitchCard title="Currency converter" description="Let visitors see prices in their own currency." enabled={Boolean(w.currencyConverter.enabled)} run={setCurrencyConverter} locked={need("MEDIUM")} />
      <LiveChatCard enabled={Boolean(w.liveChat.enabled)} code={w.liveChat.code ?? ""} locked={need("LARGE")} />
    </div>
  );
}
