"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Branch, useBranches } from "@/hooks/useBranches";
import { useStaff } from "@/hooks/useStaff";

export default function BranchForm({ branch }: { branch?: Branch }) {
  const router = useRouter();
  const { saveBranch } = useBranches();
  const { staff } = useStaff();
  const [form, setForm] = useState({
    name: branch?.name ?? "",
    address: branch?.address ?? "",
    phone: branch?.phone ?? "",
    managerId: branch?.managerId ?? "",
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    saveBranch({ id: branch?.id ?? `branch-${Date.now()}`, ...form });
    router.push("/dashboard/branches");
  };
  return (
    <form
      className="max-w-4xl rounded-2xl border border-neutral-200 bg-white p-5"
      onSubmit={submit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            ["name", "Branch name", "Kathmandu HQ"],
            ["address", "Address", "Street, city"],
            ["phone", "Phone", "+977 ..."],
          ] as const
        ).map(([key, label, placeholder]) => (
          <div key={key}>
            <label
              className="mb-1.5 block text-sm font-semibold text-neutral-700"
              htmlFor={key}
            >
              {label}
            </label>
            <input
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50"
              id={key}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={placeholder}
              required
            />
          </div>
        ))}
        <div>
          <label
            className="mb-1.5 block text-sm font-semibold text-neutral-700"
            htmlFor="manager"
          >
            Manager
          </label>
          <select
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50"
            id="manager"
            value={form.managerId}
            onChange={(e) => setForm({ ...form, managerId: e.target.value })}
            required
          >
            <option value="">Select a staff member</option>
            {staff
              .filter((member) => member.active)
              .map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
          </select>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <Link
          href="/dashboard/branches"
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Cancel
        </Link>
        <button
          className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
          type="submit"
        >
          Save branch
        </button>
      </div>
    </form>
  );
}
