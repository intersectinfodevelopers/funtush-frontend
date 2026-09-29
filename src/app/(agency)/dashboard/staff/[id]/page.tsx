"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Modal } from "@/components/ui/modal";
import { useRoleList, useStaffActivity, useStaffList } from "@/hooks/useAgencyTeam";
import { deactivateStaff, reactivateStaff, reassignRole } from "@/lib/api/agency/staff";
import type { ApiError } from "@/lib/api/client";

const fmt = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
const label = (a: string) => a.toLowerCase().replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: staff, isLoading } = useStaffList();
  const roles = useRoleList();
  const activity = useStaffActivity(id);
  const [confirm, setConfirm] = useState(false);
  const member = staff?.find((s) => s.id === id);

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["agency", "staff"] });
    void qc.invalidateQueries({ queryKey: ["agency", "summary"] });
  };
  const changeRole = useMutation({
    mutationFn: (roleId: string) => reassignRole(id, roleId),
    onSuccess: () => { toast.success("Role updated"); refresh(); },
    onError: (e) => toast.error((e as unknown as ApiError).message || "Couldn't change the role."),
  });
  const deactivate = useMutation({
    mutationFn: () => deactivateStaff(id),
    onSuccess: (r) => {
      setConfirm(false);
      if (r.deleted) { toast.success("Staff member permanently deleted"); refresh(); router.push("/dashboard/staff"); return; }
      toast.success("Staff member deactivated"); refresh();
    },
    onError: (e) => { setConfirm(false); toast.error((e as unknown as ApiError).message || "Couldn't remove this member."); },
  });
  const reactivate = useMutation({
    mutationFn: () => reactivateStaff(id),
    onSuccess: () => { toast.success("Staff member reactivated"); refresh(); },
    onError: (e) => toast.error((e as unknown as ApiError).message || "Couldn't reactivate."),
  });

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (!member) return <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-6"><p className="text-sm text-neutral-700">This staff member doesn&apos;t exist.</p><Link href="/dashboard/staff" className="text-sm font-semibold text-primary-700 hover:underline">← Back to staff</Link></div>;

  const name = member.name ?? "Unnamed";
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <Link href="/dashboard/staff" className="text-sm font-medium text-primary-900 hover:underline">← Back to staff</Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-900">{name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?"}</div>
            <div>
              <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-neutral-900">{name}</h1><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${member.isActive ? "bg-success-50 text-success-700" : "bg-neutral-100 text-neutral-600"}`}><span className={`h-1.5 w-1.5 rounded-full ${member.isActive ? "bg-success-600" : "bg-neutral-400"}`} />{member.isActive ? "Active" : "Inactive"}</span></div>
              <p className="text-sm text-neutral-500">{member.user.user.email}{member.phone ? ` · ${member.phone}` : ""}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/staff/${id}/edit`} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Edit profile</Link>
            {!member.isActive && <button type="button" disabled={reactivate.isPending} onClick={() => reactivate.mutate()} className="rounded-xl bg-success-600 px-4 py-2 text-sm font-semibold text-white hover:bg-success-700 disabled:opacity-50">{reactivate.isPending ? "Reactivating…" : "Reactivate"}</button>}
            <button type="button" onClick={() => setConfirm(true)} className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700">{member.isActive ? "Deactivate" : "Delete permanently"}</button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-neutral-900">Role</h2>
          <p className="text-xs text-neutral-500">Decides which parts of the dashboard they can use.</p>
          <select aria-label="Role" value={member.roleId ?? ""} disabled={changeRole.isPending} onChange={(e) => e.target.value && changeRole.mutate(e.target.value)} className="mt-3 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm">
            {/* The API can change a role but not clear one (roleId is required). */}
            {!member.roleId && <option value="" disabled>Select a role…</option>}
            {(roles.data ?? []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <p className="mt-3 text-xs text-neutral-500">Invited {new Date(member.invitedAt).toLocaleDateString("en-GB")}</p>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-4 py-3"><h2 className="font-semibold text-neutral-900">Recent activity</h2><p className="text-xs text-neutral-500">The last 20 recorded actions.</p></div>
          <ul className="divide-y divide-neutral-100">
            {activity.isLoading && <li className="px-4 py-4"><div className="h-4 animate-pulse rounded bg-neutral-100" /></li>}
            {!activity.isLoading && (activity.data ?? []).length === 0 && <li className="px-4 py-6 text-sm text-neutral-500">No activity recorded yet.</li>}
            {(activity.data ?? []).map((a) => <li key={a._id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm"><span className="font-medium text-neutral-900">{label(a.action)}</span><span className="text-neutral-500">{fmt(a.createdAt)}</span></li>)}
          </ul>
        </section>
      </div>

      <Modal isOpen={confirm} onClose={() => setConfirm(false)} title={member.isActive ? `Deactivate ${name}?` : `Permanently delete ${name}?`} size="sm">
        <div className="space-y-4 p-4">
          <p className="text-sm text-neutral-600">{member.isActive ? "They can no longer sign in. Their past activity is kept, and you can reactivate them later." : "This member is already inactive — deleting removes the record for good. This can't be undone."}</p>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setConfirm(false)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Cancel</button><button type="button" disabled={deactivate.isPending} onClick={() => deactivate.mutate()} className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">{deactivate.isPending ? "Working…" : member.isActive ? "Deactivate" : "Delete permanently"}</button></div>
        </div>
      </Modal>
    </div>
  );
}
