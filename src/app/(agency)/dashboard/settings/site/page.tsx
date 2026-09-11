"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Site status (coming-soon, top bar, popup) moved to the "Appearance" section
 * — coming-soon lives on the Branding tab, top bar / popup on Components.
 */
export default function SiteStatusSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/appearance");
  }, [router]);

  return null;
}
