"use client";

import { ImagePlus, Upload, X } from "lucide-react";
import { useId, useState } from "react";
import type { GalleryImage, NewGalleryImage } from "@/hooks/useGallery";

interface UploadImageFormProps {
  initialData?: GalleryImage;
  onSave: (post: NewGalleryImage) => void;
  submitLabel?: string;
}
type SelectedImage = { source: string; name: string };
const MAX_IMAGES = 5;
const categories = [
  "Nature",
  "People",
  "Adventure",
  "Culture",
  "Trekking",
  "Mountains",
  "Wildlife",
  "Travel",
  "Other",
];
const fieldClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-50";

export default function UploadImageForm({
  initialData,
  onSave,
  submitLabel = "Publish gallery post",
}: UploadImageFormProps) {
  const inputId = useId();
  const toSelectedImages = (data?: GalleryImage): SelectedImage[] =>
    data?.images.map((source, index) => ({
      source,
      name: `Photo ${index + 1}`,
    })) ?? [];
  const [images, setImages] = useState<SelectedImage[]>(
    toSelectedImages(initialData),
  );
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [category, setCategory] = useState(initialData?.category ?? "Nature");
  const [status, setStatus] = useState<"published" | "draft">(
    initialData?.status ?? "published",
  );
  const [dragActive, setDragActive] = useState(false);
  const isEditing = Boolean(initialData);

  const processFiles = (files: FileList | File[]) => {
    const allowed = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, MAX_IMAGES - images.length);
    allowed.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string")
          setImages((current) =>
            current.length < MAX_IMAGES
              ? [...current, { source: result, name: file.name }]
              : current,
          );
      };
      reader.readAsDataURL(file);
    });
  };
  const resetForm = () => {
    setImages(toSelectedImages(initialData));
    setTitle(initialData?.title ?? "");
    setDescription(initialData?.description ?? "");
    setCategory(initialData?.category ?? "Nature");
    setStatus(initialData?.status ?? "published");
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!images.length || !title.trim()) return;
    onSave({
      images: images.map((image) => image.source),
      title: title.trim(),
      description: description.trim(),
      category,
      status,
    });
    if (!isEditing) resetForm();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6"
    >
      <div className="border-b border-neutral-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
            <ImagePlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              {isEditing ? "Edit gallery post" : "Upload gallery post"}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Add up to five photos to one gallery post. The first photo is the
              featured image.
            </p>
          </div>
        </div>
      </div>
      <section className="pt-5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-neutral-900">Post photos</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Use × to remove a photo before saving, then add a replacement if
            needed.
          </p>
        </div>
        <div
          className={`rounded-3xl border-2 border-dashed p-4 transition ${dragActive ? "border-primary-400 bg-primary-50" : "border-neutral-200 bg-white"}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            processFiles(event.dataTransfer.files);
          }}
        >
          {images.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {images.map((image, index) => (
                <div
                  key={`${image.name}-${index}`}
                  className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
                >
                  <img
                    src={image.source}
                    alt={`Selected photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-primary-900 px-2 py-1 text-[10px] font-semibold text-white">
                      Featured
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setImages((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    aria-label={`Remove ${image.name}`}
                    className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950/75 text-white hover:bg-danger-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col items-center justify-center gap-3 py-5 text-center text-neutral-400">
            <Upload className="h-8 w-8" />
            <span className="text-sm font-medium">Drag & drop photos here</span>
            <label
              htmlFor={inputId}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
            >
              <Upload className="h-4 w-4" />
              {images.length ? "Add photos" : "Choose photos"}
            </label>
            <input
              id={inputId}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => {
                if (event.target.files) processFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <span className="text-xs">
              {images.length}/{MAX_IMAGES} photos selected · JPG, PNG and WEBP
            </span>
          </div>
        </div>
      </section>
      <section className="mt-7 grid gap-4 border-t border-neutral-200 pt-5 sm:grid-cols-2">
        <Field label="Post title" htmlFor="gallery-title" required>
          <input
            id="gallery-title"
            className={fieldClassName}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </Field>
        <Field label="Category" htmlFor="gallery-category" required>
          <select
            id="gallery-category"
            className={fieldClassName}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field
          label="Description"
          htmlFor="gallery-description"
          className="sm:col-span-2"
        >
          <textarea
            id="gallery-description"
            className={`${fieldClassName} min-h-28 resize-y`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
          />
        </Field>
        <Field label="Status" htmlFor="gallery-status">
          <select
            id="gallery-status"
            className={fieldClassName}
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "published" | "draft")
            }
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </Field>
      </section>
      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={resetForm}
          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={!images.length || !title.trim()}
          className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required = false,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label
        className="mb-1.5 block text-sm font-semibold text-neutral-700"
        htmlFor={htmlFor}
      >
        {label}
        {required && <span className="ml-1 text-danger-600">*</span>}
      </label>
      {children}
    </div>
  );
}
