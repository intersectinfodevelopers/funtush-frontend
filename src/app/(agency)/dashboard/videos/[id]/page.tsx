"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";

import { useVideo } from "@/hooks/useAgencyMedia";
import { deleteVideo, youtubeId } from "@/lib/api/agency/media";
import type { ApiError } from "@/lib/api/client";

const btn = "inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50";
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export default function VideoViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: v, isLoading } = useVideo(id);
  const [confirming, setConfirming] = useState(false);
  const del = useMutation({
    mutationFn: () => deleteVideo(id),
    onSuccess: () => { toast.success(`“${v?.title}” was deleted`); void qc.invalidateQueries({ queryKey: ["agency", "videos"] }); router.replace("/dashboard/videos"); },
    onError: (e) => { setConfirming(false); toast.error((e as unknown as ApiError).message || "Couldn't delete the video."); },
  });

  if (isLoading) return <div className="mx-auto h-48 max-w-3xl animate-pulse rounded-xl bg-neutral-100" />;
  if (!v) return <div className="mx-auto max-w-3xl text-sm text-neutral-700">This video doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/videos">Back to videos</Link></div>;

  const yt = youtubeId(v.youtubeUrl);
  const facts: Array<[string, string]> = [["Status", v.status === "active" ? "Active" : "Inactive"], ["Display order", String(v.order)], ["Views", v.views.toLocaleString()], ["Added", fmt(v.createdAt)]];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 py-2 sm:py-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500">
        <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span>
        <Link href="/dashboard/videos" className="hover:text-neutral-900">Manage Videos</Link><span className="text-neutral-300">/</span>
        <span className="font-semibold text-neutral-900">Details</span>
      </nav>

      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{v.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${v.status === "active" ? "bg-success-50 text-success-700" : "bg-neutral-100 text-neutral-600"}`}>{v.status === "active" ? "Active" : "Inactive"}</span>
          </div>
          {v.description && <p className="mt-2 max-w-xl text-sm text-neutral-600">{v.description}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href={`/dashboard/videos/${v.id}/edit`} className={btn}><Pencil className="h-4 w-4" /> Edit</Link>
          <button type="button" onClick={() => setConfirming(true)} className="inline-flex items-center gap-2 rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700"><Trash2 className="h-4 w-4" /> Delete</button>
        </div>
      </div>

      {yt ? (
        <div className="aspect-video w-full overflow-hidden rounded-xl border border-neutral-200">
          <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${encodeURIComponent(yt)}`} title={v.title} allowFullScreen />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        v.thumbnail && <img src={v.thumbnail} alt={v.title} className="w-full rounded-xl object-cover" />
      )}

      <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="block break-words text-sm text-primary-700 hover:underline">{v.youtubeUrl}</a>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-neutral-100 pt-5 text-sm sm:grid-cols-4">
        {facts.map(([k, val]) => <div key={k}><dt className="text-neutral-500">{k}</dt><dd className="mt-0.5 font-semibold text-neutral-900">{val}</dd></div>)}
      </dl>

      {confirming && (
        <div role="dialog" aria-modal="true" aria-label="Delete video" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-neutral-900">Delete “{v.title}”?</h3>
            <p className="mt-1 text-sm text-neutral-600">This removes it from your site. It can&apos;t be undone.</p>
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
