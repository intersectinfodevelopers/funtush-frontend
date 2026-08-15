"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import CategoryForm, {
  type CategoryFormValues,
} from "@/components/agency/categories/CategoryForm";
import categoriesData from "../../../../../../data/categories.json";

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

export default function NewCategoryPage() {
  const router = useRouter();
  const [formKey, setFormKey] = useState(0);

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
      const newCategory: CategoryRecord = {
        id: `${trimmedSlug}-${Date.now()}`,
        name: trimmedName,
        slug: trimmedSlug,
        description: data.description.trim(),
        color: data.color,
        postCount: 0,
        isActive: data.isActive,
        order: Number(data.order || 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const nextCategories = [newCategory, ...categories];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCategories));

      toast.success("Category created successfully.");
      setFormKey((current) => current + 1);
      router.push("/dashboard/categories");
    } catch {
      toast.error("Could not create the category. Please try again.");
    }
  };

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
          <span className="font-semibold text-neutral-900">New category</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Add category</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Create a new content category and assign its display settings.
        </p>
      </div>
      <CategoryForm key={formKey} onSave={handleSave} isNew />
    </div>
  );
}
