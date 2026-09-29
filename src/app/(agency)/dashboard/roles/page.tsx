"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Briefcase, Eye, Pencil, Plus, ShieldCheck, Trash2, Users } from "lucide-react";

import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { Modal } from "@/components/ui/modal";
import { usePermissionCatalog, useRoleList, useStaffList } from "@/hooks/useAgencyTeam";
import { deleteRole, type AgencyRole } from "@/lib/api/agency/roles";
import type { ApiError } from "@/lib/api/client";

const startOfMonth = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); };
const growth = (curr: number, prev: number): string | undefined => {
  if (prev === 0) return undefined;
  const pct = ((curr - prev) / prev) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
};

export default function RolesPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useRoleList();
  const staff = useStaffList();
  const catalog = usePermissionCatalog();
  const catalogSize = (catalog.data ?? []).reduce((s, g) => s + g.permissions.length, 0);
  const [removing, setRemoving] = useState<AgencyRole | null>(null);
  const roles = useMemo(() => data ?? [], [data]);

  const memberCount = (id: string) => (staff.data ?? []).filter((s) => s.roleId === id && s.isActive).length;
  const som = startOfMonth();
  const rolesBeforeMonth = roles.filter((r) => new Date(r.createdAt) < som).length;
  const activeStaff = (staff.data ?? []).filter((s) => s.isActive);
  const staffBeforeMonth = activeStaff.filter((s) => new Date(s.invitedAt) < som).length;

  const remove = useMutation({
    mutationFn: (r: AgencyRole) => deleteRole(r.id),
    onSuccess: (_r, r) => { toast.success(`“${r.name}” was deleted`); setRemoving(null); void qc.invalidateQueries({ queryKey: ["agency", "roles"] }); },
    onError: (e, r) => { setRemoving(null); toast.error((e as unknown as ApiError).message || `Couldn't delete “${r.name}”.`); },
  });

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500"><Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span><Link href="/dashboard/staff" className="hover:text-neutral-900">Staff &amp; Roles</Link><span className="text-neutral-300">/</span><span className="font-semibold text-neutral-900">Roles</span></div>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Roles &amp; Permissions</h1>
          <p className="mt-1 text-sm text-neutral-600">Create roles and control what each team member can access.</p>
        </div>
        <Link href="/dashboard/roles/new" className="inline-flex items-center gap-2 self-start rounded-full bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-800"><Plus className="h-4 w-4" /> Create role</Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <AnalyticsSummaryCard label="Active Roles" value={data ? roles.length : "—"} tone="primary" icon={Briefcase} change={data ? growth(roles.length, rolesBeforeMonth) : undefined} />
        <AnalyticsSummaryCard label="Team Members" value={staff.data ? activeStaff.length : "—"} tone="accent" icon={Users} change={staff.data ? growth(activeStaff.length, staffBeforeMonth) : undefined} />
        <AnalyticsSummaryCard label="Permissions" value={catalog.data ? catalogSize : "—"} tone="warning" icon={ShieldCheck} note="in the permission catalog" />
      </div>

      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load roles.</p>}

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              <tr><th className="w-14 px-4 py-3.5">No.</th><th className="px-4 py-3.5">Name</th><th className="px-4 py-3.5">Members</th><th className="px-4 py-3.5">Permissions</th><th className="px-4 py-3.5 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => <tr key={i} className="border-t border-neutral-200"><td colSpan={5} className="px-4 py-5"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td></tr>)}
              {!isLoading && roles.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-500">No roles yet. Create one, then assign it to staff.</td></tr>}
              {roles.map((r, index) => (
                <tr key={r.id} className="border-t border-neutral-200 hover:bg-neutral-50/60">
                  <td className="px-4 py-4 text-neutral-600">{index + 1}</td>
                  <td className="px-4 py-4"><Link href={`/dashboard/roles/${r.id}`} className="font-bold text-neutral-900 hover:underline">{r.name}</Link><div className="text-xs text-neutral-400">ID: {r.id.slice(0, 8)}</div></td>
                  <td className="px-4 py-4 text-neutral-700">{staff.data ? memberCount(r.id) : "…"}</td>
                  <td className="px-4 py-4 text-neutral-700">{r.permissions.length === 0 ? <span className="text-neutral-400">No permissions</span> : catalog.data && r.permissions.length === catalogSize ? "Full access to all areas" : r.permissions.map((p) => p[0].toUpperCase() + p.slice(1)).join(" · ")}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/dashboard/roles/${r.id}`} aria-label={`View ${r.name}`} title="View" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition hover:bg-primary-100"><Eye className="h-4 w-4" /></Link>
                      <Link href={`/dashboard/roles/${r.id}`} aria-label={`Edit ${r.name}`} title="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-warning-50 text-warning-700 transition hover:bg-warning-100"><Pencil className="h-4 w-4" /></Link>
                      <button type="button" aria-label={`Delete ${r.name}`} title="Delete" onClick={() => setRemoving(r)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-danger-50 text-danger-700 transition hover:bg-danger-100"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={removing !== null} onClose={() => setRemoving(null)} title="Delete this role?" size="sm">
        <div className="space-y-4 p-4">
          <p className="text-sm text-neutral-600">{removing && memberCount(removing.id) > 0 ? `${memberCount(removing.id)} active staff member${memberCount(removing.id) === 1 ? "" : "s"} have this role — reassign them first, or the delete is refused.` : "This can't be undone."}</p>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setRemoving(null)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Cancel</button><button type="button" disabled={remove.isPending} onClick={() => removing && remove.mutate(removing)} className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">{remove.isPending ? "Deleting…" : "Delete"}</button></div>
        </div>
      </Modal>
    </div>
  );
}
