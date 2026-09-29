"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Domain (and Publish) moved into Appearance — it's the last step of
 * building the site, alongside Branding/Templates/Social. This settings page
 * now just redirects there.
 */
export default function DomainSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/appearance?tab=domain");
  }, [router]);

  return null;
}
