"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, Pencil, RotateCcw, ShieldPlus, Trash2, UserPlus, Users } from "lucide-react";

import { AnalyticsSummaryCard } from "@/components/shared/AnalyticsSummaryCard";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { useRoleList, useStaffList, teamKeys } from "@/hooks/useAgencyTeam";
import { deactivateStaff, reactivateStaff, type StaffMember } from "@/lib/api/agency/staff";
import type { ApiError } from "@/lib/api/client";

const PAGE_SIZE = 10;
const field = "rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const AVATAR_COLORS = ["bg-success-600", "bg-primary-700", "bg-warning-500", "bg-accent-600", "bg-danger-600"];
const initialsOf = (name: string) => name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
const colorFor = (id: string) => AVATAR_COLORS[[...id].reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

export default function StaffPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useStaffList();
  const roles = useRoleList();
  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState("");
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState<StaffMember | null>(null);

  const staff = data ?? [];
  const activeCount = staff.filter((s) => s.isActive).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staff.filter((s) => (!roleId || s.roleId === roleId) && (!q || (s.name ?? "").toLowerCase().includes(q) || s.user.user.email.toLowerCase().includes(q)));
  }, [staff, search, roleId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const refresh = () => { void qc.invalidateQueries({ queryKey: teamKeys.staff }); void qc.invalidateQueries({ queryKey: ["agency", "summary"] }); };
  const deactivate = useMutation({
    mutationFn: (s: StaffMember) => deactivateStaff(s.id),
    onSuccess: (r, s) => { toast.success(r.deleted ? `${s.name ?? "Staff member"} was permanently deleted` : `${s.name ?? "Staff member"} was deactivated`); setRemoving(null); refresh(); },
    onError: (e, s) => { setRemoving(null); toast.error((e as unknown as ApiError).message || `Couldn't remove ${s.name ?? "this member"}.`); },
  });
  const reactivate = useMutation({
    mutationFn: (s: StaffMember) => reactivateStaff(s.id),
    onSuccess: (_r, s) => { toast.success(`${s.name ?? "Staff member"} was reactivated`); refresh(); },
    onError: (e, s) => toast.error((e as unknown as ApiError).message || `Couldn't reactivate ${s.name ?? "this member"}.`),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Staff &amp; Roles</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500"><Link href="/dashboard/staff" className="hover:text-neutral-900">Staff</Link><span className="text-neutral-300">/</span><span className="font-semibold text-neutral-900">All Staff</span></div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/dashboard/roles/new" className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"><ShieldPlus className="h-4 w-4" /> Create Role</Link>
          <Link href="/dashboard/staff/new" className="inline-flex items-center gap-2 rounded-full bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-800"><UserPlus className="h-4 w-4" /> Add Staff</Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <AnalyticsSummaryCard label="Active staff" value={data ? activeCount : "—"} tone="primary" icon={Users} />
        <AnalyticsSummaryCard label="Roles" value={roles.data?.length ?? "—"} tone="success" icon={ShieldPlus} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_220px]">
        <input type="search" aria-label="Search staff" placeholder="Search by name or email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className={`${field} w-full`} />
        <select aria-label="Filter by role" value={roleId} onChange={(e) => { setRoleId(e.target.value); setPage(1); }} className={field}>
          <option value="">All roles</option>
          {(roles.data ?? []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      {isError && <p role="alert" className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Couldn&apos;t load staff. Only the agency admin can see this page.</p>}

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              <tr><th className="w-14 px-4 py-3.5">S.N</th><th className="px-4 py-3.5">Staff Member</th><th className="px-4 py-3.5">Role</th><th className="px-4 py-3.5">Phone Number</th><th className="px-4 py-3.5">Email</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => <tr key={i} className="border-t border-neutral-200"><td colSpan={7} className="px-4 py-5"><div className="h-4 animate-pulse rounded bg-neutral-100" /></td></tr>)}
              {!isLoading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-500">{search || roleId ? "No staff match this filter." : "No staff yet — add your first team member."}</td></tr>}
              {rows.map((s, index) => {
                const name = s.name ?? "Unnamed";
                return (
                  <tr key={s.id} className="border-t border-neutral-200 hover:bg-neutral-50/60">
                    <td className="px-4 py-4 text-neutral-600">{(page - 1) * PAGE_SIZE + index + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${colorFor(s.id)}`}>{initialsOf(name)}</span>
                        <div><Link href={`/dashboard/staff/${s.id}`} className="font-bold text-neutral-900 hover:underline">{name}</Link><div className="text-xs text-neutral-500">{s.user.user.email}</div></div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-neutral-700">{s.role?.name ?? <span className="text-neutral-400">No role</span>}</td>
                    <td className="px-4 py-4 text-neutral-700">{s.phone ?? "—"}</td>
                    <td className="px-4 py-4"><a href={`mailto:${s.user.user.email}`} className="text-warning-700 hover:underline">{s.user.user.email}</a></td>
                    <td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${s.isActive ? "bg-success-50 text-success-700" : "bg-neutral-100 text-neutral-600"}`}><span className={`h-1.5 w-1.5 rounded-full ${s.isActive ? "bg-success-600" : "bg-neutral-400"}`} />{s.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/dashboard/staff/${s.id}`} aria-label={`View ${name}`} title="View" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition hover:bg-primary-100"><Eye className="h-4 w-4" /></Link>
                        <Link href={`/dashboard/staff/${s.id}/edit`} aria-label={`Edit ${name}`} title="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-warning-50 text-warning-700 transition hover:bg-warning-100"><Pencil className="h-4 w-4" /></Link>
                        {!s.isActive && <button type="button" aria-label={`Reactivate ${name}`} title="Reactivate" disabled={reactivate.isPending} onClick={() => reactivate.mutate(s)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-success-50 text-success-700 transition hover:bg-success-100 disabled:opacity-50"><RotateCcw className="h-4 w-4" /></button>}
                        <button type="button" aria-label={s.isActive ? `Deactivate ${name}` : `Delete ${name} permanently`} title={s.isActive ? "Deactivate" : "Delete permanently"} onClick={() => setRemoving(s)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-danger-50 text-danger-700 transition hover:bg-danger-100"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={removing !== null} onClose={() => setRemoving(null)} title={removing?.isActive ? "Deactivate this staff member?" : "Permanently delete this staff member?"} size="sm">
        <div className="space-y-4 p-4">
          <p className="text-sm text-neutral-600">
            {removing?.isActive
              ? <>&ldquo;{removing?.name ?? "This member"}&rdquo; loses dashboard access immediately. You can reactivate them later.</>
              : <>&ldquo;{removing?.name ?? "This member"}&rdquo; is already inactive — deleting it now removes the record for good. This can&apos;t be undone.</>}
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRemoving(null)} className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Cancel</button>
            <button type="button" disabled={deactivate.isPending} onClick={() => removing && deactivate.mutate(removing)} className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">{deactivate.isPending ? "Working…" : removing?.isActive ? "Deactivate" : "Delete permanently"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
