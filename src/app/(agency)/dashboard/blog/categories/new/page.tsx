"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  const handleNameChange = (value: string) => {
    setName(value);
    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    toast.success(`Category "${name}" created successfully!`);
    router.push("/dashboard/category");
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <button type="button" onClick={() => router.push("/dashboard")} className="hover:text-neutral-900">Dashboard</button>
            <span className="text-neutral-300">/</span>
            <button type="button" onClick={() => router.push("/dashboard/category")} className="hover:text-neutral-900">Manage Categories</button>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">New Category</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Add New Category</h1>
          <p className="mt-1 text-sm text-neutral-600">Create a new category to organize your blog posts.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-1">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Technology"
            required
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. technology"
            required
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-mono text-neutral-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the category..."
            rows={3}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "Active" | "Inactive")}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={() => {
              toast.success("Creation cancelled");
              router.push("/dashboard/category");
            }}
            className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-2xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
          >
            Create Category
          </button>
        </div>
      </form>
    </div>
  );
}