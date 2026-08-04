"use client";

import { useMemo, useState } from "react";
import {
  Add,
  DeleteOutlined,
  Download,
  EditOutlined,
  Search,
  VisibilityOutlined,
} from "@mui/icons-material";
import { Badge } from "@/components/ui/badge";
import packagesJson from "../../../../../data/packages.json";

interface RawPackage {
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
}

interface Package extends RawPackage {
  destination: string;
  price_npr: number;
}

const packageRows: Package[] = (packagesJson as RawPackage[]).map((pkg) => ({
  ...pkg,
  destination: pkg.destination_slug.replace(/-/g, " "),
  price_npr: Math.round(pkg.price_usd * 133),
}));

const statusTabs = [
  { label: "All", value: "" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
];

const difficultyForDuration = (days: number) => {
  if (days >= 14) return "Moderate";
  if (days >= 12) return "Challenging";
  if (days >= 9) return "Moderate";
  return "Easy-Moderate";
};

const statusBadgeVariant = (status: Package["status"]) => {
  switch (status) {
    case "published":
      return "active";
    case "draft":
      return "draft";
    case "unlisted":
      return "trial";
    case "archived":
      return "suspended";
  }
};

const formatNpr = (value: number) => `Rs. ${value.toLocaleString("en-IN")}`;

export default function PackagesPage() {
  const agencyId = "ag-001";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Package["status"] | "">("");
  const [sortBy, setSortBy] = useState<"latest" | "price" | "duration">("latest");

  const agencyPackages = useMemo(
    () => packageRows.filter((pkg) => pkg.agency_id === agencyId),
    [agencyId]
  );

  const filteredPackages = useMemo(() => {
    return agencyPackages
      .filter((pkg) => pkg.title.toLowerCase().includes(search.toLowerCase()))
      .filter((pkg) => (statusFilter === "" ? true : pkg.status === statusFilter))
      .sort((a, b) => {
        if (sortBy === "price") return a.price_npr - b.price_npr;
        if (sortBy === "duration") return a.duration_days - b.duration_days;
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      });
  }, [agencyPackages, search, statusFilter, sortBy]);

  const statusCounts = useMemo(
    () =>
      statusTabs.reduce<Record<string, number>>((acc, tab) => {
        acc[tab.value] = agencyPackages.filter(
          (pkg) => (tab.value === "" ? true : pkg.status === tab.value)
        ).length;
        return acc;
      }, {}),
    [agencyPackages]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">Packages</p>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-neutral-900">Agency Packages</h1>
            <p className="text-sm leading-6 text-neutral-600">Manage package listings from JSON data in a clean dashboard layout.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 shadow-sm"
          >
            <Download className="h-4 w-4 text-current" />
            Import
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 shadow-sm"
          >
            <Add className="h-4 w-4 text-current" />
            Create Package
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="Search packages"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <select
          className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Package["status"] | "")}
        >
          <option value="">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="unlisted">Unlisted</option>
          <option value="archived">Archived</option>
        </select>

        <select
          className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "latest" | "price" | "duration")}
        >
          <option value="latest">Newest</option>
          <option value="price">Price low to high</option>
          <option value="duration">Duration</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setStatusFilter(tab.value as Package["status"] | "")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              statusFilter === tab.value
                ? "bg-indigo-600 text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            {tab.label}
            <span className="ml-2 inline-flex rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-neutral-900 shadow-sm">
              {statusCounts[tab.value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto border-t border-neutral-200 bg-white/90">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">S.NO</th>
              <th className="px-4 py-3">Package Name</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Difficulty</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Group Size</th>
              <th className="px-4 py-3">Start Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackages.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-neutral-500">
                  No packages found for this agency.
                </td>
              </tr>
            ) : (
              filteredPackages.map((pkg, index) => {
                const difficulty = difficultyForDuration(pkg.duration_days);
                const startDate = new Date(pkg.start_date).toLocaleDateString("en-GB");

                return (
                  <tr key={pkg.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                    <td className="px-4 py-3 font-semibold text-neutral-900">{index + 1}</td>
                    <td className="px-4 py-3 text-neutral-900">
                      <div className="font-semibold">{pkg.title}</div>
                      <div className="text-xs text-neutral-500">{pkg.destination}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{pkg.duration_days} days</td>
                    <td className="px-4 py-3 text-neutral-700">{difficulty}</td>
                    <td className="px-4 py-3 text-neutral-900">{formatNpr(pkg.price_npr)}</td>
                    <td className="px-4 py-3 text-neutral-700">{pkg.group_size_max}</td>
                    <td className="px-4 py-3 text-neutral-700">{startDate}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeVariant(pkg.status)}>{pkg.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200">
                          <VisibilityOutlined className="h-4 w-4" />
                        </button>
                        <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200">
                          <EditOutlined className="h-4 w-4" />
                        </button>
                        <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200">
                          <DeleteOutlined className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
