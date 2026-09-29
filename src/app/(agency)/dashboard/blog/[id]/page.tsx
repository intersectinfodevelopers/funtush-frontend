"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";

import { useBlogs } from "@/hooks/useAgencyBlog";
import { deleteBlog } from "@/lib/api/agency/blog";
import type { ApiError } from "@/lib/api/client";

const btn = "inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50";
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export default function BlogViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading } = useBlogs();
  const p = data?.data.find((x) => x.id === id);
  const [confirming, setConfirming] = useState(false);
  const del = useMutation({
    mutationFn: () => deleteBlog(id),
    onSuccess: () => { toast.success(`“${p?.title}” was deleted`); void qc.invalidateQueries({ queryKey: ["agency", "blogs"] }); router.replace("/dashboard/blog"); },
    onError: (e) => { setConfirming(false); toast.error((e as unknown as ApiError).message || "Couldn't delete the post."); },
  });

  if (isLoading) return <div className="mx-auto h-48 max-w-3xl animate-pulse rounded-xl bg-neutral-100" />;
  if (!p) return <div className="mx-auto max-w-3xl text-sm text-neutral-700">This post doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/blog">Back to blog</Link></div>;

  const statusLabel = p.status === "PUBLISHED" ? "Published" : p.status === "SCHEDULED" ? "Scheduled" : "Draft";
  const publishedDate = fmt(p.status === "SCHEDULED" && p.publishAt ? p.publishAt : p.createdAt);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 py-2 sm:py-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500">
        <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span>
        <Link href="/dashboard/blog" className="hover:text-neutral-900">All Blogs</Link><span className="text-neutral-300">/</span>
        <span className="font-semibold text-neutral-900">Details</span>
      </nav>

      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{p.title}</h1>
          {p.subtitle && <p className="mt-2 text-base text-neutral-600">{p.subtitle}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${p.status === "PUBLISHED" ? "bg-success-50 text-success-700" : p.status === "SCHEDULED" ? "bg-accent-50 text-accent-700" : "bg-neutral-100 text-neutral-600"}`}>{statusLabel}</span>
            {p.category && <span className="inline-flex items-center gap-1 rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-800"><span className="text-primary-500">Category:</span> {p.category.name}</span>}
          </div>
          <div className="mt-2.5 flex items-center gap-3 text-xs text-neutral-500">
            <span>{publishedDate}</span>
            <span className="text-neutral-300">•</span>
            <span>{p.views.toLocaleString()} views</span>
          </div>
          {p.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-neutral-500">Tags:</span>
              {p.tags.map((t) => <span key={t} className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">{t}</span>)}
            </div>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href={`/dashboard/blog/${p.id}/edit`} className={btn}><Pencil className="h-4 w-4" /> Edit</Link>
          <button type="button" onClick={() => setConfirming(true)} className="inline-flex items-center gap-2 rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700"><Trash2 className="h-4 w-4" /> Delete</button>
        </div>
      </div>

      {p.photos[0] &&
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.photos[0]} alt={p.title} className="max-h-[28rem] w-full rounded-xl object-cover" />}

      <div className="prose prose-sm max-w-none break-words [overflow-wrap:anywhere]" dangerouslySetInnerHTML={{ __html: p.content }} />

      {confirming && (
        <div role="dialog" aria-modal="true" aria-label="Delete post" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-neutral-900">Delete “{p.title}”?</h3>
            <p className="mt-1 text-sm text-neutral-600">This can&apos;t be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirming(false)} className={btn}>Cancel</button>
              <button type="button" disabled={del.isPending} onClick={() => del.mutate()} className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">{del.isPending ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
