"use client";

import { useMyTier } from "@/hooks/useAgencySettings";
import { FeatureGate } from "@/components/shared/FeatureGate";

export default function AdvertisementsLayout({ children }: { children: React.ReactNode }) {
  const { tier, isLoading } = useMyTier();
  return (
    <FeatureGate unlocked={tier?.adsEnabled ?? false} loading={isLoading} feature="Advertising">
      {children}
    </FeatureGate>
  );
}
