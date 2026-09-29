"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Branding moved to its own top-level "Appearance" section (alongside
 * Components and Templates) — this settings page now just redirects there.
 */
export default function BrandingSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/appearance");
  }, [router]);

  return null;
}
