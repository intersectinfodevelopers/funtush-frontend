"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * SEO moved into Appearance (it's part of building the site, alongside
 * Branding/Templates/Domain) — this settings page now just redirects there.
 */
export default function SeoSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/appearance?tab=seo");
  }, [router]);

  return null;
}
