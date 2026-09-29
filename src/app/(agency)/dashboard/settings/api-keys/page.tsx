"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** API keys is now a tab on the single Settings page. */
export default function ApiKeysSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/settings?tab=api-keys");
  }, [router]);

  return null;
}
