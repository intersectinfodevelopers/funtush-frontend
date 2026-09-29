"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useStaffList } from "@/hooks/useAgencyTeam";
import { updateStaff, type StaffMember } from "@/lib/api/agency/staff";
import type { ApiError } from "@/lib/api/client";

const field = "mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const label = "block text-sm font-medium text-neutral-700";

function EditForm({ member }: { member: StaffMember }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [f, setF] = useState({ name: member.name ?? "", phone: member.phone ?? "", email: member.user.user.email });
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => updateStaff(member.id, { name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim() }),
    onSuccess: () => { toast.success("Profile saved"); void qc.invalidateQueries({ queryKey: ["agency", "staff"] }); router.push(`/dashboard/staff/${member.id}`); },
    onError: (e) => setError((e as unknown as ApiError).message || "Couldn't save."),
  });

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="text-sm text-neutral-500"><Link href={`/dashboard/staff/${member.id}`} className="hover:text-neutral-900">← Back</Link></div>
      <h1 className="text-2xl font-bold text-neutral-900">Edit profile</h1>
      <form onSubmit={(e) => { e.preventDefault(); setError(null); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return setError("Enter a valid email address."); save.mutate(); }} noValidate className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div><label className={label} htmlFor="en">Name</label><input id="en" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={field} /></div>
        <div><label className={label} htmlFor="ee">Email</label><input id="ee" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={field} /></div>
        <div><label className={label} htmlFor="ep">Phone</label><input id="ep" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={field} /></div>
        {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
        <div className="flex justify-end gap-2"><Link href={`/dashboard/staff/${member.id}`} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-50">Cancel</Link><button type="submit" disabled={save.isPending} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{save.isPending ? "Saving…" : "Save"}</button></div>
      </form>
    </div>
  );
}

export default function EditStaffPage() {
  const { id } = useParams<{ id: string }>();
  const { data: staff, isLoading } = useStaffList();
  const member = staff?.find((s) => s.id === id);
  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (!member) return <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-700">This staff member doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/staff">Back to staff</Link></div>;
  return <EditForm member={member} />;
}
