"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useSettingsToast } from "@/components/agency/settings/settings-kit";
import { settingsKeys, usePaymentMethods } from "@/hooks/useAgencySettings";
import { GATEWAYS, savePaymentMethod, togglePaymentMethod, type PaymentMethodRow } from "@/lib/api/agency/settings";
import type { ApiError } from "@/lib/api/client";

const input = "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50";

function GatewayCard({ gw, row }: { gw: (typeof GATEWAYS)[number]; row: PaymentMethodRow | undefined }) {
  const qc = useQueryClient();
  const toast = useSettingsToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: [...settingsKeys.all, "payment-methods"] });
  const fail = (e: unknown) => setError((e as ApiError).message || "That didn't work — please try again.");
  const save = useMutation({ mutationFn: () => savePaymentMethod(gw.id, Object.fromEntries(gw.fields.map(([k]) => [k, (values[k] ?? "").trim()]))), onSuccess: () => { setValues({}); setError(null); toast(`${gw.name} saved`); void refresh(); }, onError: fail });
  const toggle = useMutation({ mutationFn: () => togglePaymentMethod(row!.id), onSuccess: () => { setError(null); void refresh(); }, onError: fail });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing = gw.fields.find(([k]) => !(values[k] ?? "").trim());
    if (missing) return setError(`Enter the ${missing[1].toLowerCase()}.`);
    setError(null);
    save.mutate();
  }

  return (
    <section aria-label={gw.name} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div><h3 className="text-base font-bold text-neutral-900">{gw.name}</h3><p className="text-xs text-neutral-500">{row ? (row.isActive ? "Connected and accepting payments" : "Connected, currently switched off") : "Not connected"}</p></div>
        {row && <button type="button" role="switch" aria-checked={row.isActive} aria-label={`${gw.name} enabled`} disabled={toggle.isPending} onClick={() => toggle.mutate()} className={`relative inline-flex h-7 w-12 items-center rounded-full p-1 transition ${row.isActive ? "bg-primary-600" : "bg-neutral-300"}`}><span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${row.isActive ? "translate-x-5" : ""}`} /></button>}
      </div>
      <form onSubmit={submit} noValidate className="space-y-3">
        <p className="flex items-center gap-1.5 text-xs text-neutral-500"><Lock className="h-3.5 w-3.5" /> Credentials are stored encrypted and never shown again. {row ? "Enter new values to replace them." : ""}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {gw.fields.map(([k, label]) => (
            <label key={k} className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">{label}</span>
              <div className="relative"><input aria-label={`${gw.name} ${label}`} type={reveal ? "text" : "password"} autoComplete="off" className={input} value={values[k] ?? ""} maxLength={500} placeholder={row ? "••••••••" : ""} onChange={(e) => setValues((c) => ({ ...c, [k]: e.target.value }))} /></div></label>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={save.isPending} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{save.isPending ? "Saving…" : row ? "Replace credentials" : "Connect"}</button>
          <button type="button" onClick={() => setReveal((r) => !r)} className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900">{reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {reveal ? "Hide" : "Show"} what I type</button>
        </div>
        {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
      </form>
    </section>
  );
}

export function PaymentsTab() {
  const { data, isLoading, isError } = usePaymentMethods();
  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (isError) return <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load your payment methods.</p>;
  return (
    <div className="space-y-5">
      <div><h2 className="text-lg font-bold text-neutral-900">Payment methods</h2><p className="text-sm text-neutral-500">Connect the gateways you use to collect booking payments.</p></div>
      {GATEWAYS.map((gw) => <GatewayCard key={gw.id} gw={gw} row={data?.find((m) => m.provider === gw.id)} />)}
    </div>
  );
}
