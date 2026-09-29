"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Building2, Sparkles, Wallet, KeyRound, Bell, Mail, ShieldCheck } from "lucide-react";
import { SettingsToastProvider } from "@/components/agency/settings/settings-kit";
import { AgencyInfoTab } from "@/components/agency/settings/AgencyInfoTab";
import { SubscriptionTab } from "@/components/agency/settings/SubscriptionTab";
import { PaymentsTab } from "@/components/agency/settings/PaymentsTab";
import { ApiKeysTab } from "@/components/agency/settings/ApiKeysTab";
import { NotificationsTab } from "@/components/agency/settings/NotificationsTab";
import { EmailTab } from "@/components/agency/settings/EmailTab";
import { SecurityTab } from "@/components/agency/settings/SecurityTab";

type Tab = "agency-info" | "subscription" | "payments" | "api-keys" | "notifications" | "email" | "security";

const TABS: { key: Tab; label: string; icon: typeof Building2 }[] = [
  { key: "agency-info", label: "Agency Info", icon: Building2 },
  { key: "subscription", label: "Subscription", icon: Sparkles },
  { key: "payments", label: "Payment", icon: Wallet },
  { key: "api-keys", label: "API Key", icon: KeyRound },
  { key: "notifications", label: "Notification", icon: Bell },
  { key: "email", label: "Email", icon: Mail },
  { key: "security", label: "Security", icon: ShieldCheck },
];

function isTab(value: string | null): value is Tab {
  return TABS.some((t) => t.key === value);
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPageInner />
    </Suspense>
  );
}

function SettingsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Search params are part of the URL Next already resolved server-side, so
  // reading them straight into initial state (unlike localStorage) can't
  // disagree with the server's render.
  const [tab, setTab] = useState<Tab>(() => {
    const fromQuery = searchParams.get("tab");
    return isTab(fromQuery) ? fromQuery : "agency-info";
  });

  // Keeps the shown tab in sync when something other than the tab bar below
  // changes the URL (e.g. a link elsewhere pointing at `?tab=payments`).
  useEffect(() => {
    const fromQuery = searchParams.get("tab");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isTab(fromQuery) && fromQuery !== tab) setTab(fromQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function selectTab(next: Tab) {
    setTab(next);
    router.replace(`/dashboard/settings?tab=${next}`, { scroll: false });
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
            <span className="font-semibold text-primary-900">Settings</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Settings</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Your agency&apos;s own details, billing, integrations and account security.
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

        {tab === "agency-info" && <AgencyInfoTab />}
        {tab === "subscription" && <SubscriptionTab />}
        {tab === "payments" && <PaymentsTab />}
        {tab === "api-keys" && <ApiKeysTab />}
        {tab === "notifications" && <NotificationsTab />}
        {tab === "email" && <EmailTab />}
        {tab === "security" && <SecurityTab />}
      </div>
    </SettingsToastProvider>
  );
}
