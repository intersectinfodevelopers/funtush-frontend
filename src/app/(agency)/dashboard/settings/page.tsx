"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Palette,
  Globe2,
  LayoutGrid,
  SearchCode,
  Share2,
  Sparkles,
  Wallet,
  Puzzle,
  KeyRound,
  Bell,
  Mail,
  ShieldCheck,
  Users,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { SettingsHeader } from "@/components/agency/settings/settings-kit";

type Tone = "primary" | "success" | "warning" | "accent";
type Item = { label: string; description: string; href: string; icon: typeof Palette; tone: Tone };

const GROUPS: { title: string; description: string; items: Item[] }[] = [
  {
    title: "Website",
    description: "How your agency looks to trekkers on your white-label site.",
    items: [
      { label: "Agency info", description: "Name, contact details, address, operating regions.", href: "/dashboard/settings/agency-info", icon: Building2, tone: "primary" },
      { label: "Branding", description: "Logo, colours, fonts and favicon.", href: "/dashboard/settings/branding", icon: Palette, tone: "accent" },
      { label: "Domain", description: "Connect and verify a custom domain.", href: "/dashboard/settings/domain", icon: Globe2, tone: "success" },
      { label: "Navigation", description: "Menus and the Book Now button.", href: "/dashboard/settings/navigation", icon: LayoutGrid, tone: "warning" },
      { label: "SEO", description: "Page titles, meta description, OG image.", href: "/dashboard/settings/seo", icon: SearchCode, tone: "primary" },
      { label: "Social links", description: "Instagram, Facebook, TikTok and more.", href: "/dashboard/settings/social", icon: Share2, tone: "accent" },
      { label: "Site status", description: "Coming-soon mode and the Funtush badge.", href: "/dashboard/settings/site", icon: Globe2, tone: "warning" },
    ],
  },
  {
    title: "Billing",
    description: "Your plan and how you collect payments.",
    items: [
      { label: "Subscription", description: "Current plan, limits and upgrades.", href: "/dashboard/settings/subscription", icon: Sparkles, tone: "warning" },
      { label: "Payments", description: "Gateways and payout preferences.", href: "/dashboard/settings/payments", icon: Wallet, tone: "success" },
    ],
  },
  {
    title: "Integrations",
    description: "Third-party tools and API access.",
    items: [
      { label: "Widgets", description: "Weather, currency, WhatsApp and chat.", href: "/dashboard/settings/widgets", icon: Puzzle, tone: "accent" },
      { label: "API keys", description: "Keys for programmatic access.", href: "/dashboard/settings/api-keys", icon: KeyRound, tone: "primary" },
    ],
  },
  {
    title: "Account",
    description: "Alerts, sender identity and security.",
    items: [
      { label: "Notifications", description: "Which events email or notify you.", href: "/dashboard/settings/notifications", icon: Bell, tone: "warning" },
      { label: "Email", description: "Sender name, from address and footer.", href: "/dashboard/settings/email", icon: Mail, tone: "success" },
      { label: "Security", description: "Password, sessions and 2-factor.", href: "/dashboard/settings/security", icon: ShieldCheck, tone: "primary" },
    ],
  },
];

const RELATED = [
  { label: "Staff & permissions", href: "/dashboard/staff", icon: Users },
  { label: "Roles", href: "/dashboard/roles", icon: ShieldCheck },
  { label: "Invoices & finance", href: "/dashboard/finance", icon: Wallet },
];

const TONE: Record<Tone, string> = {
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  accent: "bg-accent-50 text-accent-700",
};

// "Setup" checklist — reads the same localStorage keys the sub-pages write.
const CHECKLIST: { label: string; key: string; href: string }[] = [
  { label: "Add your agency info", key: "agencyInfoSettings", href: "/dashboard/settings/agency-info" },
  { label: "Set your branding", key: "brandingSettings", href: "/dashboard/settings/branding" },
  { label: "Connect a domain", key: "domainSettings", href: "/dashboard/settings/domain" },
  { label: "Fill in SEO basics", key: "seoSettings", href: "/dashboard/settings/seo" },
];

function readChecklist(): Record<string, boolean> {
  const next: Record<string, boolean> = {};
  for (const c of CHECKLIST) {
    try {
      next[c.key] = typeof window !== "undefined" && !!localStorage.getItem(c.key);
    } catch {
      next[c.key] = false;
    }
  }
  return next;
}

export default function SettingsOverviewPage() {
  const [done] = useState<Record<string, boolean>>(readChecklist);

  const completed = CHECKLIST.filter((c) => done[c.key]).length;
  const pct = useMemo(() => Math.round((completed / CHECKLIST.length) * 100), [completed]);

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Overview"
        description="Configure your agency workspace, white-label website, billing and account."
      />

      {/* Setup progress + related links */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-primary-200 bg-primary-900 p-5 text-white shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-200">
                Workspace setup
              </p>
              <h2 className="mt-2 text-lg font-bold">Make it feel like yours</h2>
              <p className="mt-1 text-sm text-primary-100">
                {completed} of {CHECKLIST.length} steps done
              </p>
            </div>
            <span className="rounded-xl bg-white/10 px-2.5 py-1 text-sm font-bold">{pct}%</span>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          <ul className="mt-4 space-y-1.5">
            {CHECKLIST.map((c) => (
              <li key={c.key}>
                <Link
                  href={c.href}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-primary-50 transition hover:bg-white/10"
                >
                  {done[c.key] ? (
                    <CheckCircle2 className="h-4 w-4 text-success-300" />
                  ) : (
                    <Circle className="h-4 w-4 text-primary-300" />
                  )}
                  <span className={done[c.key] ? "line-through opacity-70" : ""}>{c.label}</span>
                  <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-50" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-sm font-bold text-neutral-900">Related</h2>
          <p className="mt-1 text-xs text-neutral-500">Managed from their own sections.</p>
          <div className="mt-4 space-y-2">
            {RELATED.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="flex items-center gap-3 rounded-xl bg-neutral-50 px-3 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-primary-50 hover:text-primary-900"
              >
                <r.icon className="h-4 w-4 text-neutral-400" />
                <span>{r.label}</span>
                <ExternalLink className="ml-auto h-3.5 w-3.5 text-neutral-300" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Grouped cards */}
      {GROUPS.map((group) => (
        <section key={group.title}>
          <div className="mb-3">
            <h2 className="text-base font-bold text-neutral-900">{group.title}</h2>
            <p className="mt-0.5 text-sm text-neutral-500">{group.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
              >
                <span className={`rounded-xl p-2.5 ${TONE[item.tone]}`}>
                  <item.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-neutral-900">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-neutral-500">
                    {item.description}
                  </span>
                </span>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-neutral-300 transition group-hover:text-primary-700" />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
