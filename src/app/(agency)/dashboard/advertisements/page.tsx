"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Add,
  DeleteOutlined,
  EditOutlined,
  Search,
  VisibilityOutlined,
} from "@mui/icons-material";
import { BarChart3, CheckCircle2, Eye, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import adsData from "../../../../../data/advertisements.json";

type Ad = (typeof adsData)[number];

const statusTabs = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
];

const statusBadgeVariant = (status: Ad["status"]) => {
  switch (status) {
    case "active":
      return "active";
    case "paused":
      return "suspended";
    default:
      return "draft";
  }
};

export default function AdvertisementsPage() {
  const router = useRouter();

  const [ads, setAds] = useState<Ad[]>(adsData.map((ad) => ({ ...ad })));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  const [deleteDialog, setDeleteDialog] = useState<Ad | null>(null);

  const filteredAds = useMemo(() => {
    const query = search.trim().toLowerCase();

    return ads
      .filter((ad) => {
        const matchesSearch =
          !query ||
          ad.title.toLowerCase().includes(query) ||
          ad.position.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "all" || ad.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [ads, search, statusFilter]);

  const totalAds = ads.length;

  const activeAds = ads.filter((ad) => ad.status === "active").length;

  const pausedAds = ads.filter((ad) => ad.status === "paused").length;

  const totalClicks = ads.reduce((total, ad) => total + ad.clicks, 0);

  const totalImpressions = ads.reduce((total, ad) => total + ad.impressions, 0);

  const statusCounts = useMemo(
    () => ({
      all: totalAds,
      active: activeAds,
      paused: pausedAds,
    }),
    [totalAds, activeAds, pausedAds],
  );

  const adsPerPage = 8;

  const totalPages = Math.max(1, Math.ceil(filteredAds.length / adsPerPage));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedAds = filteredAds.slice(
    (safeCurrentPage - 1) * adsPerPage,
    safeCurrentPage * adsPerPage,
  );

  const handleDelete = () => {
    if (!deleteDialog) return;

    const nextAds = ads.filter((ad) => ad.id !== deleteDialog.id);

    setAds(nextAds);
    setDeleteDialog(null);

    if (paginatedAds.length === 1 && safeCurrentPage > 1) {
      setCurrentPage(safeCurrentPage - 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
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

            <span className="font-semibold text-neutral-900">
              Advertisements
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-neutral-900">
            Manage Advertisements
          </h1>

          <p className="text-sm leading-6 text-neutral-600">
            Manage site advertisements and placements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/advertisements/new")}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary-900 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-800"
        >
          <Add className="h-4 w-4" />
          Add Advertisement
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsSummaryCard
          label="Total Advertisements"
          value={totalAds}
          tone="primary"
          icon={Megaphone}
        />

        <AnalyticsSummaryCard
          label="Active"
          value={activeAds}
          tone="success"
          icon={CheckCircle2}
        />

        <AnalyticsSummaryCard
          label="Total Clicks"
          value={totalClicks.toLocaleString()}
          tone="warning"
          icon={BarChart3}
        />

        <AnalyticsSummaryCard
          label="Total Impressions"
          value={totalImpressions.toLocaleString()}
          tone="accent"
          icon={Eye}
        />
      </div>

      {/* Search */}
      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

          <input
            type="text"
            className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            placeholder="Search advertisements"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />
        </label>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setCurrentPage(1);
          }}
          className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* Status Tabs */}
      <div className="overflow-x-auto border-b border-neutral-200">
        <div className="flex min-w-max items-center gap-5 sm:gap-8">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setStatusFilter(tab.value);
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition ${
                statusFilter === tab.value
                  ? "border-primary-900 text-primary-900"
                  : "border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
              }`}
            >
              {tab.label}

              <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">
                {statusCounts[tab.value as keyof typeof statusCounts] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border-t border-neutral-200 bg-white/90">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">S.NO</th>
              <th className="px-4 py-3">Advertisement</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Clicks</th>
              <th className="px-4 py-3">Impressions</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredAds.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-neutral-500"
                >
                  No advertisements found.
                </td>
              </tr>
            ) : (
              paginatedAds.map((ad, index) => (
                <tr
                  key={ad.id}
                  className="border-b border-neutral-200 hover:bg-neutral-50"
                >
                  {/* S.NO */}
                  <td className="px-4 py-3 font-semibold text-neutral-900">
                    {(safeCurrentPage - 1) * adsPerPage + index + 1}
                  </td>

                  {/* Advertisement */}
                  <td className="px-4 py-3 text-neutral-900">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-20 shrink-0 rounded-lg bg-neutral-100 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${ad.image})`,
                        }}
                      />

                      <div>
                        <div className="font-semibold">{ad.title}</div>

                        <div className="text-xs text-neutral-500">
                          {ad.startDate} → {ad.endDate}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Position */}
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                      {ad.position}
                    </span>
                  </td>

                  {/* Clicks */}
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs text-neutral-500">Clicks</p>

                      <p className="mt-1 font-semibold text-neutral-900">
                        {ad.clicks.toLocaleString()}
                      </p>
                    </div>
                  </td>

                  {/* Impressions */}
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs text-neutral-500">Impressions</p>

                      <p className="mt-1 font-semibold text-neutral-900">
                        {ad.impressions.toLocaleString()}
                      </p>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(ad.status)}>
                      {ad.status}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* View */}
                      <button
                        type="button"
                        aria-label={`View ${ad.title}`}
                        onClick={() => setSelectedAd(ad)}
                        className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition hover:bg-primary-100"
                      >
                        <VisibilityOutlined sx={{ fontSize: 18 }} />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        aria-label={`Edit ${ad.title}`}
                        onClick={() =>
                          router.push(`/dashboard/advertisements/${ad.id}/edit`)
                        }
                        className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-md bg-warning-50 text-warning-700 transition hover:bg-warning-100"
                      >
                        <EditOutlined sx={{ fontSize: 18 }} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        aria-label={`Delete ${ad.title}`}
                        onClick={() => setDeleteDialog(ad)}
                        className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-md bg-danger-50 text-danger-700 transition hover:bg-danger-100"
                      >
                        <DeleteOutlined sx={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* View Advertisement Dialog */}
      {selectedAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-neutral-900">
              Advertisement Details
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs text-neutral-500">Title</p>
                <p className="font-semibold text-neutral-900">
                  {selectedAd.title}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-500">Position</p>
                <p className="font-semibold text-neutral-900">
                  {selectedAd.position}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500">Clicks</p>
                  <p className="font-semibold text-neutral-900">
                    {selectedAd.clicks.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-neutral-500">Impressions</p>
                  <p className="font-semibold text-neutral-900">
                    {selectedAd.impressions.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500">Start Date</p>
                  <p className="font-semibold text-neutral-900">
                    {selectedAd.startDate}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-neutral-500">End Date</p>
                  <p className="font-semibold text-neutral-900">
                    {selectedAd.endDate}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-neutral-500">Status</p>

                <Badge variant={statusBadgeVariant(selectedAd.status)}>
                  {selectedAd.status}
                </Badge>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAd(null)}
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-neutral-900">
              Delete advertisement?
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              This will remove{" "}
              <span className="font-semibold text-neutral-900">
                {deleteDialog.title}
              </span>{" "}
              from the advertisement list. This action cannot be undone.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteDialog(null)}
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="rounded-2xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger-700"
              >
                Delete Advertisement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
