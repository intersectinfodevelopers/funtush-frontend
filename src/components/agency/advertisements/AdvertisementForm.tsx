"use client";

import { ChangeEvent, DragEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";

type AdvertisementFormProps = {
  isEdit?: boolean;
  advertisementId?: string;
  initialData?: {
    title: string;
    image: string;
    position: string;
    status: "active" | "paused";
  };
};

const positions = [
  { label: "Homepage Top", value: "homepage-top" },
  { label: "Homepage Bottom", value: "homepage-bottom" },
  { label: "Sidebar 1", value: "sidebar-1" },
  { label: "Sidebar 2", value: "sidebar-2" },
];

const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 0.75;

const optimizeImage = async (file: File) => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
};

export default function AdvertisementForm({
  isEdit = false,
  advertisementId,
  initialData,
}: AdvertisementFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [image, setImage] = useState(initialData?.image ?? "");
  const [position, setPosition] = useState(initialData?.position ?? "");
  const [status, setStatus] = useState<"active" | "paused">(
    initialData?.status ?? "active",
  );

  const [error, setError] = useState("");

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    optimizeImage(file)
      .then((optimizedImage) => {
        setImage(optimizedImage);
        setError("");
      })
      .catch(() => {
        setError("Unable to process this image. Please select another file.");
      });

    // Only one photo is allowed.
    event.target.value = "";
  };
  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    optimizeImage(file)
      .then((optimizedImage) => {
        setImage(optimizedImage);
        setError("");
      })
      .catch(() => {
        setError("Unable to process this image. Please select another file.");
      });
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const removeImage = () => {
    setImage("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    if (!image) {
      setError("Please upload a photo.");
      return;
    }

    if (!position) {
      setError("Please select a position.");
      return;
    }

    const storedAds = localStorage.getItem("advertisements");

    let ads = [];

    try {
      ads = storedAds ? JSON.parse(storedAds) : [];
    } catch {
      setError(
        "Saved advertisements are corrupted. Please refresh and try again.",
      );
      return;
    }

    let nextAds;

    if (isEdit && advertisementId) {
      const updatedAds = ads.map(
        (ad: {
          id: string;
          title: string;
          image: string;
          position: string;
          status: "active" | "paused";
        }) => {
          if (ad.id !== advertisementId) {
            return ad;
          }

          return {
            ...ad,
            title: title.trim(),
            image,
            position,
            status,
          };
        },
      );

      nextAds = updatedAds;
    } else {
      const newAd = {
        id: `ad-${Date.now()}`,
        title: title.trim(),
        image,
        position,
        status,
        clicks: 0,
        impressions: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        order: ads.length + 1,
      };

      nextAds = [...ads, newAd];
    }

    try {
      localStorage.setItem("advertisements", JSON.stringify(nextAds));
    } catch {
      setError(
        "This image is too large to save. Please choose a smaller image.",
      );
      return;
    }

    router.push("/dashboard/advertisements");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-semibold text-neutral-900"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter advertisement title"
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-black placeholder:text-neutral-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {/* Photo */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-900">
              Photo
            </label>

            {!image ? (
              <label
                htmlFor="advertisement-image"
                onDragOver={(event) => {
                  event.preventDefault();
                }}
                onDrop={handleDrop}
                className="flex min-h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 bg-white transition hover:border-primary-300"
              >
                <ImagePlus size={24} className="text-neutral-400" />

                <p className="text-xs text-neutral-500">
                  Drag &amp; drop an image here
                </p>

                <span className="mt-1 inline-flex cursor-pointer items-center justify-center rounded-full bg-primary-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-800">
                  Choose file
                </span>

                <input
                  id="advertisement-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-neutral-200">
                <img
                  src={image}
                  alt="Advertisement preview"
                  className="max-h-80 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  title="Remove image"
                  aria-label="Remove image"
                  className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white shadow-md transition hover:bg-black/80"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Position */}
          <div>
            <label
              htmlFor="position"
              className="mb-2 block text-sm font-semibold text-neutral-900"
            >
              Position
            </label>

            <select
              id="position"
              value={position}
              onChange={(event) => setPosition(event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">Select position</option>

              {positions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-semibold text-neutral-900"
            >
              Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "active" | "paused")
              }
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/advertisements")}
          className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-900"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-xl bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
        >
          {isEdit ? "Save Changes" : "Add Advertisement"}
        </button>
      </div>
    </form>
  );
}
