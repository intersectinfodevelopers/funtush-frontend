"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";

import { useAd, useAdPositions } from "@/hooks/useAgencyAds";
import { deleteAd } from "@/lib/api/agency/ads";
import type { ApiError } from "@/lib/api/client";

const btn = "inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50";

export default function AdvertisementViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: a, isLoading } = useAd(id);
  const positions = useAdPositions();
  const [confirming, setConfirming] = useState(false);
  const del = useMutation({
    mutationFn: () => deleteAd(id),
    onSuccess: () => { toast.success(`“${a?.title}” was deleted`); void qc.invalidateQueries({ queryKey: ["agency", "ads"] }); router.replace("/dashboard/advertisements"); },
    onError: (e) => { setConfirming(false); toast.error((e as unknown as ApiError).message || "Couldn't delete the advertisement."); },
  });

  if (isLoading) return <div className="mx-auto h-48 max-w-4xl animate-pulse rounded-xl bg-neutral-100" />;
  if (!a) return <div className="mx-auto max-w-4xl text-sm text-neutral-700">This advertisement doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/advertisements">Back to advertisements</Link></div>;

  const positionLabel = positions.data?.find((p) => p.id === a.position)?.label ?? a.position;
  const facts: Array<[string, string]> = [["Position", positionLabel], ["Clicks", a.clicks.toLocaleString()], ["Impressions", a.impressions.toLocaleString()], ["Link", a.linkUrl ?? "—"]];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 py-2 sm:py-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500">
        <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span>
        <Link href="/dashboard/advertisements" className="hover:text-neutral-900">Advertisements</Link><span className="text-neutral-300">/</span>
        <span className="font-semibold text-neutral-900">Details</span>
      </nav>

      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{a.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${a.status === "active" ? "bg-success-50 text-success-700" : "bg-neutral-100 text-neutral-600"}`}>{a.status === "active" ? "Active" : "Paused"}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href={`/dashboard/advertisements/${a.id}/edit`} className={btn}><Pencil className="h-4 w-4" /> Edit</Link>
          <button type="button" onClick={() => setConfirming(true)} className="inline-flex items-center gap-2 rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700"><Trash2 className="h-4 w-4" /> Delete</button>
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={a.image} alt={a.title} className="w-full rounded-xl border border-neutral-200 object-cover" />

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-neutral-100 pt-5 text-sm sm:grid-cols-4">
        {facts.map(([k, val]) => <div key={k} className="min-w-0"><dt className="text-neutral-500">{k}</dt><dd className="mt-0.5 truncate font-semibold text-neutral-900" title={val}>{val}</dd></div>)}
      </dl>

      {confirming && (
        <div role="dialog" aria-modal="true" aria-label="Delete advertisement" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-neutral-900">Delete “{a.title}”?</h3>
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
