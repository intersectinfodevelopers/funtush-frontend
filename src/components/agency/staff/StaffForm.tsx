"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useRoles } from "@/hooks/useRoles";

interface StaffFormProps {
  initialData?: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  };
  isNew?: boolean;
  onSave: (data: {
    name: string;
    email: string;
    phone: string;
    role: string;
  }) => void;
}

const fieldClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-50";

export default function StaffForm({ initialData, isNew = true, onSave }: StaffFormProps) {
  const { roles } = useRoles();
  const [name, setName] = useState(initialData?.name ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [role, setRole] = useState(initialData?.role ?? "");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name ?? "");
      setEmail(initialData.email ?? "");
      setPhone(initialData.phone ?? "");
      setRole(initialData.role ?? "");
    }
  }, [initialData]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
    });
  };

  return (
    <form
      className="w-full rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6"
      onSubmit={handleSubmit}
    >
      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-xl font-bold text-neutral-900">{isNew ? "Add new staff" : "Edit staff"}</h1>
      </div>

      <section className="pt-5" aria-labelledby="staff-details-heading">
        <div className="mb-4">
          <h2
            id="staff-details-heading"
            className="text-base font-bold text-neutral-900"
          >
            Staff details
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Add contact information and assign access for this team member.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="staff-name" required>
            <input
              id="staff-name"
              className={fieldClassName}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Suresh Gurung"
              required
            />
          </Field>
          <Field label="Phone" htmlFor="staff-phone">
            <input
              id="staff-phone"
              className={fieldClassName}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+977 98..."
              type="tel"
            />
          </Field>
          <Field label="Email address" htmlFor="staff-email" required>
            <input
              id="staff-email"
              className={fieldClassName}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="staff@example.com"
              type="email"
              required
            />
          </Field>
          <Field label="Role" htmlFor="staff-role" required>
            <select
              id="staff-role"
              className={fieldClassName}
              value={role}
              onChange={(event) => setRole(event.target.value)}
              required
            >
              <option value="">Select a role...</option>
              {roles.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/staff"
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-center text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Cancel
        </Link>
        <button
          className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-100"
          type="submit"
        >
          {isNew ? "Create staff" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required = false,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-1.5 block text-sm font-semibold text-neutral-700"
        htmlFor={htmlFor}
      >
        {label}
        {required && (
          <span className="ml-1 text-danger-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
