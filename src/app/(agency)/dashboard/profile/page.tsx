"use client";

import Link from "next/link";
import { Building2, KeyRound, Mail, Pencil, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardSummary } from "@/hooks/useAgencyDashboard";
import { useBrandingOptions } from "@/hooks/useAgencySite";

const ROLE_LABEL: Record<string, string> = { agency_admin: "Agency admin", moderator: "Team member", trekker: "Trekker" };

function Stat({ value, label }: { value: number | string; label: string }) {
  return <div className="p-3 text-center"><p className="text-lg font-semibold text-neutral-900">{value}</p><p className="text-[11px] text-neutral-500">{label}</p></div>;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const summary = useDashboardSummary();
  const options = useBrandingOptions();
  const stats = summary.data?.stats;
  const agency = user?.agency_name ?? "Your agency";
  const initials = agency.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "A";

  return (
    <div className="space-y-4">
      <div><div className="flex items-center gap-2 text-sm text-neutral-500"><Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span>/</span><span className="font-semibold text-neutral-900">Profile</span></div><h1 className="mt-2 text-2xl font-bold text-neutral-900">Profile</h1></div>

      <div className="grid gap-4 lg:grid-cols-[325px_1fr]">
        <aside className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="h-24 bg-primary-900" />
          <Link
            href="/dashboard/settings?tab=agency-info"
            aria-label="Edit profile"
            title="Edit profile"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <div className="px-5 pb-5">
            <div className="-mt-8 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-primary-600 text-xl font-semibold text-white shadow-sm">{initials}</div>
            <h2 className="mt-3 text-lg font-semibold text-neutral-900">{agency}</h2>
            <p className="text-sm text-neutral-500">{user ? ROLE_LABEL[user.role] ?? user.role : "—"}</p>
            <div className="mt-4 grid grid-cols-3 divide-x rounded-xl border border-neutral-200" aria-label="Agency totals">
              <Stat value={stats?.totalBookings ?? "—"} label="Bookings" />
              <Stat value={stats?.guides ?? "—"} label="Guides" />
              <Stat value={stats?.packages ?? "—"} label="Packages" />
            </div>
          </div>
        </aside>

        <main className="space-y-4">
          <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm" aria-label="Account">
            <h2 className="font-semibold text-neutral-900">Your account</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3"><span className="rounded-lg bg-primary-50 p-2 text-primary-700"><Mail className="h-4 w-4" /></span><div><dt className="text-xs font-semibold text-neutral-500">Login email</dt><dd className="text-sm text-neutral-900">{user?.email ?? "—"}</dd></div></div>
              <div className="flex items-start gap-3"><span className="rounded-lg bg-success-50 p-2 text-success-700"><UserRound className="h-4 w-4" /></span><div><dt className="text-xs font-semibold text-neutral-500">Role</dt><dd className="text-sm text-neutral-900">{user ? ROLE_LABEL[user.role] ?? user.role : "—"}</dd></div></div>
              <div className="flex items-start gap-3"><span className="rounded-lg bg-warning-50 p-2 text-warning-700"><Building2 className="h-4 w-4" /></span><div><dt className="text-xs font-semibold text-neutral-500">Agency</dt><dd className="text-sm text-neutral-900">{agency}</dd></div></div>
              <div className="flex items-start gap-3"><span className="rounded-lg bg-neutral-100 p-2 text-neutral-700"><Sparkles className="h-4 w-4" /></span><div><dt className="text-xs font-semibold text-neutral-500">Plan</dt><dd className="flex items-center gap-2 text-sm text-neutral-900"><span className="capitalize">{options.data ? options.data.tier.toLowerCase() : "—"}</span><Link href="/dashboard/settings?tab=subscription" className="text-xs font-semibold text-primary-700 hover:underline">Change plan</Link></dd></div></div>
            </dl>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm" aria-label="Manage">
            <h2 className="mb-3 font-semibold text-neutral-900">Manage</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link href="/dashboard/settings?tab=agency-info" className="flex items-center gap-2 rounded-xl border border-neutral-200 p-3 text-sm font-semibold hover:bg-neutral-50"><Building2 className="h-4 w-4 text-primary-700" /> Agency details &amp; verification</Link>
              <Link href="/dashboard/settings?tab=security" className="flex items-center gap-2 rounded-xl border border-neutral-200 p-3 text-sm font-semibold hover:bg-neutral-50"><ShieldCheck className="h-4 w-4 text-primary-700" /> Change password</Link>
              <Link href="/dashboard/settings?tab=api-keys" className="flex items-center gap-2 rounded-xl border border-neutral-200 p-3 text-sm font-semibold hover:bg-neutral-50"><KeyRound className="h-4 w-4 text-primary-700" /> API keys</Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
