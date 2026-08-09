"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PackageBuilderForm, {
  type PackageForm,
} from "@/components/PackageBuilderForm";
import packagesData from "../../../../../../../data/packages.json";

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
      difficulty:
        rawPackage.difficulty === "Easy-Moderate"
          ? "Moderate"
          : (rawPackage.difficulty as PackageForm["difficulty"]),
      duration: rawPackage.duration_days,
      maxGroup: rawPackage.group_size_max,
      shortDesc: "",
      fullDesc: "",
      itinerary: [],
      dates: [
        { date: rawPackage.start_date, slots: rawPackage.group_size_max },
      ],
      basePrice: rawPackage.price_usd * 133,
      currency: "NPR",
      pricing: [],
      heroImage: "",
      gallery: [],
      video: "",
      addons: rawPackage.included.map((name) => ({
        name,
        price: 0,
        perPerson: false,
      })),
    };
  });

  useEffect(() => {
    if (!initialData) {
      router.push("/dashboard/packages");
    }
  }, [initialData, router]);

  if (!initialData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-gray-500 animate-pulse">
          Loading package specifications...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-x-hidden p-4 sm:p-6">
      <PackageBuilderForm initialData={initialData} />
    </div>
  );
}
