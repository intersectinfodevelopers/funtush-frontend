"use client";

import Link from "next/link";
import CategoryForm from "@/components/agency/categories/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 py-2 sm:py-4">
      <div className="border-b border-neutral-200 pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span>
          <Link href="/dashboard/categories" className="hover:text-neutral-900">Categories</Link><span className="text-neutral-300">/</span>
          <span className="font-semibold text-neutral-900">New category</span>
        </nav>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Add category</h1>
        <p className="mt-1 text-sm text-neutral-600">Create a new content category and assign its display settings.</p>
      </div>
      <CategoryForm />
    </div>
  );
}
