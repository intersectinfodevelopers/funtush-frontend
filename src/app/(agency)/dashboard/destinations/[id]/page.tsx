"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, Heart, Pencil, Star, Trash2 } from "lucide-react";

import { useDestination } from "@/hooks/useAgencyDestinations";
import { deleteDestination } from "@/lib/api/agency/destinations";
import type { ApiError } from "@/lib/api/client";

const btn = "inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50";
const range = (r: { min: number | null; max: number | null }, unit: string) => {
  if (r.min == null && r.max == null) return "—";
  if (r.min != null && r.max != null && r.min !== r.max) return `${r.min.toLocaleString()} – ${r.max.toLocaleString()} ${unit}`;
  return `${(r.min ?? r.max)!.toLocaleString()} ${unit}`;
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
      <div className="mt-3 border-t border-neutral-100 pt-4">{children}</div>
    </section>
  );
}

export default function DestinationViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: d, isLoading } = useDestination(id);
  const [confirming, setConfirming] = useState(false);
  const del = useMutation({
    mutationFn: () => deleteDestination(id),
    onSuccess: () => {
      toast.success(`“${d?.title}” was deleted`);
      void qc.invalidateQueries({ queryKey: ["agency", "destinations"] });
      router.replace("/dashboard/destinations");
    },
    onError: (e) => toast.error((e as unknown as ApiError).message || "Couldn't delete the destination."),
  });

  if (isLoading) return <div className="mx-auto h-48 max-w-6xl animate-pulse rounded-3xl border border-neutral-200 bg-white" />;
  if (!d) return <div className="mx-auto max-w-6xl rounded-3xl border border-neutral-200 bg-white p-6 text-sm text-neutral-700">This destination doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/destinations">Back to destinations</Link></div>;

  const facts: Array<[string, string]> = [
    ["Category", d.category ?? "—"], ["Region", d.region ?? "—"], ["Difficulty", d.difficulty ?? "—"],
    ["Duration", range(d.duration, "days")], ["Altitude", range(d.altitude, "m")], ["Best time to visit", d.bestTimeToVisit ?? "—"],
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 py-2 sm:py-4">
      <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-neutral-500">
            <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span>
            <Link href="/dashboard/destinations" className="hover:text-neutral-900">Destinations</Link><span className="text-neutral-300">/</span>
            <span className="font-semibold text-primary-900">Details</span>
          </nav>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900">{d.title}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${d.published ? "bg-success-50 text-success-700" : "bg-neutral-100 text-neutral-600"}`}>{d.published ? "Published" : "Draft"}</span>
            {d.featured && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800"><Star className="h-3 w-3 fill-current" />Featured</span>}
          </div>
          {d.shortDescription && <p className="mt-1 text-sm text-neutral-600">{d.shortDescription}</p>}
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/destinations/${d.id}/edit`} className={btn}><Pencil className="h-4 w-4" /> Edit</Link>
          <button type="button" onClick={() => setConfirming(true)} className="inline-flex items-center gap-2 rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700"><Trash2 className="h-4 w-4" /> Delete</button>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            {d.featuredImage
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={d.featuredImage} alt={d.title} className="max-h-96 w-full object-cover" />
              : <div className="flex h-56 items-center justify-center text-sm text-neutral-400">No featured image</div>}
          </section>
          <Card title="About this destination">
            <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-700">{d.longDescription || d.shortDescription || "No description added yet."}</p>
          </Card>
          {d.gallery.length > 0 && (
            <Card title={`Gallery · ${d.gallery.length}`}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {d.gallery.map((u) => <img key={u} src={u} alt="" className="h-32 w-full rounded-2xl object-cover" />)}
              </div>
            </Card>
          )}
        </div>
        <div className="space-y-5">
          <Card title="Details">
            <dl className="divide-y divide-neutral-100 text-sm">
              {facts.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2"><dt className="text-neutral-500">{k}</dt><dd className="text-right font-semibold text-neutral-900">{v}</dd></div>)}
            </dl>
          </Card>
          <Card title="Activities">
            {d.activities.length ? <div className="flex flex-wrap gap-1.5">{d.activities.map((a) => <span key={a} className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-900">{a}</span>)}</div> : <p className="text-sm text-neutral-500">None listed.</p>}
          </Card>
          <Card title="Engagement">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><Eye className="mx-auto h-4 w-4 text-neutral-400" /><p className="mt-1 text-lg font-bold">{d.engagement.views}</p><p className="text-[11px] text-neutral-500">Views</p></div>
              <div><Heart className="mx-auto h-4 w-4 text-neutral-400" /><p className="mt-1 text-lg font-bold">{d.engagement.saves}</p><p className="text-[11px] text-neutral-500">Saves</p></div>
              <div><Star className="mx-auto h-4 w-4 text-neutral-400" /><p className="mt-1 text-lg font-bold">{d.rating ?? "—"}</p><p className="text-[11px] text-neutral-500">Rating ({d.reviewCount})</p></div>
            </div>
          </Card>
        </div>
      </div>

      {confirming && (
        <div role="dialog" aria-modal="true" aria-label="Delete destination" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-neutral-900">Delete “{d.title}”?</h3>
            <p className="mt-1 text-sm text-neutral-600">This removes the destination from your site. It can&apos;t be undone.</p>
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
