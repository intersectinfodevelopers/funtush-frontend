"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BriefcaseBusiness,
  ChevronRight,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
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
    <div className="mx-auto w-full max-w-6xl py-2 sm:py-4">
      <div className="mb-7 flex flex-col gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Link href="/dashboard">Dashboard</Link>
            <ChevronRight size={15} />
            <Link
              href="/dashboard/staff"
              className="transition hover:text-primary-700 "
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
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
          href="/dashboard/roles/new"
        >
          <Plus size={18} /> Create role
        </Link>
      </div>
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-primary-100 bg-white px-3 py-2 text-sm text-neutral-600">
          <ShieldCheck className="text-primary-500" size={18} />
          <span>
            <strong className="text-neutral-900">{roles.length}</strong> active
            roles
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-primary-100 bg-white px-3 py-2 text-sm text-neutral-600">
          <Users className="text-primary-500" size={18} />
          <span>
            <strong className="text-neutral-900">{staff.length}</strong> team
            members
          </span>
        </div>
      </div>
      <section className="grid gap-5 md:grid-cols-2">
        {paginatedRoles.map((role) => {
          const members = staff.filter((member) => member.role === role.id);
          const summary =
            role.permissions.length === 10
              ? "Full access to all areas"
              : role.permissions.length
                ? role.permissions
                    .map(
                      (permission) =>
                        permission[0].toUpperCase() + permission.slice(1),
                    )
                    .join(" · ")
                : "No permissions assigned";
          return (
            <article
              className="flex gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
              key={role.id}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600">
                <BriefcaseBusiness size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-neutral-900">{role.name}</h2>
                <span className="mt-1 block text-xs text-neutral-500">
                  {members.length}{" "}
                  {members.length === 1 ? "staff member" : "staff members"}{" "}
                  using this role
                </span>
                <p className="mt-2 text-sm leading-5 text-neutral-600">
                  {summary}
                </p>
              </div>
              <div className="flex h-fit gap-2">
                <Link
                  href={`/dashboard/roles/${role.id}`}
                  className="rounded-md bg-warning-100 p-2 text-warning-600 hover:bg-warning-200"
                >
                  <EditOutlined sx={{ fontSize: 18 }} />
                </Link>
                <button
                  type="button"

                  onClick={() => setRoleToDelete(role)}
                  className="rounded-md bg-danger-100 p-2 text-danger-500 transition hover:bg-danger-200"
                  aria-label={`Delete ${role.name}`}
                >
                  <DeleteOutlineOutlined sx={{ fontSize: 18 }} /> 
                </button>
              </div>
            </article>
          );
        })}
      </section>
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
