"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CalendarDays, Pencil, RotateCcw, Send, Trash2 } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { useMoney } from "@/hooks/useAgencyDashboard";
import { usePackageDetail } from "@/hooks/useAgencyPackages";
import {
  archivePackage,
  deletePackagePermanently,
  DIFFICULTY_LABEL,
  publishPackage,
  restorePackage,
  seatsLeft,
  type PackageStatus,
} from "@/lib/api/agency/packages";
import { discountedPerPerson } from "@/lib/pricing";
import type { ApiError } from "@/lib/api/client";

const STATUS_STYLE: Record<PackageStatus, string> = {
  PUBLISHED: "border-success-200 bg-success-50 text-success-700",
  DRAFT: "border-warning-200 bg-warning-50 text-warning-700",
  ARCHIVED: "border-danger-200 bg-danger-50 text-danger-700",
};

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const daysUntil = (iso: string) => {
  const d = new Date(iso);
  const start = new Date(); start.setHours(0, 0, 0, 0);
  return Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - start.getTime()) / 86_400_000);
};
/** More than 10 days left: green · 3 to 10: yellow · under 3: red. */
const leftTone = (n: number) => (n > 10 ? "text-success-700" : n >= 3 ? "text-warning-600" : "text-danger-600");

const btn = "inline-flex items-center gap-2 border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-50";
const strip = "bg-neutral-50 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-600";

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`border border-neutral-200 bg-white ${className}`}>
      <h2 className={strip}>{title}</h2>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-neutral-100 py-2 text-sm last:border-b-0">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right font-semibold text-neutral-900">{children}</dd>
    </div>
  );
}

