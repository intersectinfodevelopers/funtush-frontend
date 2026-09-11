"use client";

import { KeyRound, Sparkles } from "lucide-react";
import { SettingsHeader, SettingsSection } from "@/components/agency/settings/settings-kit";

export default function ApiKeysSettingsPage() {
  return (
    <div className="space-y-6">
      <SettingsHeader
        title="API keys"
        description="Programmatic access to your agency data."
      />

      <SettingsSection>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-2xl bg-primary-50 p-4 text-primary-700">
            <KeyRound className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-neutral-900">Coming soon</h2>
          <p className="mt-2 max-w-sm text-sm text-neutral-500">
            API key management — scoped, revocable keys for connecting your own tools to Funtush —
            is on the roadmap. We&apos;ll let you know the moment it&apos;s ready.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-warning-50 px-3 py-1 text-xs font-semibold text-warning-700">
            <Sparkles className="h-3.5 w-3.5" />
            In development
          </span>
        </div>
      </SettingsSection>
    </div>
  );
}
