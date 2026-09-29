"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Crown, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { startEsewa, startKhalti } from "@/lib/api/agency/settings";
import type { ApiError } from "@/lib/api/client";
import { useTiers } from "@/hooks/useAgencySettings";
import { useBrandingOptions } from "@/hooks/useAgencySite";
import type { Tier } from "@/lib/api/agency/settings";

const cap = (n: number, one: string, many: string) => (n <= 0 ? "Unlimited" : `${n} ${n === 1 ? one : many}`);
const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

function Row({ on, label }: { on: boolean; label: string }) {
  return <li className={`flex items-center gap-2 text-sm ${on ? "text-neutral-800" : "text-neutral-400"}`}>{on ? <Check className="h-4 w-4 text-success-600" /> : <X className="h-4 w-4" />} {label}</li>;
}

/** Submits the signed eSewa form in a real browser POST (eSewa v1 takes a form post, not JSON). */
function postForm(action: string, fields: Record<string, string>) {
  const f = document.createElement("form");
  f.method = "POST";
  f.action = action;
  for (const [k, v] of Object.entries(fields)) { const i = document.createElement("input"); i.type = "hidden"; i.name = k; i.value = v; f.appendChild(i); }
  document.body.appendChild(f);
  f.submit();
}

export function SubscriptionTab() {
  const { user } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function pay(tier: Tier, provider: "esewa" | "khalti") {
    setError(null);
    setBusy(`${tier.id}:${provider}`);
    try {
      if (provider === "esewa") { const r = await startEsewa(tier.id); postForm(r.form.action, r.form.fields); }
      else { const r = await startKhalti(tier.id); window.location.assign(r.redirectUrl); }
    } catch (e) { setError((e as ApiError).message || "We couldn't start the payment."); setBusy(null); }
  }
  const tiers = useTiers();
  const options = useBrandingOptions();
  if (tiers.isLoading || options.isLoading) return <div className="h-64 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (tiers.isError || !tiers.data) return <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load the plans.</p>;
  const current = options.data?.tier;
  const sorted = [...tiers.data].sort((a: Tier, b: Tier) => Number(a.monthlyPrice) - Number(b.monthlyPrice));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-bold text-neutral-900">Subscription</h2><p className="text-sm text-neutral-500">You&apos;re on the <strong>{current ? title(current) : "—"}</strong> plan.</p></div>
        <Link href="/dashboard/support" className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Need help with your plan?</Link>
      </div>
      {error && <p role="alert" className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</p>}
      {user?.support && <p className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800">Payments can&apos;t be started during a support session.</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sorted.map((t) => (
          <article key={t.id} aria-label={`${title(t.name)} plan`} className={`space-y-3 rounded-2xl border bg-white p-5 shadow-sm ${t.name === current ? "border-primary-500 ring-2 ring-primary-100" : "border-neutral-200"}`}>
            <div className="flex items-center justify-between"><h3 className="flex items-center gap-1.5 font-bold text-neutral-900"><Crown className="h-4 w-4 text-warning-500" /> {title(t.name)}</h3>{t.name === current && <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-bold text-primary-700">Current</span>}</div>
            <p className="text-2xl font-extrabold text-neutral-900">{Number(t.monthlyPrice) === 0 ? "Free" : `$${Number(t.monthlyPrice)}`}{Number(t.monthlyPrice) > 0 && <span className="text-sm font-medium text-neutral-500"> /month</span>}</p>
            <ul className="space-y-1.5">
              <Row on label={cap(t.maxStaff, "staff member", "staff members")} />
              <Row on label={cap(t.maxGuides, "guide", "guides")} />
              <Row on label={t.maxBookingsPerMonth ? `${t.maxBookingsPerMonth} bookings/month` : "Unlimited bookings"} />
              <Row on={t.blogEnabled} label="Blog" />
              <Row on={t.analyticsEnabled} label="Analytics" />
              <Row on={t.customDomainEnabled} label="Custom domain" />
              <Row on={t.adsEnabled} label="Advertising" />
              <Row on={t.apiAccessEnabled} label="API access" />
              <Row on={t.prioritySupportEnabled} label="Priority support" />
            </ul>
            {t.name !== current && Number(t.monthlyPrice) > 0 && (
              <div className="space-y-2 border-t border-neutral-100 pt-3">
                <p className="text-xs text-neutral-500">Charged in NPR: <strong className="text-neutral-800">NPR {Number(t.monthlyPriceNpr ?? t.monthlyPrice).toLocaleString("en-US")}</strong> per month.</p>
                <div className="flex flex-wrap gap-2">
                  {(["esewa", "khalti"] as const).map((p) => <button key={p} type="button" disabled={Boolean(busy) || Boolean(user?.support)} onClick={() => void pay(t, p)} className="rounded-xl bg-primary-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{busy === `${t.id}:${p}` ? "Redirecting…" : `Pay with ${p === "esewa" ? "eSewa" : "Khalti"}`}</button>)}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
