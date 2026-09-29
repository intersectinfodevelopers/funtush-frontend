"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Agency Info is now a tab on the single Settings page. */
export default function AgencyInfoSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/settings?tab=agency-info");
  }, [router]);

  return null;
}
