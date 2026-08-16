"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  BriefcaseBusiness,
  ChevronRight,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AnalyticsSummaryCard } from '@/components/shared/AnalyticsSummaryCard';
import { useRoles } from "@/hooks/useRoles";
import { useStaff } from "@/hooks/useStaff";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { DeleteOutlineOutlined, EditOutlined } from "@mui/icons-material";

export default function RolesPage() {
  const { roles, deleteRole } = useRoles();
  const { staff } = useStaff();
  const [roleToDelete, setRoleToDelete] = useState<
    (typeof roles)[number] | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Mark mounted asynchronously to avoid synchronous setState inside effect.
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const handleDelete = () => {
    if (!roleToDelete) return;
    deleteRole(roleToDelete.id);
    setRoleToDelete(null);
  };

  const rolesPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(roles.length / rolesPerPage));
  const paginatedRoles = roles.slice(
    (currentPage - 1) * rolesPerPage,
    currentPage * rolesPerPage,
  );

  return (
    <div className="space-y-4 w-full">
      <div className="mb-7 flex flex-col gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Link href="/dashboard">Dashboard</Link>
            <ChevronRight size={15} />
            <Link
              href="/dashboard/staff"
            >
              Staff &amp; Roles
            </Link>
            <ChevronRight size={15} />
            <strong className="text-primary-900">Roles</strong>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">
            Roles &amp; Permissions
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Create roles and control what each team member can access.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
          href="/dashboard/roles/new"
        >
          <Plus size={18} /> Create role
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <AnalyticsSummaryCard label="Active Roles" value={roles.length} tone="primary" icon={BriefcaseBusiness} />
        <AnalyticsSummaryCard label="Team Members" value={staff.length} tone="accent" icon={Users} />
        <AnalyticsSummaryCard
          label="Permissions"
          value={Array.from(new Set(roles.flatMap((r) => r.permissions || []))).length}
          tone="warning"
          icon={ShieldCheck}
        />
      </div>
      <div className="overflow-x-auto border-t border-neutral-200 bg-white/90">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Members</th>
              <th className="px-4 py-3">Permissions</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRoles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-500">No roles found.</td>
              </tr>
            ) : (
              paginatedRoles.map((role, idx) => {
                const members = staff.filter((member) => member.role === role.id);
                const summary =
                  role.permissions.length === 10
                    ? "Full access to all areas"
                    : role.permissions.length
                      ? role.permissions
                          .map((permission) => permission[0].toUpperCase() + permission.slice(1))
                          .join(" · ")
                      : "No permissions assigned";

                const serial = (currentPage - 1) * rolesPerPage + idx + 1;

                return (
                  <tr key={role.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                    <td className="px-4 py-3 text-neutral-700">{serial}</td>
                    <td className="px-4 py-3 text-neutral-900">
                      <div className="font-semibold">{role.name}</div>
                      <div className="text-xs text-neutral-500 mt-1">ID: {role.id}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{members.length}</td>
                    <td className="px-4 py-3 text-neutral-700">
                      <div className="text-sm">{mounted ? summary : "Loading permissions..."}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/roles/${role.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-warning-100 text-warning-600 hover:bg-warning-200"
                        >
                          <EditOutlined sx={{ fontSize: 16 }} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setRoleToDelete(role)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-danger-100 text-danger-500 transition hover:bg-danger-200"
                          aria-label={`Delete ${role.name}`}
                        >
                          <DeleteOutlineOutlined sx={{ fontSize: 16 }} />
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
      <div className="mt-4 w-full">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      <Modal
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        title="Delete Role"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Are you sure you want to delete this role{" "}
            <span className="font-semibold text-neutral-900">
              {roleToDelete?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setRoleToDelete(null)}
              className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-2xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger-700"
            >
              Delete role
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
