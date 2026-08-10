"use client";

import Link from "next/link";
import { Palette } from "lucide-react";
import { useState } from "react";

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  color: string;
  isActive: boolean;
  order: number;
}

interface CategoryFormProps {
  initialData?: Partial<CategoryFormValues>;
  isNew?: boolean;
  onSave: (data: CategoryFormValues) => void;
}

const fieldClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-50";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export default function CategoryForm({
  initialData,
  isNew = false,
  onSave,
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [color, setColor] = useState(initialData?.color ?? "#358CBD");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [order, setOrder] = useState(initialData?.order ?? 0);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedSlug = slugify(slug.trim() || name.trim());

    onSave({
      name: trimmedName,
      slug: trimmedSlug,
      description: description.trim(),
      color,
      isActive,
      order: Number(order || 0),
    });
  };

  return (
    <form
      className="w-full rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6"
      onSubmit={handleSubmit}
    >
      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-xl font-bold text-neutral-900">
          {isNew ? "Add new category" : "Edit category"}
        </h1>
      </div>

      <section className="pt-5" aria-labelledby="category-details-heading">
        <div className="mb-4">
          <h2
            id="category-details-heading"
            className="text-base font-bold text-neutral-900"
          >
            Category details
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Create a content group and define how it should appear across the site.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category name" htmlFor="category-name" required>
            <input
              id="category-name"
              className={fieldClassName}
              value={name}
              onChange={(event) => {
                const nextName = event.target.value;
                setName(nextName);
                if (!slug.trim()) {
                  setSlug(slugify(nextName));
                }
              }}
              placeholder="e.g. Travel Tips"
              required
            />
          </Field>

          <Field label="Display order" htmlFor="category-order">
            <input
              id="category-order"
              type="number"
              min={0}
              className={fieldClassName}
              value={order}
              onChange={(event) => setOrder(Number(event.target.value || 0))}
            />
          </Field>

          <Field label="Slug" htmlFor="category-slug" required>
            <input
              id="category-slug"
              className={fieldClassName}
              value={slug}
              onChange={(event) => setSlug(slugify(event.target.value))}
              placeholder="travel-tips"
              required
            />
          </Field>

          <Field label="Color" htmlFor="category-color">
            <div className="flex items-center gap-3 rounded-xl border border-neutral-300 bg-white px-3 py-2.5">
              <input
                id="category-color"
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="h-10 w-14 cursor-pointer rounded-md border-0 bg-transparent p-0"
              />
              <span className="text-sm text-neutral-600">{color}</span>
            </div>
          </Field>

          <Field label="Description" htmlFor="category-description" className="sm:col-span-2">
            <textarea
              id="category-description"
              className={`${fieldClassName} min-h-[110px] resize-y`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Short description about the category..."
            />
          </Field>
        </div>
      </section>

      <div className="mt-7 flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-primary-600" />
          <span className="text-sm font-medium text-neutral-700">Active</span>
        </div>

        <button
          type="button"
          onClick={() => setIsActive((current) => !current)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
            isActive ? "bg-primary-900" : "bg-neutral-300"
          }`}
          aria-label="Toggle category active state"
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${
              isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/categories"
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-center text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Cancel
        </Link>
        <button
          className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-100"
          type="submit"
        >
          {isNew ? "Create category" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required = false,
  className = "",
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
