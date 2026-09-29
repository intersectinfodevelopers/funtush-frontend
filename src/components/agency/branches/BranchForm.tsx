"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Building2 } from "lucide-react";

import { useStaffList } from "@/hooks/useAgencyTeam";
import { createBranch, updateBranch, type Branch } from "@/lib/api/agency/branches";
import type { ApiError } from "@/lib/api/client";

const field = "mt-1.5 w-full rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const label = "block text-sm font-semibold text-neutral-800";

export default function BranchForm({ branch }: { branch?: Branch }) {
  const router = useRouter();
  const qc = useQueryClient();
  const staff = useStaffList();
  const editing = Boolean(branch);
  const [name, setName] = useState(branch?.name ?? "");
  const [address, setAddress] = useState(branch?.address ?? "");
  const [phone, setPhone] = useState(branch?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(branch?.whatsapp ?? "");
  const [manager, setManager] = useState(branch?.managerStaffId ?? "");
  const [head, setHead] = useState(branch?.isHeadOffice ?? false);
  const [error, setError] = useState<string | null>(null);

  const PHONE_RE = /^[+()\d][\d\s()+.-]{5,24}$/;

  const save = useMutation({
    mutationFn: () => {
      const body = { name: name.trim(), address: address.trim(), phone: phone.trim(), whatsapp: whatsapp.trim() || null, managerStaffId: manager || null, isHeadOffice: head };
      return branch ? updateBranch(branch.id, body) : createBranch(body);
    },
    onSuccess: () => { toast.success(branch ? "Branch saved" : "Branch created"); void qc.invalidateQueries({ queryKey: ["agency", "branches"] }); router.push("/dashboard/branches"); },
    onError: (e) => setError((e as unknown as ApiError).message || "Couldn't save the branch."),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Add a branch name.");
    if (!address.trim()) return setError("Add the branch address.");
    if (!PHONE_RE.test(phone.trim())) return setError("Enter a valid phone number.");
    if (whatsapp.trim() && !PHONE_RE.test(whatsapp.trim())) return setError("Enter a valid WhatsApp number, or leave it blank.");
    save.mutate();
  }

  const members = (staff.data ?? []).filter((s) => s.isActive);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 py-2 sm:py-4">
      <div className="border-b border-neutral-200 pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span>
          <Link href="/dashboard/branches" className="hover:text-neutral-900">Branches</Link><span className="text-neutral-300">/</span>
          <span className="font-semibold text-neutral-900">{editing ? "Edit" : "New branch"}</span>
        </nav>
        <div className="mt-2 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><Building2 className="h-5 w-5" /></span>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{editing ? "Edit branch" : "Add branch"}</h1>
            <p className="mt-0.5 text-sm text-neutral-500">{editing ? "Update this branch's details." : "Create a new agency location and assign its details."}</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="space-y-5 border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <label htmlFor="bn" className={label}>Branch Name</label>
          <input id="bn" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="e.g., Pokhara Office" className={field} />
        </div>
        <div>
          <label htmlFor="ba" className={label}>Address</label>
          <input id="ba" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} placeholder="e.g., Lakeside, Pokhara" className={field} />
        </div>
        <div>
          <label htmlFor="bp" className={label}>Phone</label>
          <input id="bp" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., +977 61 520000" className={field} />
        </div>
        <div>
          <label htmlFor="bw" className={label}>WhatsApp (optional)</label>
          <input id="bw" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="e.g., +977 98…" className={field} />
        </div>
        <div>
          <label htmlFor="bm" className={label}>Branch Manager</label>
          <select id="bm" value={manager} onChange={(e) => setManager(e.target.value)} className={field}>
            <option value="">Select Manager</option>
            {members.map((s) => <option key={s.id} value={s.id}>{s.name ?? s.user.user.email}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-700"><input type="checkbox" checked={head} onChange={(e) => setHead(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-primary-900 focus:ring-primary-400" /> This is the head office</label>

        {error && <p role="alert" className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</p>}

        <div className="flex justify-end gap-3 border-t border-neutral-100 pt-5">
          <Link href="/dashboard/branches" className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Cancel</Link>
          <button type="submit" disabled={save.isPending} className="rounded-full bg-primary-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{save.isPending ? "Saving…" : editing ? "Save branch" : "Save branch"}</button>
        </div>
      </form>
    </div>
  );
}
