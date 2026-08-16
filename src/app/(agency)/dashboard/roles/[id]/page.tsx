"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import RoleForm from "@/components/agency/roles/RoleForm";
import { useRoles } from "@/hooks/useRoles";
export default function EditRolePage() {
  const { id } = useParams<{ id: string }>();
  const { getRole } = useRoles();
  const role = getRole(id);
  if (!role)
    return (
      <div className="p-8 text-center text-neutral-600">
        Role not found.{" "}
        <Link className="text-primary-700 underline" href="/dashboard/roles">
          Back to roles
        </Link>
      </div>
    );
  return (
    <div className="mx-auto w-full max-w-6xl py-6">
      <div className="mb-6">
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Link href="/dashboard">Dashboard</Link>
          <ChevronRight size={15} />
          <Link  href="/dashboard/staff">Staff &amp; Roles</Link>
          <ChevronRight size={15} />
          <Link  href="/dashboard/roles">Roles</Link>
          <ChevronRight size={15} />
          <strong className="text-primary-900">{role.name}</strong>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">
          Edit {role.name}
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Update this role&apos;s access settings.
        </p>
      </div>
      <div className="pb-4">
        <RoleForm role={role} />
      </div>
    </div>
  );
}
