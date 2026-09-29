"use client";

import { useMyTier } from "@/hooks/useAgencySettings";
import { FeatureGate } from "@/components/shared/FeatureGate";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const { tier, isLoading } = useMyTier();
  return (
    <FeatureGate unlocked={tier?.blogEnabled ?? false} loading={isLoading} feature="Blog">
      {children}
    </FeatureGate>
  );
}
