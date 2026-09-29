"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Payments is now a tab on the single Settings page. */
export default function PaymentsSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/settings?tab=payments");
  }, [router]);

  return null;
}
