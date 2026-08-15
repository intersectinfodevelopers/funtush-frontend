"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PackageBuilderForm, { PackageForm } from "@/components/agency/packages/PackageBuilderForm";
import packagesJson from "@/../data/packages.json";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const packageId = (params as any)?.id as string | undefined;

  const [initialData, setInitialData] = useState<PackageForm | null>(null);

  useEffect(() => {
    if (!packageId) return;

    // Try localStorage first (runtime edits)
    try {
      const stored = localStorage.getItem("packages");
      if (stored) {
        const list = JSON.parse(stored) as any[];
        const found = list.find((p) => String(p.id) === String(packageId));
        if (found) {
          setInitialData(found as PackageForm);
          return;
        }
      }
    } catch (e) {
      // ignore and fallback to bundled data
    }

    // Fallback to static data file
    const raw = (packagesJson as any[]).find((p) => String(p.id) === String(packageId));
    if (raw) {
      const mapped: PackageForm = {
        id: raw.id,
        title: raw.title || "",
        destination: raw.destination || (raw.destination_slug ? String(raw.destination_slug).replace(/-/g, " ") : ""),
        difficulty: (raw.difficulty as any) || "Moderate",
        duration: raw.duration_days || raw.duration || 1,
        durationMin: raw.durationMin,
        durationMax: raw.durationMax,
        maxGroup: raw.maxGroup || raw.group_size_max || 12,
        shortDesc: raw.shortDesc || raw.short_description || "",
        fullDesc: raw.fullDesc || raw.full_description || "",
        categoryId: raw.categoryId || "",
        itinerary: raw.itinerary || [],
        dates: raw.dates || [],
        basePrice: raw.basePrice ?? (raw.price_usd ? Math.round(raw.price_usd * 133) : 0),
        currency: raw.currency || "NPR",
        pricing: raw.pricing || [],
        heroImage: raw.heroImage || raw.image || (raw.gallery && raw.gallery[0]) || "",
        gallery: raw.gallery || [],
        video: raw.video || "",
        addons: raw.addons || [],
        region: raw.region || "",
        activities: raw.activities || [],
        altitudeMin: raw.altitudeMin,
        altitudeMax: raw.altitudeMax,
        bestTime: raw.bestTime || "",
        routes: raw.routes || [],
        status: raw.status || "draft",
        featured: !!raw.featured,
      };
      setInitialData(mapped);
      return;
    }

    // Not found — navigate back to packages list
    router.push("/dashboard/packages");
  }, [packageId, router]);

  if (!initialData) return <div className="p-4">Loading package editor...</div>;

  return <PackageBuilderForm initialData={initialData} packageId={packageId} />;
}