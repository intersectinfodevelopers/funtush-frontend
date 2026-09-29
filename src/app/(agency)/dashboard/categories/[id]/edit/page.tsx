"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import CategoryForm from "@/components/agency/categories/CategoryForm";
import { useCategory } from "@/hooks/useAgencyBlog";

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useCategory(id);
  if (isLoading) return <div className="mx-auto h-40 max-w-6xl animate-pulse border border-neutral-200 bg-white" />;
  if (!data) return <div className="mx-auto max-w-6xl border border-neutral-200 bg-white p-6 text-sm text-neutral-700">This category doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/categories">Back to categories</Link></div>;
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 py-2 sm:py-4">
      <div className="border-b border-neutral-200 pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span>
          <Link href="/dashboard/categories" className="hover:text-neutral-900">Categories</Link><span className="text-neutral-300">/</span>
          <span className="font-semibold text-neutral-900">Edit</span>
        </nav>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Edit category</h1>
        <p className="mt-1 text-sm text-neutral-600">Update this category&apos;s details and display settings.</p>
      </div>
      <CategoryForm category={data} />
    </div>
  );
}
