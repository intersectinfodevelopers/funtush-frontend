"use client";

import Link from "next/link";
import { ChevronRight, Eye, Heart, ImagePlus, Images } from "lucide-react";
import toast from "react-hot-toast";

import UploadImageForm from "@/components/agency/gallery/UploadImageForm";
import { useGallery } from "@/hooks/useGallery";

export default function GalleryPage() {
  const { gallery, addImage, deleteImage } = useGallery();

  const handleUpload = (data: Parameters<typeof addImage>[0]) => {
    try {
      addImage(data);

      toast.success("Image uploaded successfully.");
    } catch {
      toast.error("Could not upload the image. Please try again.");
    }
  };

  const publishedCount = gallery.filter(
    (item) => item.status === "published",
  ).length;

  const draftCount = gallery.filter((item) => item.status === "draft").length;

  const totalViews = gallery.reduce((total, item) => total + item.views, 0);

  const totalLikes = gallery.reduce((total, item) => total + item.likes, 0);

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

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Images className="h-5 w-5" />}
          label="Total images"
          value={gallery.length}
        />

        <StatCard
          icon={<ImagePlus className="h-5 w-5" />}
          label="Published"
          value={publishedCount}
        />

        <StatCard
          icon={<Eye className="h-5 w-5" />}
          label="Total views"
          value={totalViews.toLocaleString()}
        />

        <StatCard
          icon={<Heart className="h-5 w-5" />}
          label="Total likes"
          value={totalLikes.toLocaleString()}
        />
      </div>

      {/* Upload */}
      <UploadImageForm onSave={handleUpload} />

      {/* Gallery */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Gallery images
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Manage your uploaded travel images.
            </p>
          </div>

          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
            {draftCount} draft
            {draftCount !== 1 ? "s" : ""}
          </span>
        </div>

        {gallery.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 px-6 py-12 text-center">
            <Images className="mx-auto h-8 w-8 text-neutral-400" />

            <p className="mt-3 text-sm font-semibold text-neutral-700">
              No gallery images yet
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              Upload your first image using the form above.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gallery
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onDelete={() => {
                    deleteImage(item.id);

                    toast.success("Image deleted successfully.");
                  }}
                />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}

function GalleryCard({
  item,
  onDelete,
}: {
  item: {
    id: string;
    image: string;
    title: string;
    description: string;
    category: string;
    likes: number;
    views: number;
    status: "published" | "draft";
    order: number;
  };
  onDelete: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
        />

        {/* Status */}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
            item.status === "published"
              ? "bg-green-50 text-green-700"
              : "bg-neutral-100 text-neutral-700"
          }`}
        >
          {item.status === "published" ? "Published" : "Draft"}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-neutral-900">{item.title}</h3>

            <p className="mt-1 text-xs font-medium text-primary-700">
              {item.category}
            </p>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-neutral-600">
          {item.description}
        </p>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {item.likes}
          </span>

          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {item.views.toLocaleString()}
          </span>
        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={onDelete}
          className="mt-4 w-full rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
        >
          Delete image
        </button>
      </div>
    </article>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
          {icon}
        </div>

        <div>
          <p className="text-xs font-medium text-neutral-500">{label}</p>

          <p className="mt-1 text-xl font-bold text-neutral-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
