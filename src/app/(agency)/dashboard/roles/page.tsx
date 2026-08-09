"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  ChevronRight,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useRoles } from "@/hooks/useRoles";
import { useStaff } from "@/hooks/useStaff";

export default function RolesPage() {
  const { roles } = useRoles();
  const { staff } = useStaff();
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Link href="/dashboard">Dashboard</Link>
            <ChevronRight size={15} />
            <span>Staff &amp; Roles</span>
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
      <div className="mb-4 flex flex-wrap gap-3">
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
      <section className="grid gap-4 md:grid-cols-2">
        {roles.map((role) => {
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
              <Link
                href={`/dashboard/roles/${role.id}`}
                className="h-fit rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 hover:bg-primary-100"
              >
                Edit
              </Link>
            </article>
          );
        })}
      </section>
    </div>
  );
}
