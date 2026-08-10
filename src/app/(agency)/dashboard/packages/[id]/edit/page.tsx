"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PackageBuilderForm, {
  type PackageForm,
} from "@/components/agency/packages/PackageBuilderForm";
import packagesData from "@/../data/packages.json";

type RawPackage = {
  id: string;
  title: string;
  destination_slug: string;
  duration_days: number;
  group_size_max: number;
  price_usd: number;
  difficulty: string;
  included: string[];
  start_date: string;
};

export default function EditPackagePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [initialData] = useState<PackageForm | null>(() => {
    if (typeof window === "undefined" || !id) return null;

    const stored = localStorage.getItem("packages");

    const allPackages = stored
      ? (JSON.parse(stored) as PackageForm[])
      : (packagesData as RawPackage[]);
    const foundPackage = allPackages.find((p) => String(p.id) === String(id));

    if (!foundPackage) return null;
    if ("duration" in foundPackage) return foundPackage as PackageForm;

    const rawPackage = foundPackage as RawPackage;
    return {
      id: rawPackage.id,
      title: rawPackage.title,
      destination: rawPackage.destination_slug.replace(/-/g, " "),
      difficulty: rawPackage.difficulty === "Easy-Moderate" ? "Moderate" : rawPackage.difficulty as PackageForm["difficulty"],
      duration: rawPackage.duration_days,
      maxGroup: rawPackage.group_size_max,
      shortDesc: "",
      fullDesc: "",
      itinerary: [],
      dates: [{ date: rawPackage.start_date, slots: rawPackage.group_size_max }],
      basePrice: rawPackage.price_usd * 133,
      currency: "NPR",
      pricing: [],
      heroImage: "",
      gallery: [],
      video: "",
      addons: rawPackage.included.map((name) => ({ name, price: 0, perPerson: false })),
    };
  });

  useEffect(() => {
    if (!initialData) {
      router.push("/dashboard/packages");
    }
  }, [initialData, router]);

  return (
    <div className="mx-auto w-full max-w-6xl py-2 sm:py-4">
      <div className="mb-7 flex flex-col gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <button type="button" onClick={() => router.push("/dashboard")} className="transition hover:text-neutral-900">
              Dashboard
            </button>
            <span className="text-neutral-300">/</span>
            <button type="button" onClick={() => router.push("/dashboard/packages")} className="transition hover:text-neutral-900">
              Packages
            </button>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-primary-900">Edit package</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Update package</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Step through each section to adjust the trip details, pricing, and schedule.
          </p>
        </div>
      </div>

      {initialData ? (
        <PackageBuilderForm initialData={initialData} packageId={id} />
      ) : (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-gray-500 animate-pulse">Loading package specifications...</div>
        </div>
      )}
    </div>
  );
}