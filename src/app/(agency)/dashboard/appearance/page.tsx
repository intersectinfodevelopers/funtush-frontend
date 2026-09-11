"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Palette, LayoutTemplate, Sparkles } from "lucide-react";
import { SettingsToastProvider } from "@/components/agency/settings/settings-kit";
import { BrandingTab } from "@/components/agency/appearance/BrandingTab";
import { ComponentsTab } from "@/components/agency/appearance/ComponentsTab";
import { TemplatesTab } from "@/components/agency/appearance/TemplatesTab";

type Tab = "branding" | "components" | "templates";

const TABS: { key: Tab; label: string; icon: typeof Palette }[] = [
  { key: "branding", label: "Branding", icon: Palette },
  { key: "components", label: "Components", icon: LayoutTemplate },
  { key: "templates", label: "Templates", icon: Sparkles },
];

export default function AppearancePage() {
  const [tab, setTab] = useState<Tab>("branding");

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
            How your white-label site looks — brand, on-page components, and starter templates.
          </p>
        </div>

        <div className="flex gap-1 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-sm sm:inline-flex">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition sm:flex-none ${
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
        {tab === "components" && <ComponentsTab />}
        {tab === "templates" && <TemplatesTab />}
      </div>
    </SettingsToastProvider>
  );
}
