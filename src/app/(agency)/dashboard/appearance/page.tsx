"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Palette, SearchCode, Menu, Sparkles, LayoutTemplate, Share2, Puzzle, Globe2 } from "lucide-react";
import { SettingsToastProvider } from "@/components/agency/settings/settings-kit";
import { BrandingTab } from "@/components/agency/appearance/BrandingTab";
import { SeoTab } from "@/components/agency/appearance/SeoTab";
import { NavigationTab } from "@/components/agency/appearance/NavigationTab";
import { ComponentsTab } from "@/components/agency/appearance/ComponentsTab";
import { TemplatesTab } from "@/components/agency/appearance/TemplatesTab";
import { SocialTab } from "@/components/agency/appearance/SocialTab";
import { WidgetsTab } from "@/components/agency/appearance/WidgetsTab";
import { DomainTab } from "@/components/agency/appearance/DomainTab";

// Order matches the intended build flow: get every identity/config step done
// first (brand, SEO, nav, socials, widgets) — none of it depends on a
// template — then pick a template and adjust it (Components lives alongside
// Templates since both shape the actual page), and finally publish.
type Tab = "branding" | "seo" | "navigation" | "social" | "widgets" | "templates" | "components" | "domain";

const TABS: { key: Tab; label: string; icon: typeof Palette }[] = [
  { key: "branding", label: "Branding", icon: Palette },
  { key: "seo", label: "SEO", icon: SearchCode },
  { key: "navigation", label: "Navigation", icon: Menu },
  { key: "social", label: "Social", icon: Share2 },
  { key: "widgets", label: "Widgets", icon: Puzzle },
  { key: "templates", label: "Templates", icon: Sparkles },
  { key: "components", label: "Components", icon: LayoutTemplate },
  { key: "domain", label: "Domain & Publish", icon: Globe2 },
];

function isTab(value: string | null): value is Tab {
  return TABS.some((t) => t.key === value);
}

export default function AppearancePage() {
  return (
    <Suspense fallback={null}>
      <AppearancePageInner />
    </Suspense>
  );
}

function AppearancePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Search params are part of the URL Next already resolved server-side, so
  // reading them straight into initial state (unlike localStorage) can't
  // disagree with the server's render.
  const [tab, setTab] = useState<Tab>(() => {
    const fromQuery = searchParams.get("tab");
    return isTab(fromQuery) ? fromQuery : "branding";
  });

  // Keeps the shown tab in sync when something OTHER than the tab bar above
  // changes the URL — e.g. the template editor's back button returning to
  // "?tab=components", or Components' "Continue" button linking straight to
  // "?tab=domain" — completing the branding → ... → templates → components →
  // domain & publish flow without landing back on the first tab each time.
  useEffect(() => {
    const fromQuery = searchParams.get("tab");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isTab(fromQuery) && fromQuery !== tab) setTab(fromQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function selectTab(next: Tab) {
    setTab(next);
    router.replace(`/dashboard/appearance?tab=${next}`, { scroll: false });
  }

  return (
    <SettingsToastProvider>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="border-b border-neutral-200 pb-5">
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Link href="/dashboard" className="hover:text-neutral-900">
              Dashboard
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-primary-900">Appearance</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Appearance</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Everything that builds and publishes your white-label site, in one place — brand it,
            tune SEO, navigation, socials and widgets, then choose and adjust a template, and
            publish.
          </p>
        </div>

        <div className="flex flex-wrap gap-1 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => selectTab(t.key)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                tab === t.key
                  ? "bg-primary-900 text-white shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "branding" && <BrandingTab />}
        {tab === "seo" && <SeoTab />}
        {tab === "navigation" && <NavigationTab />}
        {tab === "social" && <SocialTab />}
        {tab === "widgets" && <WidgetsTab />}
        {tab === "templates" && <TemplatesTab />}
        {tab === "components" && <ComponentsTab />}
        {tab === "domain" && <DomainTab />}
      </div>
    </SettingsToastProvider>
  );
}
