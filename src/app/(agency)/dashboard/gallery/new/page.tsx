"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

import UploadImageForm from "@/components/agency/gallery/UploadImageForm";
import { useGallery } from "@/hooks/useGallery";

export default function GalleryPage() {
  const { addImage } = useGallery();

  const handleUpload = (data: Parameters<typeof addImage>[0]) => {
    try {
      addImage(data);

      toast.success("Image uploaded successfully.");
    } catch {
      toast.error("Could not upload the image. Please try again.");
    }
  };

  

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Link href="/dashboard" className="transition hover:text-primary-700">
            Dashboard
          </Link>

          <ChevronRight size={15} />

          <span className="font-semibold text-primary-900">Gallery</span>
        </div>

        <div className="mt-2">
          <h1 className="text-2xl font-bold text-neutral-900">Gallery</h1>

          <p className="mt-1 text-sm text-neutral-600">
            Upload and manage images for your travel gallery.
          </p>
        </div>
      </div>

      {/* Upload */}
      <UploadImageForm onSave={handleUpload} />
      {/* Gallery removed — page focuses on upload only */}
    </div>
  );
}

// Gallery cards and stat cards removed — upload-only page
