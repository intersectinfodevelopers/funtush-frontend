"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, KeyRound } from "lucide-react";
import { Field, TextInput } from "@/components/agency/settings/settings-kit";
import { settingsKeys, useApiKeys, useMyTier } from "@/hooks/useAgencySettings";
import { createApiKey, revokeApiKey, type ApiKeyScope, type CreatedApiKey } from "@/lib/api/agency/settings";
import type { ApiError } from "@/lib/api/client";

const selectClass = "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50";
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Never");

export function ApiKeysTab() {
  const qc = useQueryClient();
  const keys = useApiKeys();
  const { tier: myTier, isLoading: tierLoading } = useMyTier();
  const notAllowed = !tierLoading && !myTier?.apiAccessEnabled;
  const [name, setName] = useState("");
  const [scope, setScope] = useState<ApiKeyScope>("READ_ONLY");
  const [error, setError] = useState<string | null>(null);
  const [fresh, setFresh] = useState<CreatedApiKey | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: [...settingsKeys.all, "api-keys"] });
  const create = useMutation({ mutationFn: () => createApiKey({ name: name.trim(), scope }), onSuccess: (k) => { setFresh(k); setName(""); setError(null); void refresh(); }, onError: (e) => setError((e as unknown as ApiError).message || "Couldn't create the key.") });
  const revoke = useMutation({ mutationFn: (id: string) => revokeApiKey(id), onSuccess: () => { setError(null); void refresh(); }, onError: (e) => setError((e as unknown as ApiError).message || "Couldn't revoke the key.") });

  if (keys.isLoading) return <div className="h-48 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  const forbidden = keys.isError;

  return (
    <div className="space-y-5">
      <div><h2 className="text-lg font-bold text-neutral-900">API keys</h2><p className="text-sm text-neutral-500">Scoped, revocable keys for connecting your own tools. Available to agency admins on plans with API access.</p></div>
      {notAllowed && !forbidden && <p className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800">API keys aren&apos;t included in your current plan.</p>}
      {forbidden && <p role="alert" className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800">API keys aren&apos;t available for your account. They&apos;re a plan feature managed by agency admins.</p>}
      {!forbidden && (
        <>
          {fresh && (
            <div role="status" className="space-y-2 rounded-2xl border border-success-200 bg-success-50 p-4">
              <p className="text-sm font-semibold text-success-800">Copy your new key now — it won&apos;t be shown again.</p>
              <div className="flex items-center gap-2"><code className="flex-1 break-all rounded-lg bg-white px-3 py-2 text-xs">{fresh.key}</code><button type="button" aria-label="Copy key" onClick={() => void navigator.clipboard?.writeText(fresh.key)} className="rounded-md p-2 hover:bg-success-100"><Copy className="h-4 w-4" /></button></div>
              <button type="button" onClick={() => setFresh(null)} className="text-xs font-semibold text-success-800 underline">I&apos;ve saved it</button>
            </div>
          )}
          <form noValidate onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return setError("Give the key a name."); setError(null); create.mutate(); }} className={`grid gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_200px_auto] sm:items-end ${notAllowed ? "pointer-events-none opacity-50" : ""}`}>
            <Field label="Key name" htmlFor="ak-name"><TextInput id="ak-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="Booking sync" /></Field>
            <Field label="Access" htmlFor="ak-scope"><select id="ak-scope" className={selectClass} value={scope} onChange={(e) => setScope(e.target.value as ApiKeyScope)}><option value="READ_ONLY">Read only</option><option value="READ_WRITE">Read & write</option></select></Field>
            <button type="submit" disabled={create.isPending || notAllowed} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{create.isPending ? "Creating…" : "Create key"}</button>
          </form>
          {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
          <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.2em] text-neutral-500"><tr><th className="w-14 px-4 py-3">S.No</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Key</th><th className="px-4 py-3">Access</th><th className="px-4 py-3">Last used</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead>
              <tbody>
                {(keys.data ?? []).length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-500"><KeyRound className="mx-auto mb-2 h-6 w-6 text-neutral-300" />No API keys yet.</td></tr>}
                {(keys.data ?? []).map((k, index) => (
                  <tr key={k.id} className="border-t border-neutral-200"><td className="px-4 py-3 text-neutral-500">{0 + index + 1}</td>
                    <td className="px-4 py-3 font-semibold text-neutral-900">{k.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-600">{k.keyPrefix}…</td>
                    <td className="px-4 py-3 text-neutral-700">{k.scope === "READ_ONLY" ? "Read only" : "Read & write"}</td>
                    <td className="px-4 py-3 text-neutral-700">{fmt(k.lastUsedAt)}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${k.revoked ? "bg-neutral-100 text-neutral-600" : "bg-success-50 text-success-700"}`}>{k.revoked ? "Revoked" : "Active"}</span></td>
                    <td className="px-4 py-3">{!k.revoked && <button type="button" aria-label={`Revoke ${k.name}`} disabled={revoke.isPending} onClick={() => { if (window.confirm(`Revoke “${k.name}”? Anything using it stops working immediately.`)) revoke.mutate(k.id); }} className="rounded-xl border border-danger-200 px-3 py-1.5 text-xs font-semibold text-danger-600 hover:bg-danger-50">Revoke</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
