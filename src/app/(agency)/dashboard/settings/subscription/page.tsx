"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Subscription is now a tab on the single Settings page. */
export default function SubscriptionSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/settings?tab=subscription");
  }, [router]);

  return null;
}
