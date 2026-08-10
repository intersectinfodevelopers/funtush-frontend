"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import CategoryForm, {
  type CategoryFormValues,
} from "@/components/agency/categories/CategoryForm";
import categoriesData from "../../../../../../../data/categories.json";

const STORAGE_KEY = "agency-categories";

const normalizeCategories = (value: unknown): CategoryRecord[] => {
  if (Array.isArray(value)) {
    return value as CategoryRecord[];
  }

  if (value && typeof value === "object" && Array.isArray((value as { categories?: CategoryRecord[] }).categories)) {
    return (value as { categories: CategoryRecord[] }).categories;
  }

  return [];
};

interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  postCount: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const readCategories = (): CategoryRecord[] => {
  const fallback = normalizeCategories(categoriesData);

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored);
    const merged = normalizeCategories(parsed);
    return merged.length > 0 ? merged : fallback;
  } catch {
    return fallback;
  }
};

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [initialData, setInitialData] = useState<CategoryFormValues | null>(null);

  useEffect(() => {
    const categories = readCategories();
    const match = categories.find((item) => item.id === params.id);

    if (!match) {
      toast.error("Category not found.");
      router.push("/dashboard/categories");
      return;
    }

    setInitialData({
      name: match.name,
      slug: match.slug,
      description: match.description,
      color: match.color,
      isActive: match.isActive,
      order: match.order,
    });
  }, [params.id, router]);

  const handleSave = (data: CategoryFormValues) => {
    const trimmedName = data.name.trim();
    const trimmedSlug = data.slug.trim();

    if (!trimmedName) {
      toast.error("Category name is required.");
      return;
    }

    if (!trimmedSlug) {
      toast.error("Category slug is required.");
      return;
    }

    try {
      const categories = readCategories();
      const nextCategories = categories.map((item) =>
        item.id === params.id
          ? {
              ...item,
              name: trimmedName,
              slug: trimmedSlug,
              description: data.description.trim(),
              color: data.color,
              isActive: data.isActive,
              order: Number(data.order || 0),
              updatedAt: new Date().toISOString(),
            }
          : item,
      );

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCategories));
      toast.success("Category updated successfully.");
      router.push("/dashboard/categories");
    } catch {
      toast.error("Could not update the category. Please try again.");
    }
  };

  if (!initialData) {
    return (
      <div className="mx-auto w-full max-w-6xl py-6">
        <p className="text-sm text-neutral-600">Loading category...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl py-2 sm:py-4">
      <div className="mb-7 border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <button type="button" onClick={() => router.push("/dashboard")} className="hover:text-neutral-900">
            Dashboard
          </button>
          <span className="text-neutral-300">/</span>
          <button type="button" onClick={() => router.push("/dashboard/categories")} className="hover:text-neutral-900">
            Categories
          </button>
          <span className="text-neutral-300">/</span>
          <span className="font-semibold text-neutral-900">Edit category</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Update category</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Adjust the category settings and visibility for the dashboard.
        </p>
      </div>
      <CategoryForm initialData={initialData} onSave={handleSave} />
    </div>
  );
}
