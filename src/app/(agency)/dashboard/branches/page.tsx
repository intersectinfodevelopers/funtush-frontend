"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  ChevronRight,
  MapPin,
  Plus,
  UserRound,
  Search,
  Trash2,
  Edit,
  Eye,
  XCircle,
  Building2,
} from "lucide-react";

import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { useBranches, type Branch } from "@/hooks/useBranches";
import { useStaff } from "@/hooks/useStaff";
import { Pagination } from "@/components/ui/pagination";

export default function BranchesPage() {


  const { branches } = useBranches();
  const { staff } = useStaff();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [sortBy, setSortBy] = useState<
    "newest" | "name" | "phone"
  >("newest");

  const [selectedBranch, setSelectedBranch] =
    useState<Branch | null>(null);

  const [deleteDialog, setDeleteDialog] = useState<{
    branch: Branch;
  } | null>(null);

  const manager = (id: string) =>
    staff.find((person) => person.id === id)?.name ??
    "Unassigned";

  /*
   * Filter and sort branches
   */
  const filteredBranches = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const matches = branches.filter(
      (branch) =>
        branch.name.toLowerCase().includes(query) ||
        branch.address.toLowerCase().includes(query) ||
        branch.phone.toLowerCase().includes(query) ||
        manager(branch.managerId)
          .toLowerCase()
          .includes(query),
    );

    const sorted = [...matches];

    if (sortBy === "name") {
      sorted.sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    } else if (sortBy === "phone") {
      sorted.sort((a, b) =>
        a.phone.localeCompare(b.phone),
      );
    } else {
      sorted.sort((a, b) => {
        const timeA =
          Number(a.id.split("-").pop()) || 0;

        const timeB =
          Number(b.id.split("-").pop()) || 0;

        return timeB - timeA;
      });
    }

    return sorted;
  }, [branches, searchTerm, sortBy, staff, manager]);

  /*
   * Pagination
   */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBranches.length / 6),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const pageItems = filteredBranches.slice(
    (safeCurrentPage - 1) * 6,
    safeCurrentPage * 6,
  );

  /*
   * Branch statistics
   */
  const stats = useMemo(
    () => ({
      total: branches.length,

      assigned: branches.filter(
        (branch) => branch.managerId,
      ).length,

      unassigned: branches.filter(
        (branch) => !branch.managerId,
      ).length,
    }),
    [branches],
  );

  /*
   * Delete branch
   */
  const handleDeleteBranch = (id: string) => {
    const branch = branches.find(
      (item) => item.id === id,
    );

    if (branch) {
      setDeleteDialog({ branch });
    }
  };

  const confirmDeleteBranch = () => {
    if (!deleteDialog) return;

    try {
      const STORAGE_KEY = "agency-branches";

      const updated = branches.filter(
        (item) =>
          item.id !== deleteDialog.branch.id,
      );

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated),
      );

      window.location.reload();
    } catch {
      // Ignore localStorage errors
    }

    setDeleteDialog(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Link
              href="/dashboard"
              className="hover:text-neutral-900"
            >
              Dashboard
            </Link>

            <ChevronRight size={15} />

            <strong className="text-primary-900">
              Branches
            </strong>
          </div>

          <h1 className="mt-2 text-2xl font-bold text-neutral-900">
            Branches
          </h1>

          <p className="mt-1 text-sm text-neutral-600">
            Manage the locations your agency operates
            from.
          </p>
        </div>

        <Link
          href="/dashboard/branches/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
        >
          <Plus size={18} />
          New branch
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AnalyticsSummaryCard
          label="Total Branches"
          value={stats.total}
          tone="primary"
          icon={Building2}
        />

        <AnalyticsSummaryCard
          label="Assigned Managers"
          value={stats.assigned}
          tone="success"
          icon={UserRound}
        />

        <AnalyticsSummaryCard
          label="Unassigned"
          value={stats.unassigned}
          tone="warning"
          icon={XCircle}
        />
      </div>

      {/* Search and Sort */}
      <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_180px]">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search branches..."
            className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <select
          value={sortBy}
          onChange={(event) => {
            setSortBy(
              event.target.value as
              | "newest"
              | "name"
              | "phone",
            );

            setCurrentPage(1);
          }}
          className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          <option value="newest">Newest</option>
          <option value="name">Name A–Z</option>
          <option value="phone">Phone</option>
        </select>
      </div>

      {/* Branch Cards */}
      {/* Branch Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Branch
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Address
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Phone
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Manager
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {pageItems.map((branch) => (
                <tr
                  key={branch.id}
                  className="transition hover:bg-neutral-50"
                >
                  {/* Branch */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">


                      <div>
                        <p className="font-semibold text-neutral-900">
                          {branch.name}
                        </p>

                        <p className="mt-0.5 text-xs text-neutral-500">
                          Branch
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Address */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-700">

                      <span>{branch.address}</span>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-700">

                      <span>{branch.phone || "—"}</span>
                    </div>
                  </td>

                  {/* Manager */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">


                      <span className="text-sm font-medium text-neutral-900">
                        {manager(branch.managerId)}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {/* Preview */}
                      <button
                        type="button"
                        title="Preview"
                        onClick={() => setSelectedBranch(branch)}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Edit */}
                      <Link
                        href={`/dashboard/branches/${branch.id}`}
                        title="Edit"
                        className="grid h-8 w-8 place-items-center rounded-lg bg-warning-50 text-warning-700 hover:bg-warning-100"
                      >
                        <Edit size={16} />
                      </Link>

                      {/* Delete */}
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => handleDeleteBranch(branch.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-danger-50 text-danger-700 hover:bg-danger-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {pageItems.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
          <Building2
            size={36}
            className="mb-3 text-neutral-300"
          />

          <h3 className="text-lg font-semibold text-neutral-900">
            No branches found
          </h3>

          <p className="mt-1 max-w-md text-sm text-neutral-500">
            {searchTerm
              ? "Try another keyword or clear the search."
              : "Create your first branch location to get started."}
          </p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Delete Dialog */}
      {deleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-neutral-900">
              Delete branch?
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Remove{" "}
              {deleteDialog.branch.name}{" "}
              from the branch directory?
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setDeleteDialog(null)
                }
                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteBranch}
                className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700"
              >
                Delete branch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      {selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Preview
                </p>

                <h2 className="mt-1 text-xl font-bold text-neutral-900">
                  {selectedBranch.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedBranch(null)
                }
                className="rounded-lg border border-neutral-200 p-2 text-neutral-500 hover:text-neutral-700"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Address */}
              <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                  <MapPin
                    size={16}
                    className="shrink-0 text-neutral-400"
                  />

                  <span>
                    {selectedBranch.address}
                  </span>
                </div>
              </div>

              {/* Phone and Manager */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Phone
                  </p>

                  <p className="mt-1 text-sm font-medium text-neutral-900">
                    {selectedBranch.phone}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Manager
                  </p>

                  <p className="mt-1 text-sm font-medium text-neutral-900">
                    {manager(
                      selectedBranch.managerId,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}