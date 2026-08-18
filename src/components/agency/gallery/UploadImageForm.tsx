"use client";

import { ImagePlus, Upload } from "lucide-react";
import { useState } from "react";

import type { NewGalleryImage } from "@/hooks/useGallery";

interface UploadImageFormProps {
  onSave: (data: NewGalleryImage) => void;
}

const fieldClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-50";

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

export default function UploadImageForm({ onSave }: UploadImageFormProps) {
  const [image, setImage] = useState("");
  const [imageFileName, setImageFileName] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Nature");
  const [status, setStatus] = useState<"published" | "draft">("published");

  const [dragActive, setDragActive] = useState(false);

  const processFile = (file: File | null | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    setImageFileName(file.name);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleImageFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    processFile(file);
  };

  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    processFile(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!image) {
      return;
    }

    onSave({
      image,
      title: title.trim(),
      description: description.trim(),
      category,
      status,
    });

    resetForm();
  };

  const resetForm = () => {
    setImage("");
    setImageFileName("");
    setTitle("");
    setDescription("");
    setCategory("Nature");
    setStatus("published");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6"
    >
      {/* Header */}
      <div className="border-b border-neutral-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
            <ImagePlus className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-neutral-900">Upload image</h1>

            <p className="mt-1 text-sm text-neutral-500">
              Add a new image to the gallery.
            </p>
          </div>
        </div>
      </div>

      {/* Image upload */}
      <section className="pt-5">
        <div className="mb-4">
          <h2 className="text-base font-bold text-neutral-900">Image</h2>

          <p className="mt-1 text-sm text-neutral-500">
            Upload an image for your gallery.
          </p>
        </div>

        <div
          className={`rounded-3xl border-2 border-dashed bg-white p-4 transition ${
            dragActive
              ? "border-primary-400 bg-primary-50"
              : "border-neutral-200"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="relative flex h-64 w-full max-w-2xl items-center justify-center overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt="Gallery preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-neutral-400">
                  <Upload className="h-8 w-8" />

                  <span className="text-sm font-medium">
                    Drag & drop an image here
                  </span>

                  <span className="text-xs">
                    or choose an image from your device
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="gallery-image"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
              >
                <Upload className="h-4 w-4" />
                Choose image
              </label>

              <span className="text-xs text-neutral-500">
                {imageFileName || "No file chosen"}
              </span>
            </div>

            <input
              id="gallery-image"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImageFile}
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-neutral-500">
          Supported formats: JPG, JPEG, PNG and WEBP.
        </p>
      </section>

      {/* Details */}
      <section
        className="mt-7 border-t border-neutral-200 pt-5"
        aria-labelledby="gallery-details-heading"
      >
        <div className="mb-4">
          <h2
            id="gallery-details-heading"
            className="text-base font-bold text-neutral-900"
          >
            Image details
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Title */}
          <Field label="Image title" htmlFor="gallery-title" required>
            <input
              id="gallery-title"
              className={fieldClassName}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Khumbu Valley Sunset"
              required
            />
          </Field>

          {/* Category */}
          <Field label="Category" htmlFor="gallery-category" required>
            <select
              id="gallery-category"
              className={fieldClassName}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>

          {/* Description */}
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
              placeholder="Describe the image..."
              rows={4}
            />
          </Field>

          {/* Status */}
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
        </div>
      </section>

      {/* Buttons */}
      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={resetForm}
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-center text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Clear
        </button>

        <button
          type="submit"
          disabled={!image || !title.trim()}
          className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Upload image
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

        {required && (
          <span className="ml-1 text-danger-600" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}
