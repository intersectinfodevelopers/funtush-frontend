"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Email is now a tab on the single Settings page. */
export default function EmailSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/settings?tab=email");
  }, [router]);

  return null;
}
