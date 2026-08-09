"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import packagesJson from "../../../../../../data/packages.json";

type Package = {
  id: string;
  title: string;
  destination_slug: string;
  agency_id: string;
  duration_days: number;
  price_usd: number;
  group_size_max: number;
  included: string[];
  start_date: string;
  status: "published" | "draft" | "unlisted" | "archived";
  difficulty: string;
  available_slots: number;
};

const statusStyles: Record<Package["status"], string> = {
  published: "border-success-200 bg-success-50 text-success-700",
  draft: "border-warning-200 bg-warning-50 text-warning-700",
  unlisted: "border-neutral-200 bg-neutral-100 text-neutral-700",
  archived: "border-danger-200 bg-danger-50 text-danger-700",
};

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [packageData, setPackageData] = useState<Package | null>(null);

  useEffect(() => {
    const loadPackage = () => {
      const stored = localStorage.getItem("packages");
      const allPackages = stored
        ? (JSON.parse(stored) as Package[])
        : (packagesJson as Package[]);

      setPackageData(allPackages.find((item) => item.id === id) ?? null);
    };

    const timer = window.setTimeout(loadPackage, 0);

    return () => window.clearTimeout(timer);
  }, [id]);

  if (!packageData) {
    return (
      <div className="p-6 text-sm text-neutral-500">Package not found.</div>
    );
  }

  const destination = packageData.destination_slug.replace(/-/g, " ");
  const price = Math.round(packageData.price_usd * 133).toLocaleString("en-IN");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/packages"
            className="text-sm font-medium text-primary-900 hover:underline"
          >
            ← Back to packages
          </Link>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
            Package details
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-900">
            {packageData.title}
          </h1>
          <p className="mt-1 text-sm capitalize text-neutral-600">
            {destination}
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[packageData.status]}`}
        >
          {packageData.status}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Duration", `${packageData.duration_days} days`],
          ["Price", `Rs. ${price}`],
          ["Group size", `${packageData.group_size_max} people`],
          ["Available slots", String(packageData.available_slots)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              {label}
            </p>
            <p className="mt-2 text-lg font-semibold text-neutral-900">
              {value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Difficulty
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">
              {packageData.difficulty}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Next start date
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">
              {packageData.start_date}
            </p>
          </div>
        </div>
        <div className="mt-5 border-t border-neutral-200 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Included
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {packageData.included.map((item) => (
              <span
                key={item}
                className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-sm text-primary-900"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() =>
              router.push(`/dashboard/packages/${packageData.id}/edit`)
            }
            className="rounded-2xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
          >
            Edit package
          </button>
        </div>
      </section>
    </div>
  );
}
