"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Notifications is now a tab on the single Settings page. */
export default function NotificationsSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/settings?tab=notifications");
  }, [router]);

  return null;
}
