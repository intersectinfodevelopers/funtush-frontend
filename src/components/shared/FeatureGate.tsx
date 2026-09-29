"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

interface FeatureGateProps {
  /** Whether the signed-in agency's current subscription package grants this right. */
  unlocked: boolean;
  /** True while the tier is still loading — renders a skeleton instead of flashing the poster. */
  loading?: boolean;
  /** Display name of the gated feature, e.g. "Blog", "Advertising", "Analytics". */
  feature: string;
  description?: string;
  children: React.ReactNode;
}

/** Full-page "upgrade your package" poster shown in place of a feature's real content
 *  when the agency's current subscription tier doesn't include it. The page itself stays
 *  reachable (no dead sidebar link) — this is what greets a visitor instead. */
export function FeatureGate({ unlocked, loading, feature, description, children }: FeatureGateProps) {
  if (loading) return <div className="h-64 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (unlocked) return <>{children}</>;

  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
      <div className="mx-auto max-w-sm space-y-4">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
          <Lock className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-neutral-900">{feature} isn&apos;t included in your plan</h2>
          <p className="mt-1 text-sm text-neutral-500">{description ?? `Upgrade your subscription package to unlock ${feature.toLowerCase()}.`}</p>
        </div>
        <Link
          href="/dashboard/settings?tab=subscription"
          className="inline-flex items-center gap-2 rounded-full bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
        >
          <Sparkles className="h-4 w-4" /> View plans &amp; upgrade
        </Link>
      </div>
    </div>
  );
}
