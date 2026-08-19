"use client";

import { useRouter } from "next/navigation";
import AdvertisementForm from "@/components/agency/advertisements/AdvertisementForm";
import adsData from "../../../../../../../data/advertisements.json";
import { use, useEffect, useState } from "react";

type Ad = {
  id: string;
  title: string;
  image: string;
  position: string;
  status: "active" | "paused";
  clicks: number;
  impressions: number;
  startDate: string;
  endDate: string;
  order: number;
};

type EditAdvertisementPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditAdvertisementPage({
  params,
}: EditAdvertisementPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [advertisement, setAdvertisement] = useState<Ad | null | undefined>(
    undefined,
  );

  useEffect(() => {
    const storedAds = localStorage.getItem("advertisements");
    const ads: Ad[] = storedAds ? JSON.parse(storedAds) : adsData;

    const found = ads.find((ad) => ad.id === id) ?? null;
    setAdvertisement(found);
  }, [id]);

  // Still loading from localStorage
  if (advertisement === undefined) {
    return null;
  }

  if (!advertisement) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-neutral-900">
          Advertisement not found
        </h1>

        <button
          type="button"
          onClick={() => router.push("/dashboard/advertisements")}
          className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to Advertisements
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-col gap-5">
      <div className="mb-7 border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="hover:text-neutral-900"
          >
            Dashboard
          </button>

          <span className="text-neutral-300">/</span>

          <button
            type="button"
            onClick={() => router.push("/dashboard/advertisements")}
            className="hover:text-neutral-900"
          >
            Advertisements
          </button>

          <span className="text-neutral-300">/</span>

          <span className="font-semibold text-neutral-900">
            Edit advertisement
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-bold text-neutral-900">
          Edit Advertisement
        </h1>

        <p className="mt-1 text-sm text-neutral-600">
          Update the advertisement details.
        </p>
      </div>

      <AdvertisementForm
        isEdit
        advertisementId={advertisement.id}
        initialData={{
          title: advertisement.title,
          image: advertisement.image,
          position: advertisement.position,
          status: advertisement.status,
        }}
      />
    </div>
  );
}
