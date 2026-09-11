"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
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
  ChevronDown,
} from "lucide-react";
import { SettingsToastProvider } from "@/components/agency/settings/settings-kit";

type NavItem = { label: string; href: string; icon: typeof Building2 };
type NavGroup = { title: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    title: "Website",
    items: [
      { label: "Agency info", href: "/dashboard/settings/agency-info", icon: Building2 },
      { label: "Domain", href: "/dashboard/settings/domain", icon: Globe2 },
      { label: "Navigation", href: "/dashboard/settings/navigation", icon: LayoutGrid },
      { label: "SEO", href: "/dashboard/settings/seo", icon: SearchCode },
      { label: "Social links", href: "/dashboard/settings/social", icon: Share2 },
    ],
  },
  {
    title: "Billing",
    items: [
      { label: "Subscription", href: "/dashboard/settings/subscription", icon: Sparkles },
      { label: "Payments", href: "/dashboard/settings/payments", icon: Wallet },
    ],
  },
  {
    title: "Integrations",
    items: [
      { label: "Widgets", href: "/dashboard/settings/widgets", icon: Puzzle },
      { label: "API keys", href: "/dashboard/settings/api-keys", icon: KeyRound },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
      { label: "Email", href: "/dashboard/settings/email", icon: Mail },
      { label: "Security", href: "/dashboard/settings/security", icon: ShieldCheck },
    ],
  },
];

function Rail({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-6">
      <Link
        href="/dashboard/settings"
        onClick={onNavigate}
        className={`block rounded-xl px-3 py-2 text-sm font-semibold transition ${
          pathname === "/dashboard/settings"
            ? "bg-primary-50 text-primary-900"
            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
        }`}
      >
        Overview
      </Link>

      {GROUPS.map((group) => (
        <div key={group.title}>
          <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">
            {group.title}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
                    active
                      ? "bg-primary-50 font-semibold text-primary-900"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 shrink-0 ${active ? "text-primary-700" : "text-neutral-400"}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const current =
    GROUPS.flatMap((g) => g.items).find(
      (i) => pathname === i.href || pathname.startsWith(`${i.href}/`),
    )?.label ?? "Overview";

  return (
    <SettingsToastProvider>
      <div className="mx-auto w-full max-w-6xl">
        <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
          {/* Desktop rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-2 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
              <Rail pathname={pathname} />
            </div>
          </aside>

          {/* Mobile rail — collapsible */}
          <div className="mb-4 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-sm"
            >
              <span>
                Settings <span className="text-neutral-400">/</span>{" "}
                <span className="text-primary-900">{current}</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 text-neutral-400 transition ${mobileOpen ? "rotate-180" : ""}`}
              />
            </button>
            {mobileOpen && (
              <div className="mt-2 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
                <Rail pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-6 pb-10">{children}</div>
        </div>
      </div>
    </SettingsToastProvider>
  );
}
