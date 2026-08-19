"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import UploadImageForm from "@/components/agency/gallery/UploadImageForm";
import { useGallery } from "@/hooks/useGallery";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function NewGalleryPage() {
  const router = useRouter();
  const { addImage } = useGallery();

  const handleUpload = (data: Parameters<typeof addImage>[0]) => {
    try {
      const uploaded = addImage(data);
      toast.success(
        `${uploaded.images.length} photo${uploaded.images.length === 1 ? "" : "s"} added to the gallery post.`,
      );
      router.push("/dashboard/gallery");
    } catch {
      toast.error("Could not upload the images. Please try again.");
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="mb-6">
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Link href="/dashboard">Dashboard</Link>
          <ChevronRight size={15} />
          <Link href="/dashboard/gallery">Gallery</Link>
          <ChevronRight size={15} />
          <strong className="text-primary-900">Upload Image</strong>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">
          New gallery post
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Add up to five photos to one gallery post.
        </p>
      </div>
      <UploadImageForm onSave={handleUpload} />
    </div>
  );
}
