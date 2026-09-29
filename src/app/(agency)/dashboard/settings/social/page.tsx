"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Social moved into Appearance (it's part of building the site, alongside
 * Branding/Templates/Domain) — this settings page now just redirects there.
 */
export default function SocialSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/appearance?tab=social");
  }, [router]);

  return null;
}
