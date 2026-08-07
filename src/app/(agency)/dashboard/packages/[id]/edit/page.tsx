"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// MUI Icons
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";

export interface PackageItem {
  id: string;
  title: string;
  destination: string;
  difficulty: string;
  duration: number;
  maxGroup: number;
  basePrice: number;
  currency: string;
  status: "Published" | "Draft" | "Archived";
  createdAt?: string;
}

// Initial Mock Data matching your dashboard image
const mockPackages: PackageItem[] = [
  {
    id: "pkg-1",
    title: "Tansen Heritage Hiking Tour",
    destination: "Tansen",
    duration: 6,
    difficulty: "Easy-Moderate",
    basePrice: 55860,
    currency: "Rs.",
    maxGroup: 14,
    status: "Draft",
    createdAt: "2026-10-22",
  },
  {
    id: "pkg-2",
    title: "Classic Everest Base Camp Trek",
    destination: "Everest Region",
    duration: 14,
    difficulty: "Moderate",
    basePrice: 192850,
    currency: "Rs.",
    maxGroup: 12,
    status: "Published",
    createdAt: "2026-10-05",
  },
  {
    id: "pkg-3",
    title: "Everest Panorama Short Trek",
    destination: "Everest Region",
    duration: 9,
    difficulty: "Moderate",
    basePrice: 109060,
    currency: "Rs.",
    maxGroup: 10,
    status: "Draft",
    createdAt: "2026-09-18",
  },
  {
    id: "pkg-4",
    title: "Mardi Himal Forest Escape",
    destination: "Mardi Himal",
    duration: 5,
    difficulty: "Easy-Moderate",
    basePrice: 46550,
    currency: "Rs.",
    maxGroup: 20,
    status: "Published",
    createdAt: "2026-09-02",
  },
];

export default function AgencyPackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");

  // Load packages from LocalStorage or fall back to mock data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("packages");

      if (stored) {
        try {
          const parsed = JSON.parse(stored);

          if (Array.isArray(parsed) && parsed.length > 0) {
            setPackages(parsed);
            return;
          }
        } catch (e) {
          console.error("Error reading packages from storage:", e);
        }
      }

      // Fallback if local storage is empty
      setPackages(mockPackages);
      localStorage.setItem("packages", JSON.stringify(mockPackages));
    }
  }, []);

  // Handle Delete
  const handleDeletePackage = (id: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      const updated = packages.filter((p) => String(p.id) !== String(id));
      setPackages(updated);
      localStorage.setItem("packages", JSON.stringify(updated));
    }
  };

  // Status counters
  const publishedCount = packages.filter(
    (p) => p.status?.toLowerCase() === "published",
  ).length;
  const draftCount = packages.filter(
    (p) => p.status?.toLowerCase() === "draft",
  ).length;
  const archivedCount = packages.filter(
    (p) => p.status?.toLowerCase() === "archived",
  ).length;

  // Filter & Search logic
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.destination.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      pkg.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-white min-h-screen">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            Packages
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Agency Packages
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage package listings from JSON data in a clean dashboard layout.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 text-xs font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <FileDownloadIcon fontSize="small" />
            Import
          </button>

          <Link href="/dashboard/packages/new">
            <button
              type="button"
              className="px-4 py-2 text-xs font-semibold text-white bg-black hover:bg-gray-800 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <AddIcon fontSize="small" />
              Create Package
            </button>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <SearchIcon fontSize="small" />
          </div>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50"
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            className="text-xs border border-gray-200 bg-white rounded-xl px-3 py-2 text-gray-700 focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            className="text-xs border border-gray-200 bg-white rounded-xl px-3 py-2 text-gray-700 focus:outline-none"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
            <option value="PriceHigh">Price: High to Low</option>
            <option value="PriceLow">Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Quick Category Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <button
          onClick={() => setStatusFilter("All")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
            statusFilter === "All"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
          <span className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded-full">
            {packages.length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter("Published")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
            statusFilter === "Published"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Published
          <span className="px-1.5 py-0.5 text-[10px] bg-gray-200 text-gray-700 rounded-full">
            {publishedCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter("Draft")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
            statusFilter === "Draft"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Draft
          <span className="px-1.5 py-0.5 text-[10px] bg-gray-200 text-gray-700 rounded-full">
            {draftCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter("Archived")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
            statusFilter === "Archived"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Archived
          <span className="px-1.5 py-0.5 text-[10px] bg-gray-200 text-gray-700 rounded-full">
            {archivedCount}
          </span>
        </button>
      </div>

      {/* Packages Table View */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-4">S.No</th>
              <th className="py-3 px-4">Package Name</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Difficulty</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Group Size</th>
              <th className="py-3 px-4">Start Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs">
            {filteredPackages.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="py-8 text-center text-gray-400 italic"
                >
                  No packages found matching your filters.
                </td>
              </tr>
            ) : (
              filteredPackages.map((pkg, idx) => (
                <tr
                  key={pkg.id || idx}
                  className="hover:bg-gray-50/80 transition-colors"
                >
                  <td className="py-4 px-4 font-bold text-gray-700">
                    {idx + 1}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-gray-900">
                      {pkg.title}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {pkg.destination}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {pkg.duration} days
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {pkg.difficulty || "Moderate"}
                  </td>
                  <td className="py-4 px-4 font-medium text-gray-800">
                    {pkg.currency || "Rs."} {pkg.basePrice?.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {pkg.maxGroup || "-"}
                  </td>
                  <td className="py-4 px-4 text-gray-500">
                    {pkg.createdAt || "N/A"}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                        pkg.status?.toLowerCase() === "published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {pkg.status?.toLowerCase() || "draft"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1">
                      {/* View Button */}
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/dashboard/packages/${pkg.id}`)
                        }
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Package Details"
                      >
                        <VisibilityIcon style={{ fontSize: "1.1rem" }} />
                      </button>

                      {/* Edit Button -> Navigates to Builder Form */}
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/dashboard/packages/${pkg.id}/edit`)
                        }
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Package"
                      >
                        <EditIcon style={{ fontSize: "1.1rem" }} />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Package"
                      >
                        <DeleteOutlineIcon style={{ fontSize: "1.1rem" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
