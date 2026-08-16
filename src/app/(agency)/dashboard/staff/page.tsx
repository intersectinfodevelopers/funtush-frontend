"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Plus, ChevronRight } from "lucide-react";
import {
  DeleteOutlined,
  EditOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import StaffIdCard from "@/components/agency/staff/StaffIdCard";
import { useStaff } from "@/hooks/useStaff";
import { roleLabel, useRoles } from "@/hooks/useRoles";

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function StaffPage() {
  const router = useRouter();
  const { staff, toggleActive, deleteStaff, updateStaff } = useStaff();
  const { roles } = useRoles();
  const [viewStaff, setViewStaff] = useState<(typeof staff)[number] | null>(
    null,
  );
  const [editStaff, setEditStaff] = useState<(typeof staff)[number] | null>(
    null,
  );
  const [staffToDelete, setStaffToDelete] = useState<
    (typeof staff)[number] | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    active: true,
  });

  const openEditStaff = (member: (typeof staff)[number]) => {
    setEditStaff(member);
    setEditForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      active: member.active,
    });
  };

  const saveStaffChanges = () => {
    if (!editStaff) return;
    const name = editForm.name.trim();
    const email = editForm.email.trim();
    const phone = editForm.phone.trim();
    if (!name || !email || !editForm.role) {
      toast.error("Name, email, and role are required.");
      return;
    }
    try {
      updateStaff(editStaff.id, {
        name,
        email,
        phone,
        role: editForm.role,
        active: editForm.active,
      });
      toast.success("Staff member updated successfully.");
      setEditStaff(null);
    } catch {
      toast.error("Could not update the staff member. Please try again.");
    }
  };

  const removeStaff = () => {
    if (!staffToDelete) return;
    deleteStaff(staffToDelete.id);
    setStaffToDelete(null);
  };

  const staffPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(staff.length / staffPerPage));
  const paginatedStaff = staff.slice(
    (currentPage - 1) * staffPerPage,
    currentPage * staffPerPage,
  );

  return (
    <div className="space-y-4 w-full">
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Staff & Roles</h1>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Link href={"/dashboard/staff"}>Staff</Link>
            <span className="text-neutral-300">
              <ChevronRight size={15} />
            </span>
            <span className="font-semibold text-neutral-900">All Staff</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/roles/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-neutral-100 hover:bg-neutral-50"
          >
            <Plus size={25} strokeWidth={2.5} /> Create Role
          </Link>
          <Link
            href="/dashboard/staff/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
          >
            <Plus size={22} /> Add Staff
          </Link>
        </div>
      </div>

      <section className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-neutral-100">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">S.N</th>
              <th className="px-4 py-3">Staff Member</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Phone Number</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStaff.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-500">No staff found.</td>
              </tr>
            ) : (
              paginatedStaff.map((member, index) => (
                <tr key={member.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-700">{(currentPage - 1) * staffPerPage + index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-success-500 font-semibold text-white text-sm">
                        {initials(member.name)}
                      </span>
                      <span>
                        <strong className="block text-sm text-neutral-900">{member.name}</strong>
                        <small className="mt-1 block text-xs text-neutral-500">{member.email}</small>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-neutral-800">{roleLabel(member.role, roles)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-neutral-800">{member.phone || '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-warning-600">{member.email}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(member.id)}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${member.active ? 'bg-success-100 text-success-600' : 'bg-neutral-100 text-neutral-500'}`}
                    >
                      <Check size={14} className={`rounded-full p-0.5 ${member.active ? 'bg-success-400 text-white' : 'bg-neutral-400 text-white'}`} />
                      {member.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setViewStaff(member)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-100 text-primary-600 hover:bg-primary-200" aria-label={`View ${member.name} ID card`} title="View ID card">
                        <VisibilityOutlined sx={{ fontSize: 16 }} />
                      </button>
                      <button type="button" onClick={() => router.push(`/dashboard/staff/${member.id}/edit`)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-warning-100 text-warning-600 hover:bg-warning-200" aria-label={`Edit ${member.name}`} title="Edit staff">
                        <EditOutlined sx={{ fontSize: 16 }} />
                      </button>
                      <button type="button" onClick={() => setStaffToDelete(member)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-danger-100 text-danger-500 hover:bg-danger-200" aria-label={`Remove ${member.name}`}>
                        <DeleteOutlined sx={{ fontSize: 16 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
      <div className="mt-4 w-full">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal
        isOpen={!!viewStaff}
        onClose={() => setViewStaff(null)}
        title={viewStaff ? `${viewStaff.name} ID Card` : undefined}
        size="xl"
      >
        {viewStaff && (
          <StaffIdCard
            staff={viewStaff}
            roleName={roleLabel(viewStaff.role, roles)}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!editStaff}
        onClose={() => setEditStaff(null)}
        title={editStaff ? `Edit ${editStaff.name}` : undefined}
        size="lg"
      >
        {editStaff && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label
                  className="block text-sm font-medium text-neutral-700"
                  htmlFor="edit-staff-name"
                >
                  Name
                </label>
                <input
                  id="edit-staff-name"
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-neutral-700"
                  htmlFor="edit-staff-email"
                >
                  Email
                </label>
                <input
                  id="edit-staff-email"
                  type="email"
                  value={editForm.email}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label
                  className="block text-sm font-medium text-neutral-700"
                  htmlFor="edit-staff-phone"
                >
                  Phone
                </label>
                <input
                  id="edit-staff-phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-neutral-700"
                  htmlFor="edit-staff-role"
                >
                  Role
                </label>
                <select
                  id="edit-staff-role"
                  value={editForm.role}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      role: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="">Select a role...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-neutral-700"
                  htmlFor="edit-staff-status"
                >
                  Status
                </label>
                <select
                  id="edit-staff-status"
                  value={editForm.active ? "active" : "inactive"}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      active: event.target.value === "active",
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Staff ID
              </p>
              <p className="mt-2 text-sm font-semibold text-neutral-900">
                {editStaff.id.toUpperCase()}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Staff IDs are assigned automatically and cannot be changed.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditStaff(null)}
                className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveStaffChanges}
                className="rounded-2xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
              >
                Save changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        title="Delete Staff"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Are you sure you want to delete this staff member{" "}
            <span className="font-semibold text-neutral-900">
              {staffToDelete?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setStaffToDelete(null)}
              className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={removeStaff}
              className="rounded-2xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger-700"
            >
              Delete staff
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
