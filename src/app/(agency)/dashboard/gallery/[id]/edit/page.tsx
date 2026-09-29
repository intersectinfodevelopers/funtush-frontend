"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import UploadImageForm from "@/components/agency/gallery/UploadImageForm";
import { useGalleryPost } from "@/hooks/useAgencyMedia";

export default function EditGalleryPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGalleryPost(id);
  if (isLoading) return <div className="mx-auto h-40 max-w-6xl animate-pulse border border-neutral-200 bg-white" />;
  if (!data) return <div className="mx-auto max-w-6xl border border-neutral-200 bg-white p-6 text-sm">This gallery post doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/gallery">Back to gallery</Link></div>;
  return <UploadImageForm post={data} />;
}