export default function PackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const money = useMoney();
  const { data: pkg, isLoading, isError, error } = usePackageDetail(id);
  const [confirm, setConfirm] = useState<"delete" | "publish" | null>(null);
  const [shown, setShown] = useState(0);

  const refresh = () => {
    setTimeout(() => void qc.invalidateQueries({ queryKey: ["agency", "package-activity"] }), 900); // the bell shows who just did this (written just after the response)
    void qc.invalidateQueries({ queryKey: ["agency", "package", id] });
    void qc.invalidateQueries({ queryKey: ["agency", "packages"] });
    void qc.invalidateQueries({ queryKey: ["agency", "summary"] });
  };

  const act = useMutation({
    mutationFn: async (kind: "delete" | "publish" | "restore") => {
      if (kind === "restore") return void (await restorePackage(id));
      if (kind === "delete") return void (await (pkg?.status === "ARCHIVED" ? deletePackagePermanently(id) : archivePackage(id)));
      if (kind === "publish") return void (await publishPackage(id));
      return undefined;
    },
    onSuccess: (_res, kind) => {
      setConfirm(null);
      refresh();
      if (kind === "delete" && pkg?.status === "ARCHIVED") {
        toast.success(`“${pkg.title}” was permanently deleted`);
        router.replace("/dashboard/packages");
      } else toast.success(kind === "restore" ? `“${pkg?.title}” was restored as a draft — review it, then publish` : kind === "delete" ? `“${pkg?.title}” was deleted — you can still find it under Archived` : `“${pkg?.title}” is now published`);
    },
    onError: (e) => {
      setConfirm(null);
      toast.error((e as unknown as ApiError).message || "That didn't work — please try again.", { duration: 6000 });
    },
  });

  if (isLoading) return <div className="mx-auto h-48 max-w-6xl animate-pulse border border-neutral-200 bg-white" />;
  if (isError || !pkg) {
    const notFound = (error as unknown as ApiError | undefined)?.status === 404;
    return (
      <div className="mx-auto max-w-6xl space-y-3 border border-neutral-200 bg-white p-6">
        <p className="text-sm text-neutral-700">{notFound ? "This package doesn't exist (or belongs to another agency)." : "Couldn't load this package."}</p>
        <Link href="/dashboard/packages" className="text-sm font-semibold text-primary-700 hover:underline">← Back to packages</Link>
      </div>
    );
  }

  const price = Number(pkg.pricePerPerson);
  const departure = pkg.departureDates[0];
  const left = departure ? daysUntil(departure.startDate) : null;
  const where = [pkg.destination, ...pkg.destinations.map((d) => d.name)].filter(Boolean).join(", ");
  const photos = pkg.photos ?? [];
  const subline = [pkg.category, where, pkg.region].filter(Boolean).join(" · ");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 py-2 sm:py-4">
      <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link>
            <span className="text-neutral-300">/</span>
            <Link href="/dashboard/packages" className="hover:text-neutral-900">Packages</Link>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-primary-900">Details</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900">{pkg.title}</h1>
            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[pkg.status]}`}>{pkg.status.toLowerCase()}</span>
            {pkg.isFeatured && <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">featured</span>}
          </div>
          {subline && <p className="mt-1 text-sm text-neutral-500">{subline}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/packages/${pkg.id}/edit`} className={btn}><Pencil className="h-4 w-4" /> Edit</Link>
          {pkg.status === "DRAFT" && <button type="button" disabled={act.isPending} onClick={() => setConfirm("publish")} className="inline-flex items-center gap-2 bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50"><Send className="h-4 w-4" /> Publish</button>}
          {pkg.status === "ARCHIVED" && <button type="button" disabled={act.isPending} onClick={() => act.mutate("restore")} className="inline-flex items-center gap-2 bg-success-600 px-4 py-2 text-sm font-semibold text-white hover:bg-success-700 disabled:opacity-50"><RotateCcw className="h-4 w-4" /> Restore as draft</button>}
          <button type="button" disabled={act.isPending} onClick={() => setConfirm("delete")} className="inline-flex items-center gap-2 bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50"><Trash2 className="h-4 w-4" /> Delete</button>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {photos.length > 0 && (
            <section className="border border-neutral-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos[shown] ?? photos[0]} alt={`${pkg.title} photo ${shown + 1}`} className="aspect-[16/8] w-full object-cover" />
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3" role="group" aria-label="Photos">
                  {photos.map((u, i) => (
                    <button key={u} type="button" aria-label={`Show photo ${i + 1}`} aria-pressed={i === shown} onClick={() => setShown(i)} className={`h-16 w-24 shrink-0 border-2 ${i === shown ? "border-primary-900" : "border-transparent"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          <Panel title="About this package">
            {pkg.shortSummary && <p className="mb-3 text-sm font-semibold text-neutral-900">{pkg.shortSummary}</p>}
            {pkg.description ? <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-700">{pkg.description}</p> : <p className="text-sm text-neutral-500">No description yet.</p>}
            {((pkg.activities?.length ?? 0) > 0 || (pkg.routes?.length ?? 0) > 0) && (
              <div className="mt-4 grid gap-4 border-t border-neutral-100 pt-4 sm:grid-cols-2">
                {(pkg.activities?.length ?? 0) > 0 && <div><p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Activities</p><div className="mt-2 flex flex-wrap gap-1.5">{pkg.activities!.map((a) => <span key={a} className="border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700">{a}</span>)}</div></div>}
                {(pkg.routes?.length ?? 0) > 0 && <div><p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Routes &amp; trails</p><div className="mt-2 flex flex-wrap gap-1.5">{pkg.routes!.map((r) => <span key={r} className="border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700">{r}</span>)}</div></div>}
              </div>
            )}
          </Panel>

          <Panel title={`Itinerary${pkg.itineraries.length ? ` · ${pkg.itineraries.length} day${pkg.itineraries.length === 1 ? "" : "s"}` : ""}`}>
            {pkg.itineraries.length === 0 ? <p className="text-sm text-neutral-500">No itinerary yet.</p> : (
              <ol className="space-y-4">
                {pkg.itineraries.map((d) => (
                  <li key={d.id} className="flex gap-4 text-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-primary-900 text-xs font-bold text-white">{d.dayNumber}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-neutral-900">{d.location || `Day ${d.dayNumber}`}{d.altitudeM ? <span className="ml-2 font-normal text-neutral-500">{d.altitudeM.toLocaleString()} m</span> : null}</p>
                      {d.description && <p className="mt-0.5 whitespace-pre-wrap text-neutral-600">{d.description}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Overview">
            <dl>
              <Fact label="Price">{money(price, pkg.currency)}</Fact>
              <Fact label="Duration">{pkg.durationDays} days{pkg.minDurationDays || pkg.maxDurationDays ? <span className="block text-xs font-normal text-neutral-500">flexible {[pkg.minDurationDays, pkg.maxDurationDays].filter(Boolean).join("–")} days</span> : null}</Fact>
              <Fact label="Difficulty">{DIFFICULTY_LABEL[pkg.difficulty]}</Fact>
              <Fact label="Max group size">{pkg.maxGroupSize}</Fact>
              {pkg.category && <Fact label="Category">{pkg.category}</Fact>}
              {where && <Fact label="Destination">{where}</Fact>}
              {pkg.region && <Fact label="Region">{pkg.region}</Fact>}
              {pkg.bestTimeToVisit && <Fact label="Best time to visit">{pkg.bestTimeToVisit}</Fact>}
              {(pkg.altitudeMinM != null || pkg.altitudeMaxM != null) && <Fact label="Altitude">{[pkg.altitudeMinM, pkg.altitudeMaxM].filter((v) => v != null).map((v) => `${Number(v).toLocaleString()} m`).join(" – ")}</Fact>}
              <Fact label="Featured">{pkg.isFeatured ? "Yes" : "No"}</Fact>
              <Fact label="Created">{new Date(pkg.createdAt).toLocaleDateString("en-GB")}</Fact>
              <Fact label="Last updated">{new Date(pkg.updatedAt).toLocaleDateString("en-GB")}</Fact>
            </dl>
          </Panel>

          <Panel title="Departure date">
            {!departure ? <p className="text-sm text-neutral-500">No departure date yet — publishing needs one.</p> : (
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 font-semibold text-neutral-900"><CalendarDays className="h-4 w-4 text-neutral-500" />{fmt(departure.startDate)}</p>
                {left !== null && (left >= 0
                  ? <p className={`text-xs font-semibold ${leftTone(left)}`}>{left === 0 ? "Departs today" : `${left} ${left === 1 ? "day" : "days"} left`}</p>
                  : <p className="text-xs font-semibold text-neutral-500">Departed {Math.abs(left)} {Math.abs(left) === 1 ? "day" : "days"} ago — this package is archived automatically.</p>)}
                <p className="text-neutral-600">{departure.bookedSlots} of {departure.maxSlots} seats booked · {seatsLeft(departure)} open</p>
              </div>
            )}
          </Panel>

          {(pkg.volumeDiscounts?.length ?? 0) > 0 && (
            <Panel title="Group discounts">
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500"><tr><th className="pb-2">Group</th><th className="pb-2">Off</th><th className="pb-2 text-right">Per person</th></tr></thead>
                <tbody>
                  {pkg.volumeDiscounts!.map((t) => (
                    <tr key={t.minPeople} className="border-t border-neutral-100"><td className="py-2">{t.minPeople}+ people</td><td className="py-2">{t.percentOff}%</td><td className="py-2 text-right font-semibold">{money(discountedPerPerson(price, pkg.volumeDiscounts, t.minPeople), pkg.currency)}</td></tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}

          <Panel title="Add-ons">
            {pkg.addOns.length === 0 ? <p className="text-sm text-neutral-500">No add-ons.</p> : (
              <ul className="divide-y divide-neutral-100 text-sm">
                {pkg.addOns.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"><span className="text-neutral-800">{a.name}</span><span className="font-semibold text-neutral-900">{money(Number(a.price), pkg.currency)}<span className="font-normal text-neutral-500">{a.perPerson ? " / person" : ""}</span></span></li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <Modal isOpen={confirm !== null} onClose={() => setConfirm(null)} title={confirm === "delete" ? (pkg.status === "ARCHIVED" ? "Delete permanently?" : "Delete this package?") : "Publish this package?"} size="sm">
        <div className="space-y-4 p-4">
          <p className="text-sm leading-6 text-neutral-600">
            {confirm === "delete"
              ? pkg.status === "ARCHIVED"
                ? "This removes it for good and can't be undone. (A package that has bookings can't be deleted — it stays archived.)"
                : "It is removed from your site and the marketplace and moved to Archived. Existing bookings are kept."
              : "It goes live on your site and the marketplace. It needs a description, a price, at least one itinerary day and a departure date."}
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setConfirm(null)} className={btn}>Cancel</button>
            <button type="button" disabled={act.isPending} onClick={() => confirm && act.mutate(confirm)} className={`px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${confirm === "delete" ? "bg-danger-600 hover:bg-danger-700" : "bg-primary-900 hover:bg-primary-800"}`}>
              {act.isPending ? "Working…" : confirm === "delete" ? "Delete" : "Publish"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
