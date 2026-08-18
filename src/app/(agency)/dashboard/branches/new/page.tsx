"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useBranches, type Branch } from "@/hooks/useBranches";
import { useStaff } from "@/hooks/useStaff";

export default function NewBranchPage() {
  const router = useRouter();
  const { saveBranch } = useBranches();
  const { staff } = useStaff();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [managerId, setManagerId] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      toast.error("Branch name is required.");
      return;
    }

    if (!trimmedAddress) {
      toast.error("Branch address is required.");
      return;
    }

    try {
      const newBranch: Branch = {
        id: `${trimmedName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
        name: trimmedName,
        address: trimmedAddress,
        phone: trimmedPhone,
        managerId,
      };

      saveBranch(newBranch);
      toast.success("Branch created successfully.");
      router.push("/dashboard/branches");
    } catch {
      toast.error("Could not create the branch. Please try again.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl py-2 sm:py-4">
      <div className="mb-7 border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">
            Dashboard
          </Link>
          <ChevronRight size={15} />
          <Link href="/dashboard/branches" className="hover:text-neutral-900">
            Branches
          </Link>
          <ChevronRight size={15} />
          <strong className="text-primary-900">New branch</strong>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Add branch</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Create a new agency location and assign its details.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-900">Branch Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Pokhara Office"
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., Lakeside, Pokhara"
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., +977 61 520000"
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900">Branch Manager</label>
            <select
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">Select Manager</option>
              {staff.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={() => router.push("/dashboard/branches")}
            className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
          >
            Save branch
          </button>
        </div>
      </form>
    </div>
  );
}