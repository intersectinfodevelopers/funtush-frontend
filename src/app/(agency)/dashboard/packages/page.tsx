"use client";

import { useState } from "react";
import Image from "next/image";
import packages from "../../../../../data/packages.json";

interface RawPackage {
  id: string;
  destination_slug: string;
  agency_id: string;
  title: string;
  duration_days: number;
  price_usd: number;
  group_size_max: number;
  included: string[];
  start_date: string;
}

interface Package extends RawPackage {
  destination: string;
  price_per_person: number;
  status: "published" | "draft" | "unlisted" | "archived";
  images: string[];
}

const packagesWithDefaults: Package[] = (packages as RawPackage[]).map((pkg) => ({
  ...pkg,
  destination: pkg.destination_slug.replace(/-/g, " "),
  price_per_person: pkg.price_usd,
  status: "published",
  images: [],
}));

export default function PackagesPage() {
  const agencyId = "ag-001";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredPackages = packagesWithDefaults.filter((pkg) => {
    return (
      pkg.agency_id === agencyId &&
      pkg.title.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "" || pkg.status === statusFilter)
    );
  });

  return (
    <div className="p-6">
      {/* Top Bar */}
      <div className="flex gap-4 mb-6">
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          New Package
        </button>

        <input
          type="text"
          placeholder="Search by title"
          className="border px-3 py-2 rounded flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="unlisted">Unlisted</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Empty State */}
      {filteredPackages.length === 0 ? (
        <div className="text-center p-10 text-gray-500">
          No packages yet — Create your first trek
        </div>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-800">
            <tr>
              <th className="border p-2">Thumbnail</th>
              <th className="border p-2">Title</th>
              <th className="border p-2">Destination</th>
              <th className="border p-2">Duration</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredPackages.map((pkg) => (
              <tr key={pkg.id}>
                <td className="border p-2">
                  <Image
                    src="/placeholder.png"
                    alt={pkg.title}
                    width={64}
                    height={64}
                  />
                </td>

                <td className="border p-2">{pkg.title}</td>

                <td className="border p-2">{pkg.destination}</td>

                <td className="border p-2">{pkg.duration_days} days</td>

                <td className="border p-2">${pkg.price_per_person}</td>

                <td className="border p-2">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      pkg.status === "published"
                        ? "bg-green-500"
                        : pkg.status === "draft"
                          ? "bg-gray-500"
                          : pkg.status === "unlisted"
                            ? "bg-blue-500"
                            : "bg-red-500"
                    }`}
                  >
                    {pkg.status}
                  </span>
                </td>

                <td className="border p-2">
                  <button className="text-blue-600 mr-3">Edit</button>

                  <button className="text-red-600">Archive</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
