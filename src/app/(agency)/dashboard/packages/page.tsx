"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Add,
  DeleteOutlined,
  Download,
  EditOutlined,
  Search,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  BarChart3,
  CheckCircle2,
  Eye,
  Package as PackageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
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
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Package["status"] | "">("");
  const [sortBy, setSortBy] = useState<"latest" | "price" | "duration">(
    "latest",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [packages, setPackages] = useState<Package[]>(packageRows);
  const [actionDialog, setActionDialog] = useState<{
    type: "edit" | "delete";
    package: Package;
  } | null>(null);

  useEffect(() => {
    const loadPackages = () => {
      const stored = localStorage.getItem("packages");

      if (stored) {
        try {
          const storedPackages = JSON.parse(stored) as Array<
            Partial<Package> & {
              destination?: string;
              duration?: number;
              maxGroup?: number;
              basePrice?: number;
              dates?: Array<{ date: string; slots: number }>;
              addons?: Array<{ name: string }>;
            }
          >;

          setPackages(
            storedPackages.map((pkg) => {
              const destination =
                pkg.destination ??
                pkg.destination_slug?.replace(/-/g, " ") ??
                "";
              const duration = pkg.duration_days ?? pkg.duration ?? 0;
              const maxGroup = pkg.group_size_max ?? pkg.maxGroup ?? 0;
              const priceUsd =
                pkg.price_usd ?? (pkg.basePrice ? pkg.basePrice / 133 : 0);
              const firstDate = pkg.start_date ?? pkg.dates?.[0]?.date ?? "";

              return {
                ...pkg,
                id: pkg.id ?? `pkg-${Date.now()}`,
                title: pkg.title ?? "Untitled package",
                destination_slug:
                  pkg.destination_slug ?? destination.replace(/\s+/g, "-"),
                agency_id: pkg.agency_id ?? agencyId,
                duration_days: duration,
                price_usd: priceUsd,
                group_size_max: maxGroup,
                included:
                  pkg.included ?? pkg.addons?.map((addon) => addon.name) ?? [],
                start_date: firstDate,
                status: pkg.status ?? "draft",
                difficulty: pkg.difficulty ?? "Moderate",
                available_slots:
                  pkg.available_slots ?? pkg.dates?.[0]?.slots ?? 0,
                destination,
                price_npr: pkg.price_npr ?? Math.round(priceUsd * 133),
              };
            }),
          );
        } catch {
          localStorage.removeItem("packages");
        }
      }
    };

    const timer = window.setTimeout(loadPackages, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const agencyPackages = useMemo(
    () => packages.filter((pkg) => pkg.agency_id === agencyId),
    [agencyId, packages],
  );

  const filteredPackages = useMemo(() => {
    return agencyPackages
      .filter((pkg) => pkg.title.toLowerCase().includes(search.toLowerCase()))
      .filter((pkg) =>
        statusFilter === "" ? true : pkg.status === statusFilter,
      )
      .sort((a, b) => {
        if (sortBy === "price") return a.price_npr - b.price_npr;
        if (sortBy === "duration") return a.duration_days - b.duration_days;
        return (
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
      });
  }, [agencyPackages, search, statusFilter, sortBy]);

  const statusCounts = useMemo(
    () =>
      statusTabs.reduce<Record<string, number>>((acc, tab) => {
        acc[tab.value] = agencyPackages.filter((pkg) =>
          tab.value === "" ? true : pkg.status === tab.value,
        ).length;
        return acc;
      }, {}),
    [agencyPackages],
  );
  const publishedPackages = agencyPackages.filter(
    (pkg) => pkg.status === "published",
  ).length;
  const draftPackages = agencyPackages.filter(
    (pkg) => pkg.status === "draft",
  ).length;
  const packageValue = agencyPackages
    .reduce((total, pkg) => total + pkg.price_npr, 0)
    .toLocaleString("en-IN");

  const packagesPerPage = 8;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPackages.length / packagesPerPage),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortBy, packages.length]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedPackages = useMemo(() => {
    const startIndex = (currentPage - 1) * packagesPerPage;
    return filteredPackages.slice(startIndex, startIndex + packagesPerPage);
  }, [currentPage, filteredPackages]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="transition hover:text-neutral-900"
            >
              Dashboard
            </button>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">All Packages</span>
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Agency Packages
          </h1>
          <p className="text-sm leading-6 text-neutral-600">
            Manage package listings from JSON data in a clean dashboard layout.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            type="button"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-primary-200 bg-white px-3 py-2.5 text-sm font-semibold text-primary-900 shadow-sm transition hover:bg-primary-50 sm:w-auto"
          >
            <Download className="h-4 w-4 text-current" />
            Import
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary-900 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-800 sm:w-auto"
          >
            <Add className="h-4 w-4 text-current" />
            Create Package
          </button>
        </div>
      </div>

      <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsSummaryCard
          label="Total Packages"
          value={agencyPackages.length}
          tone="primary"
          icon={PackageIcon}
        />
        <AnalyticsSummaryCard
          label="Published"
          value={publishedPackages}
          tone="success"
          icon={CheckCircle2}
        />
        <AnalyticsSummaryCard
          label="Draft"
          value={draftPackages}
          tone="warning"
          icon={BarChart3}
        />
        <AnalyticsSummaryCard
          label="Total Value"
          value={`Rs. ${packageValue}`}
          tone="accent"
          icon={Eye}
        />
      </div>

      <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(240px,1fr)_180px_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            placeholder="Search packages"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <select
          className="min-h-11 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as Package["status"] | "")
          }
        >
          <option value="">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="unlisted">Unlisted</option>
          <option value="archived">Archived</option>
        </select>

        <select
          className="min-h-11 w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "latest" | "price" | "duration")
          }
        >
          <option value="latest">Newest</option>
          <option value="price">Price low to high</option>
          <option value="duration">Duration</option>
        </select>
      </div>

      <div className="w-full min-w-0 overflow-x-auto border-b border-neutral-200">
        <div className="flex min-w-max items-center gap-5 sm:gap-8">
          {statusTabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() =>
                setStatusFilter(tab.value as Package["status"] | "")
              }
              className={`inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition ${
                statusFilter === tab.value
                  ? "border-primary-900 text-primary-900"
                  : "border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
              }`}
            >
              {tab.label}
              <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">
                {statusCounts[tab.value] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full min-w-0 overflow-x-auto border-t border-neutral-200 bg-white/90">
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
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-sm text-neutral-500"
                >
                  No packages found for this agency.
                </td>
              </tr>
            ) : (
              paginatedPackages.map((pkg, index) => {
                const difficulty = difficultyForDuration(pkg.duration_days);
                const startDate = new Date(pkg.start_date).toLocaleDateString(
                  "en-GB",
                );

                return (
                  <tr
                    key={pkg.id}
                    className="border-b border-neutral-200 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-3 font-semibold text-neutral-900">
                      {(currentPage - 1) * packagesPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 text-neutral-900">
                      <div className="font-semibold">{pkg.title}</div>
                      <div className="text-xs text-neutral-500">
                        {pkg.destination}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {pkg.duration_days} days
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{difficulty}</td>
                    <td className="px-4 py-3 text-neutral-900">
                      {formatNpr(pkg.price_npr)}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {pkg.group_size_max}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{startDate}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeVariant(pkg.status)}>
                        {pkg.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`View ${pkg.title}`}
                          onClick={() =>
                            router.push(`/dashboard/packages/${pkg.id}`)
                          }
                          className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition hover:bg-primary-100"
                        >
                          <VisibilityOutlined sx={{ fontSize: 18 }} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Edit ${pkg.title}`}
                          onClick={() =>
                            setActionDialog({ type: "edit", package: pkg })
                          }
                          className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-md bg-warning-50 text-warning-700 transition hover:bg-warning-100"
                        >
                          <EditOutlined sx={{ fontSize: 18 }} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${pkg.title}`}
                          onClick={() =>
                            setActionDialog({ type: "delete", package: pkg })
                          }
                          className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-md bg-danger-50 text-danger-700 transition hover:bg-danger-100"
                        >
                          <DeleteOutlined sx={{ fontSize: 18 }} />
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {actionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-neutral-900">
              {actionDialog.type === "delete"
                ? "Delete package?"
                : "Edit package?"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {actionDialog.type === "delete"
                ? `This will remove ${actionDialog.package.title} from your package list. This action cannot be undone.`
                : `Open ${actionDialog.package.title} in the package editor?`}
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setActionDialog(null)}
                className="min-h-11 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (actionDialog.type === "edit") {
                    router.push(
                      `/dashboard/packages/${actionDialog.package.id}/edit`,
                    );
                  } else {
                    const nextPackages = packages.filter(
                      (pkg) => pkg.id !== actionDialog.package.id,
                    );
                    setPackages(nextPackages);
                    localStorage.setItem(
                      "packages",
                      JSON.stringify(nextPackages),
                    );
                  }
                  setActionDialog(null);
                }}
                className={`min-h-11 w-full rounded-2xl px-4 py-2 text-sm font-semibold text-white sm:w-auto ${
                  actionDialog.type === "delete"
                    ? "bg-danger-600 hover:bg-danger-700"
                    : "bg-primary-900 hover:bg-primary-800"
                }`}
              >
                {actionDialog.type === "delete"
                  ? "Delete package"
                  : "Continue to edit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
