"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ShieldPlus, Trash2 } from "lucide-react";

import PermissionPicker from "@/components/agency/roles/PermissionPicker";
import { Modal } from "@/components/ui/modal";
import { useRoleList, useStaffList } from "@/hooks/useAgencyTeam";
import { deleteRole, setRolePermissions, type AgencyRole } from "@/lib/api/agency/roles";
import type { ApiError } from "@/lib/api/client";

function RoleEditor({ role }: { role: AgencyRole }) {
  const router = useRouter();
  const qc = useQueryClient();
  const staff = useStaffList();
  const [keys, setKeys] = useState<string[]>(role.permissions);
  const [confirm, setConfirm] = useState(false);
  const assigned = (staff.data ?? []).filter((s) => s.roleId === role.id).length;
  const dirty = keys.length !== role.permissions.length || keys.some((k) => !role.permissions.includes(k));

  const save = useMutation({
    mutationFn: () => setRolePermissions(role.id, keys),
    onSuccess: () => { toast.success("Permissions saved"); void qc.invalidateQueries({ queryKey: ["agency", "roles"] }); },
    onError: (e) => toast.error((e as unknown as ApiError).message || "Couldn't save."),
  });
  const remove = useMutation({
    mutationFn: () => deleteRole(role.id),
    onSuccess: () => { toast.success("Role deleted"); void qc.invalidateQueries({ queryKey: ["agency", "roles"] }); router.push("/dashboard/roles"); },
    onError: (e) => { setConfirm(false); toast.error((e as unknown as ApiError).message || "Couldn't delete this role."); },
  });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 py-2 sm:py-4">
      <div className="border-b border-neutral-200 pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span>
          <Link href="/dashboard/staff" className="hover:text-neutral-900">Staff &amp; Roles</Link><span className="text-neutral-300">/</span>
          <Link href="/dashboard/roles" className="hover:text-neutral-900">Roles</Link><span className="text-neutral-300">/</span>
          <span className="font-semibold text-neutral-900">{role.name}</span>
        </nav>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><ShieldPlus className="h-5 w-5" /></span>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">{role.name}</h1>
              <p className="mt-0.5 text-sm text-neutral-500">{role.description || "Edit this role's permissions."} · {assigned} staff member{assigned === 1 ? "" : "s"} assigned</p>
            </div>
          </div>
          <button type="button" onClick={() => setConfirm(true)} className="inline-flex items-center gap-2 rounded-full bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700"><Trash2 className="h-4 w-4" /> Delete role</button>
        </div>
      </div>

      <section className="border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-base font-bold text-neutral-900">Permission Matrix</h2>
        <p className="mt-0.5 text-sm text-neutral-500">Choose the areas this role can access.</p>
        <div className="mt-4"><PermissionPicker value={keys} onToggle={(key) => setKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))} /></div>
        <div className="mt-6 flex justify-end border-t border-neutral-100 pt-5">
          <button type="button" disabled={!dirty || save.isPending} onClick={() => save.mutate()} className="rounded-full bg-primary-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{save.isPending ? "Saving…" : "Save role"}</button>
        </div>
      </section>

      <Modal isOpen={confirm} onClose={() => setConfirm(false)} title="Delete this role?" size="sm">
        <div className="space-y-4 p-4">
          <p className="text-sm text-neutral-600">{assigned > 0 ? `${assigned} active staff member${assigned === 1 ? " has" : "s have"} this role — reassign them first, or the delete is refused.` : "This can't be undone."}</p>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setConfirm(false)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Cancel</button><button type="button" disabled={remove.isPending} onClick={() => remove.mutate()} className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">Delete</button></div>
        </div>
      </Modal>
    </div>
  );
}

export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useRoleList();
  const role = data?.find((r) => r.id === id);
  if (isLoading) return <div className="mx-auto h-40 max-w-4xl animate-pulse border border-neutral-200 bg-white" />;
  if (!role) return <div className="mx-auto max-w-4xl border border-neutral-200 bg-white p-6 text-sm text-neutral-700">This role doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/roles">Back to roles</Link></div>;
  return <RoleEditor key={role.id + role.permissions.join()} role={role} />;
}
