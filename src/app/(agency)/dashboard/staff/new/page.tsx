"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";

import { useRoleList } from "@/hooks/useAgencyTeam";
import { inviteStaff } from "@/lib/api/agency/staff";
import type { ApiError } from "@/lib/api/client";

const field = "mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const label = "block text-sm font-semibold text-neutral-800";
const Req = () => <span className="ml-0.5 text-danger-600" aria-hidden="true">*</span>;

export default function InviteStaffPage() {
  const qc = useQueryClient();
  const roles = useRoleList();
  const [f, setF] = useState({ name: "", email: "", phone: "", roleId: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<string | null>(null);
  const [invited, setInvited] = useState<{ email: string; tempPassword: string } | null>(null);

  const invite = useMutation({
    mutationFn: () => inviteStaff({ email: f.email.trim(), name: f.name.trim() || undefined, phone: f.phone.trim() || undefined, roleId: f.roleId || undefined }),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ["agency", "staff"] });
      void qc.invalidateQueries({ queryKey: ["agency", "summary"] });
      setInvited({ email: res.staff.user.user.email, tempPassword: res.tempPassword });
    },
    onError: (e) => {
      const err = e as unknown as ApiError;
      setSummary(err.message || "Couldn't create this staff account.");
      toast.error(err.message || "Couldn't create this staff account.", { duration: 6000 });
    },
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (!f.name.trim()) found.name = "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) found.email = "Enter a valid email address.";
    if (!f.roleId) found.roleId = "Choose a role for this staff member.";
    setErrors(found);
    if (Object.keys(found).length) {
      setSummary(`Please fix ${Object.keys(found).length === 1 ? "the highlighted field" : "the highlighted fields"} and try again.`);
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setSummary(null);
    invite.mutate();
  }

  const E = (k: string) => (errors[k] ? <p role="alert" className="mt-1 text-xs text-danger-600">{errors[k]}</p> : null);
  const bad = (k: string) => (errors[k] ? " border-danger-500" : "");

  if (invited) {
    return (
      <div className="mx-auto w-full max-w-xl space-y-4 py-2 sm:py-4">
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-neutral-900">Staff account created</h1>
          <p className="text-sm text-neutral-600">{invited.email} was emailed a temporary password. In case the email doesn&apos;t arrive, it&apos;s shown here <strong>once</strong>:</p>
          <div className="flex items-center gap-2">
            <code data-testid="temp-password" className="min-w-0 flex-1 truncate rounded-lg bg-neutral-100 px-3 py-2 text-sm">{invited.tempPassword}</code>
            <button type="button" onClick={() => navigator.clipboard.writeText(invited.tempPassword).then(() => toast.success("Copied"), () => toast.error("Couldn't copy"))} className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold hover:bg-neutral-50">Copy</button>
          </div>
          <div className="flex gap-2"><Link href="/dashboard/staff" className="rounded-full bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800">Back to staff</Link><button type="button" onClick={() => { setInvited(null); setF({ name: "", email: "", phone: "", roleId: "" }); }} className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Add another</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 py-2 sm:py-4">
      <div className="border-b border-neutral-200 pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span>
          <Link href="/dashboard/staff" className="hover:text-neutral-900">Staff</Link><span className="text-neutral-300">/</span>
          <span className="font-semibold text-neutral-900">New staff</span>
        </nav>
        <div className="mt-2 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><UserPlus className="h-5 w-5" /></span>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Add staff</h1>
            <p className="mt-0.5 text-sm text-neutral-500">Create a staff account and assign its role and access.</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-base font-bold text-neutral-900">Add new staff</h2>
        <div className="mt-4 border-t border-neutral-100 pt-5">
          <h3 className="text-sm font-bold text-neutral-900">Staff details</h3>
          <p className="mt-0.5 text-sm text-neutral-500">Add contact information and assign access for this team member.</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="sn" className={label}>Full name<Req /></label>
              <input id="sn" aria-invalid={Boolean(errors.name)} placeholder="e.g. Suresh Gurung" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={`${field}${bad("name")}`} />
              {E("name")}
            </div>
            <div>
              <label htmlFor="sp" className={label}>Phone</label>
              <input id="sp" placeholder="+977 98…" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={field} />
            </div>
            <div>
              <label htmlFor="se" className={label}>Email address<Req /></label>
              <input id="se" type="email" aria-invalid={Boolean(errors.email)} placeholder="staff@example.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={`${field}${bad("email")}`} />
              {E("email")}
            </div>
            <div>
              <label htmlFor="sr" className={label}>Role<Req /></label>
              <select id="sr" aria-invalid={Boolean(errors.roleId)} value={f.roleId} onChange={(e) => setF({ ...f, roleId: e.target.value })} className={`${field}${bad("roleId")}`}>
                <option value="">Select a role…</option>
                {(roles.data ?? []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              {E("roleId")}
              {(roles.data?.length ?? 0) === 0 && <p className="mt-1 text-xs text-neutral-500">No roles yet — <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/roles/new">create one</Link> to control what staff can do.</p>}
            </div>
          </div>
        </div>

        {summary && <p role="alert" className="mt-6 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{summary}</p>}

        <div className="mt-6 flex justify-end gap-3 border-t border-neutral-100 pt-5">
          <Link href="/dashboard/staff" className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Cancel</Link>
          <button type="submit" disabled={invite.isPending} className="rounded-full bg-primary-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{invite.isPending ? "Creating…" : "Create staff"}</button>
        </div>
      </form>
    </div>
  );
}
