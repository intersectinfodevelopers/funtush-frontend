"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CheckCircle2, Pencil, Trash2, XCircle } from "lucide-react";

import { useCategory } from "@/hooks/useAgencyBlog";
import { deleteCategory } from "@/lib/api/agency/blog";
import type { ApiError } from "@/lib/api/client";

const btn = "inline-flex items-center gap-2 border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50";
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function CategoryViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: c, isLoading } = useCategory(id);
  const [confirming, setConfirming] = useState(false);
  const del = useMutation({
    mutationFn: () => deleteCategory(id),
    onSuccess: () => { toast.success(`“${c?.name}” was deleted`); void qc.invalidateQueries({ queryKey: ["agency", "categories"] }); router.replace("/dashboard/categories"); },
    onError: (e) => { setConfirming(false); toast.error((e as unknown as ApiError).message || "Couldn't delete the category.", { duration: 7000 }); },
  });

  if (isLoading) return <div className="mx-auto h-48 max-w-6xl animate-pulse border border-neutral-200 bg-white" />;
  if (!c) return <div className="mx-auto max-w-6xl border border-neutral-200 bg-white p-6 text-sm text-neutral-700">This category doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/categories">Back to categories</Link></div>;

  const facts: Array<[string, string]> = [["Slug", c.slug], ["Status", c.isActive ? "Active" : "Inactive"], ["Display order", `#${c.displayOrder}`], ["Colour", c.color], ["Posts", String(c.postCount)], ["Created", fmt(c.createdAt)], ["Last updated", fmt(c.updatedAt)]];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 py-2 sm:py-4">
      <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500">
            <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span>
            <Link href="/dashboard/categories" className="hover:text-neutral-900">Categories</Link><span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">Details</span>
          </nav>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: c.color }} aria-hidden="true" />
            <h1 className="text-2xl font-bold text-neutral-900">{c.name}</h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${c.isActive ? "bg-success-50 text-success-700" : "bg-neutral-100 text-neutral-600"}`}>{c.isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}{c.isActive ? "Active" : "Inactive"}</span>
          </div>
                  </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/categories/${c.id}/edit`} className={btn}><Pencil className="h-4 w-4" /> Edit</Link>
          <button type="button" onClick={() => setConfirming(true)} className="inline-flex items-center gap-2 bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700"><Trash2 className="h-4 w-4" /> Delete</button>
        </div>
      </div>

      <section className="border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-neutral-900">Details</h2>
        <dl className="mt-3 grid gap-x-10 border-t border-neutral-100 text-sm md:grid-cols-2">
          {facts.map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-neutral-100 py-3"><dt className="text-neutral-500">{k}</dt><dd className="flex items-center gap-2 text-right font-semibold text-neutral-900">{k === "Colour" && <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: c.color }} aria-hidden="true" />}{v}</dd></div>)}
          <div className="flex justify-between gap-4 border-b border-neutral-100 py-3 md:col-span-2"><dt className="text-neutral-500">Description</dt><dd className="max-w-xl text-right font-semibold text-neutral-900">{c.description || "—"}</dd></div>
        </dl>
      </section>

      {confirming && (
        <div role="dialog" aria-modal="true" aria-label="Delete category" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-neutral-900">Delete “{c.name}”?</h3>
            <p className="mt-1 text-sm text-neutral-600">{c.postCount > 0 ? `It is used by ${c.postCount} post${c.postCount === 1 ? "" : "s"}, so it can't be deleted — mark it inactive instead.` : "This can't be undone."}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirming(false)} className={btn}>Cancel</button>
              <button type="button" disabled={del.isPending || c.postCount > 0} onClick={() => del.mutate()} className="bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">{del.isPending ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
