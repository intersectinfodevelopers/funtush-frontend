"use client";
import Link from "next/link";
import { ChevronRight, MapPin, Phone, Plus, UserRound } from "lucide-react";
import { useBranches } from "@/hooks/useBranches";
import { useStaff } from "@/hooks/useStaff";
export default function BranchesPage() {
  const { branches } = useBranches();
  const { staff } = useStaff();
  const manager = (id: string) =>
    staff.find((person) => person.id === id)?.name ?? "Unassigned";
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Link href="/dashboard">Dashboard</Link>
            <ChevronRight size={15} />
            <strong className="text-primary-900">Branches</strong>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Branches</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Manage the locations your agency operates from.
          </p>
        </div>
        <Link
          href="/dashboard/branches/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
        >
          <Plus size={18} /> New branch
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {branches.map((branch) => (
          <article
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            key={branch.id}
          >
            <div className="mb-4 flex justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600">
                <MapPin size={20} />
              </span>
              <Link
                href={`/dashboard/branches/${branch.id}`}
                className="h-fit rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 hover:bg-primary-100"
              >
                Edit
              </Link>
            </div>
            <h2 className="font-bold text-neutral-900">{branch.name}</h2>
            <p className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
              <MapPin className="text-primary-500" size={16} />
              {branch.address}
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
              <Phone className="text-primary-500" size={16} />
              {branch.phone}
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
              <UserRound className="text-primary-500" size={16} />
              Manager: {manager(branch.managerId)}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
