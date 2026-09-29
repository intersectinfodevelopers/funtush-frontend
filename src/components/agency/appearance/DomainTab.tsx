"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Copy, ExternalLink, Globe2 } from "lucide-react";
import { Field, TextInput, useSettingsToast } from "@/components/agency/settings/settings-kit";
import { siteKeys, useDomain } from "@/hooks/useAgencySite";
import { useMyTier } from "@/hooks/useAgencySettings";
import { connectDomain, disconnectDomain, publishSite, unpublishSite, verifyDomain, type DnsRecord } from "@/lib/api/agency/site";
import type { ApiError } from "@/lib/api/client";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || "funtush.io";
const DOMAIN_RE = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

function Record({ r }: { r: DnsRecord }) {
  return (
    <tr className="border-t border-neutral-200">
      <td className="px-3 py-2 font-mono text-xs font-semibold">{r.type}</td>
      <td className="px-3 py-2 font-mono text-xs">{r.name}</td>
      <td className="px-3 py-2 font-mono text-xs break-all">{r.value}</td>
      <td className="px-3 py-2"><button type="button" aria-label={`Copy ${r.type} value`} onClick={() => void navigator.clipboard?.writeText(r.value)} className="rounded-md p-1.5 hover:bg-neutral-100"><Copy className="h-4 w-4" /></button></td>
    </tr>
  );
}

export function DomainTab() {
  const qc = useQueryClient();
  const toast = useSettingsToast();
  const domain = useDomain();
  const { tier: myTier, isLoading: tierLoading } = useMyTier();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifyNote, setVerifyNote] = useState<string | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: [...siteKeys.all, "domain"] });
  const fail = (e: unknown) => setError((e as ApiError).message || "That didn't work — please try again.");
  const ok = (msg: string) => () => { setError(null); toast(msg); void refresh(); };

  const publish = useMutation({ mutationFn: publishSite, onSuccess: ok("Site published"), onError: fail });
  const unpublish = useMutation({ mutationFn: unpublishSite, onSuccess: ok("Site unpublished"), onError: fail });
  const connect = useMutation({ mutationFn: () => connectDomain(input.trim().toLowerCase()), onSuccess: () => { setInput(""); ok("Domain connected — add the DNS records below")(); }, onError: fail });
  const disconnect = useMutation({ mutationFn: disconnectDomain, onSuccess: () => { setVerifyNote(null); ok("Domain disconnected")(); }, onError: fail });
  const verify = useMutation({ mutationFn: verifyDomain, onSuccess: (r) => { setError(null); setVerifyNote(r.message); void refresh(); }, onError: fail });

  if (domain.isLoading || tierLoading) return <div className="h-64 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (domain.isError || !domain.data) return <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load your domain settings.</p>;
  const d = domain.data;
  const paid = myTier?.customDomainEnabled ?? false;
  // Locally there's no wildcard DNS, so "Visit" opens the same site through the ?site= fallback.
  const local = typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  const url = local ? `/site?site=${encodeURIComponent(d.subdomain)}` : `https://${d.subdomain}.${SITE_DOMAIN}`;

  function submitDomain(e: React.FormEvent) {
    e.preventDefault();
    const v = input.trim().toLowerCase();
    if (!DOMAIN_RE.test(v)) return setError("Enter a domain like trekkingagency.com — no https:// or trailing slash.");
    setError(null);
    connect.mutate();
  }

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm" aria-label="Publish">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="text-lg font-bold text-neutral-900">Publish your site</h3><p className="text-sm text-neutral-500">Your site is {d.published ? "live for visitors" : "not visible to visitors yet"}.</p></div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${d.published ? "bg-success-50 text-success-700" : "bg-neutral-200 text-neutral-600"}`}>{d.published ? "Published" : "Draft"}</span>
        </div>
        <p className="flex items-center gap-2 text-sm text-neutral-700"><Globe2 className="h-4 w-4 text-neutral-400" /> {d.subdomain}.{SITE_DOMAIN} {d.published && <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary-700 hover:underline">Visit <ExternalLink className="h-3.5 w-3.5" /></a>}</p>
        {d.published
          ? <button type="button" disabled={unpublish.isPending} onClick={() => unpublish.mutate()} className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50 disabled:opacity-50">{unpublish.isPending ? "Working…" : "Unpublish"}</button>
          : <button type="button" disabled={publish.isPending} onClick={() => publish.mutate()} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{publish.isPending ? "Publishing…" : "Publish site"}</button>}
      </section>

      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm" aria-label="Custom domain">
        <div><h3 className="text-lg font-bold text-neutral-900">Custom domain</h3><p className="text-sm text-neutral-500">Use your own address instead of {d.subdomain}.{SITE_DOMAIN}. The free address keeps working.</p></div>
        {!paid && <p className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-2.5 text-sm text-warning-800">Custom domains are available on paid plans.</p>}

        {!d.customDomain ? (
          <form onSubmit={submitDomain} noValidate className={`flex flex-wrap items-end gap-3 ${paid ? "" : "pointer-events-none opacity-50"}`}>
            <div className="min-w-[16rem] flex-1"><Field label="Domain" htmlFor="dom-input"><TextInput id="dom-input" value={input} disabled={!paid} onChange={(e) => setInput(e.target.value)} placeholder="trekkingagency.com" /></Field></div>
            <button type="submit" disabled={!paid || connect.isPending} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{connect.isPending ? "Connecting…" : "Connect domain"}</button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3"><span className="font-mono text-sm font-semibold">{d.customDomain}</span>
              {d.status === "VERIFIED" ? <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-bold text-success-700"><CheckCircle2 className="h-3.5 w-3.5" /> Verified</span> : <span className="rounded-full bg-warning-50 px-2.5 py-1 text-xs font-bold text-warning-700">Waiting for DNS</span>}</div>
            {d.dnsInstructions && (
              <div className="overflow-x-auto rounded-xl border border-neutral-200">
                <table className="min-w-full text-left text-sm"><thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.2em] text-neutral-500"><tr><th className="px-3 py-2">Type</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Value</th><th className="px-3 py-2" /></tr></thead><tbody><Record r={d.dnsInstructions.cname} /><Record r={d.dnsInstructions.txt} /></tbody></table>
              </div>
            )}
            {verifyNote && <p className="text-sm text-neutral-600" role="status">{verifyNote}</p>}
            <div className="flex gap-3">
              <button type="button" disabled={verify.isPending} onClick={() => verify.mutate()} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{verify.isPending ? "Checking…" : "Check DNS now"}</button>
              <button type="button" disabled={disconnect.isPending} onClick={() => { if (window.confirm(`Disconnect ${d.customDomain}?`)) disconnect.mutate(); }} className="rounded-xl border border-danger-200 px-4 py-2 text-sm font-semibold text-danger-600 hover:bg-danger-50 disabled:opacity-50">Disconnect</button>
            </div>
          </div>
        )}
        {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
      </section>
    </div>
  );
}
