"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PERMISSION_SECTIONS, Role, useRoles } from "@/hooks/useRoles";

export default function RoleForm({ role }: { role?: Role }) {
  const router = useRouter();
  const { saveRole } = useRoles();
  const [name, setName] = useState(role?.name ?? "");
  const [permissions, setPermissions] = useState<string[]>(
    role?.permissions ?? [],
  );
  const toggle = (permission: string) =>
    setPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const id =
      role?.id ??
      `${name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "")}_${Date.now().toString().slice(-5)}`;
    saveRole({ id, name: name.trim(), permissions });
    router.push("/dashboard/roles");
  };
  return (
    <form
      className="max-w-4xl rounded-2xl border border-neutral-200 bg-white p-5"
      onSubmit={submit}
    >
      <div>
        <label
          className="mb-1.5 block text-sm font-semibold text-neutral-700"
          htmlFor="role-name"
        >
          Role name
        </label>
        <input
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50"
          id="role-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Trek Coordinator"
          required
        />
      </div>
      <section className="mt-6 border-t border-neutral-200 pt-5">
        <div>
          <h2 className="text-base font-bold text-neutral-900">
            Permission Matrix
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Choose the areas this role can access.
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PERMISSION_SECTIONS.map((section) => {
            const key = section.toLowerCase();
            const enabled = permissions.includes(key);
            return (
              <label
                className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3 hover:border-primary-300"
                key={key}
              >
                <span>
                  <strong className="block text-sm text-neutral-700">
                    {section}
                  </strong>
                  <small className="mt-0.5 block text-xs text-neutral-400">
                    Access {section.toLowerCase()} tools
                  </small>
                </span>
                <input
                  className="h-5 w-5 accent-primary-600"
                  type="checkbox"
                  checked={enabled}
                  onChange={() => toggle(key)}
                />
              </label>
            );
          })}
        </div>
      </section>
      <div className="mt-5 flex justify-end gap-3">
        <Link
          href="/dashboard/roles"
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Cancel
        </Link>
        <button
          className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
          type="submit"
        >
          Save role
        </button>
      </div>
    </form>
  );
}
