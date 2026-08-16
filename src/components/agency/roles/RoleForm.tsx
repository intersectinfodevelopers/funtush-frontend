"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { PERMISSION_SECTIONS, Role, useRoles } from "@/hooks/useRoles";

export default function RoleForm({
  role,
  onSaved,
}: {
  role?: Role;
  onSaved?: () => void;
}) {
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
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Enter a name for the role.");
      return;
    }
    const id =
      role?.id ??
      `${trimmedName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "")}_${Date.now().toString().slice(-5)}`;
    try {
      saveRole({ id, name: trimmedName, permissions });
      toast.success(
        role
          ? "Role updated successfully."
          : onSaved
            ? "Role created successfully. You can add another role now."
            : "Role created successfully.",
      );
      if (onSaved) {
        onSaved();
      } else {
        router.push("/dashboard/roles");
      }
    } catch {
      toast.error("Could not save the role. Please try again.");
    }
  };
  return (
    <form
      className="w-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
      onSubmit={submit}
    >
      <div className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-4">
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
      <section className="mt-6 border-t border-neutral-200 pt-6">
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
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={`Toggle ${section} permission`}
                onClick={() => toggle(key)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition focus:outline-none focus:ring-4 focus:ring-primary-100 ${enabled ? "border-primary-300 bg-primary-50/50" : "border-neutral-200 hover:border-primary-300"}`}
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
                <span
                  aria-hidden="true"
                  className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${enabled ? "justify-end bg-primary-600" : "justify-start bg-neutral-300"}`}
                >
                  <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
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
