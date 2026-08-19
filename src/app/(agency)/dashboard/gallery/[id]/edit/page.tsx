"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import UploadImageForm from "@/components/agency/gallery/UploadImageForm";
import { useGallery } from "@/hooks/useGallery";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function EditGalleryImagePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { gallery, updateImage, isLoaded } = useGallery();
  const image = gallery.find((item) => item.id === params.id);

  useEffect(() => {
    if (!isLoaded) return;
    if (!image) {
      toast.error("Gallery image not found.");
      router.push("/dashboard/gallery");
    }
  }, [image, isLoaded, router]);

  if (!image)
    return (
      <div className="mx-auto w-full max-w-6xl py-6 text-sm text-neutral-600">
        Loading gallery image...
      </div>
    );

  return (
    <div className="space-y-4 w-full">
      <div className="mb-6">
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Link href="/dashboard">Dashboard</Link>
          <ChevronRight size={15} />
          <Link href="/dashboard/gallery">Gallery</Link>
          <ChevronRight size={15} />
          <strong className="text-primary-900">Edit Image</strong>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">
          Edit gallery image
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Update the image, its details, and publication status.
        </p>
      </div>
      <UploadImageForm
        initialData={image}
        submitLabel="Save changes"
        onSave={(data) => {
          updateImage(image.id, data);
          toast.success("Gallery post updated successfully.");
          router.push("/dashboard/gallery");
        }}
      />
    </div>
  );
}
