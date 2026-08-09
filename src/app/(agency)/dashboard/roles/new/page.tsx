import Link from "next/link";
import { ChevronRight } from "lucide-react";
import RoleForm from "@/components/agency/roles/RoleForm";
export default function NewRolePage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Link href="/dashboard">Dashboard</Link>
          <ChevronRight size={15} />
          <Link href="/dashboard/roles">Roles</Link>
          <ChevronRight size={15} />
          <strong className="text-primary-900">New role</strong>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">
          Create role
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Set a name and select the permissions this role needs.
        </p>
      </div>
      <RoleForm />
    </div>
  );
}
