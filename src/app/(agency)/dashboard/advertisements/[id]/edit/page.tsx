"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import AdvertisementForm from "@/components/agency/advertisements/AdvertisementForm";
import { useAd } from "@/hooks/useAgencyAds";

export default function EditAdvertisementPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useAd(id);
  if (isLoading) return <div className="mx-auto h-40 max-w-3xl animate-pulse border border-neutral-200 bg-white" />;
  if (!data) return <div className="mx-auto max-w-3xl border border-neutral-200 bg-white p-6 text-sm">This advertisement doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/advertisements">Back to advertisements</Link></div>;
  return <AdvertisementForm key={data.id} ad={data} />;
}
