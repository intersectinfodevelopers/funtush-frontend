"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ShieldPlus } from "lucide-react";

import PermissionPicker from "@/components/agency/roles/PermissionPicker";
import { createRole } from "@/lib/api/agency/roles";
import type { ApiError } from "@/lib/api/client";

const field = "mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const label = "block text-sm font-semibold text-neutral-800";

export default function NewRolePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [keys, setKeys] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => createRole({ name: name.trim(), description: description.trim() || undefined, permissionKeys: keys }),
    onSuccess: () => { toast.success("Role created"); void qc.invalidateQueries({ queryKey: ["agency", "roles"] }); router.push("/dashboard/roles"); },
    onError: (e) => setError((e as unknown as ApiError).message || "Couldn't create the role."),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Give the role a name.");
    create.mutate();
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 py-2 sm:py-4">
      <div className="border-b border-neutral-200 pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span>
          <Link href="/dashboard/staff" className="hover:text-neutral-900">Staff &amp; Roles</Link><span className="text-neutral-300">/</span>
          <Link href="/dashboard/roles" className="hover:text-neutral-900">Roles</Link><span className="text-neutral-300">/</span>
          <span className="font-semibold text-neutral-900">New role</span>
        </nav>
        <div className="mt-2 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><ShieldPlus className="h-5 w-5" /></span>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Create role</h1>
            <p className="mt-0.5 text-sm text-neutral-500">Set a name and select the permissions this role needs.</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="rounded-xl bg-neutral-50 p-4">
          <label htmlFor="rn" className={label}>Role name</label>
          <input id="rn" placeholder="e.g. Trek Coordinator" value={name} onChange={(e) => setName(e.target.value)} className={field} />
        </div>

        <div className="mt-4">
          <label htmlFor="rd" className={label}>Description (optional)</label>
          <input id="rd" placeholder="What does this role do?" value={description} onChange={(e) => setDescription(e.target.value)} className={field} />
        </div>

        <div className="mt-6 border-t border-neutral-100 pt-5">
          <h2 className="text-base font-bold text-neutral-900">Permission Matrix</h2>
          <p className="mt-0.5 text-sm text-neutral-500">Choose the areas this role can access.</p>
          <div className="mt-4"><PermissionPicker value={keys} onToggle={(key) => setKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))} /></div>
        </div>

        {error && <p role="alert" className="mt-6 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</p>}

        <div className="mt-6 flex justify-end gap-3 border-t border-neutral-100 pt-5">
          <Link href="/dashboard/roles" className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Cancel</Link>
          <button type="submit" disabled={create.isPending} className="rounded-full bg-primary-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{create.isPending ? "Creating…" : "Save role"}</button>
        </div>
      </form>
    </div>
  );
}
