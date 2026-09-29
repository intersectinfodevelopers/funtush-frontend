"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Security is now a tab on the single Settings page. */
export default function SecuritySettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/settings?tab=security");
  }, [router]);

  return null;
}
