"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import destinationsJson from "@/../data/destinations.json";

type Destination = {
  id: string;
  slug?: string;
  title?: string;
  region?: string;
  difficulty?: string;
  maxAltitude?: string;
  bestSeason?: string;
  featured?: boolean;
};

export default function DestinationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);

  // Read localStorage and set state asynchronously to avoid synchronous setState in effect.
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem("destinations") : null;
        const list = stored ? (JSON.parse(stored) as Destination[]) : (destinationsJson as Destination[]);
        const found = list.find((d) => d.id === id) ?? null;
        setDestination(found);
      } catch {
        setDestination(null);
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(t);
  }, [id]);

  return (
    <div className="mx-auto w-full max-w-6xl py-2 sm:py-4">
      <div className="mb-7 flex flex-col gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <button type="button" onClick={() => router.push("/dashboard")} className="transition hover:text-neutral-900">Dashboard</button>
            <span className="text-neutral-300">/</span>
            <button type="button" onClick={() => router.push("/dashboard/destinations")} className="transition hover:text-neutral-900">Destinations</button>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-primary-900">Destination details</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Destination details</h1>
          <p className="mt-1 text-sm text-neutral-600">Review and manage destination information.</p>
        </div>
        <div className="hidden sm:block" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-gray-500 animate-pulse">Loading destination...</div>
        </div>
      ) : !destination ? (
        <div className="p-6 text-sm text-neutral-500">Destination not found.</div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link href="/dashboard/destinations" className="text-sm font-medium text-primary-900 hover:underline">← Back to destinations</Link>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">Destination details</p>
              <h2 className="mt-1 text-2xl font-semibold text-neutral-900">{destination.title}</h2>
              <p className="mt-1 text-sm capitalize text-neutral-600">{destination.region}</p>
            </div>
            <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${destination.featured ? 'border-success-200 bg-success-50 text-success-700' : 'border-neutral-200 bg-neutral-100 text-neutral-700'}`}>
              {destination.featured ? 'featured' : 'not featured'}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Region", destination.region ?? "-"],
              ["Difficulty", destination.difficulty ?? "-"],
              ["Max altitude", destination.maxAltitude ?? "-"],
              ["Best season", destination.bestSeason ?? "-"],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{label}</p>
                <p className="mt-2 text-lg font-semibold text-neutral-900">{value}</p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Difficulty</p>
                <p className="mt-2 text-sm font-semibold text-neutral-900">{destination.difficulty}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Best season</p>
                <p className="mt-2 text-sm font-semibold text-neutral-900">{destination.bestSeason}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => router.push(`/dashboard/destinations/${destination.id}/edit`)}
                className="rounded-2xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
              >
                Edit destination
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
