"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useBranches, type Branch } from "@/hooks/useBranches";
import { useStaff } from "@/hooks/useStaff";

export default function EditBranchPage() {
  const router = useRouter();
  const params = useParams();
  const branchId = params?.id as string;

  const { branches, saveBranch } = useBranches();
  const { staff } = useStaff();

  const currentBranch = branches.find((branch) => branch.id === branchId);

  if (!currentBranch) {
    return (
      <div className="mx-auto w-full max-w-6xl py-10">
        <p className="text-sm text-neutral-600">Branch not found.</p>

        <button
          type="button"
          onClick={() => router.push("/dashboard/branches")}
          className="mt-4 rounded-xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
        >
          Back to branches
        </button>
      </div>
    );
  }

  return (
    <EditBranchForm
      key={currentBranch.id}
      branch={currentBranch}
      staff={staff}
      saveBranch={saveBranch}
      router={router}
    />
  );
}

type EditBranchFormProps = {
  branch: Branch;
  staff: Array<{
    id: string;
    name: string;
  }>;
  saveBranch: (branch: Branch) => void;
  router: ReturnType<typeof useRouter>;
};

function EditBranchForm({
  branch,
  staff,
  saveBranch,
  router,
}: EditBranchFormProps) {
  const [name, setName] = useState(branch.name);
  const [address, setAddress] = useState(branch.address);
  const [phone, setPhone] = useState(branch.phone);
  const [managerId, setManagerId] = useState(branch.managerId || "");

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
      const updatedBranch: Branch = {
        id: branch.id,
        name: trimmedName,
        address: trimmedAddress,
        phone: trimmedPhone,
        managerId,
      };

      saveBranch(updatedBranch);

      toast.success("Branch updated successfully.");

      router.push("/dashboard/branches");
    } catch {
      toast.error("Could not update the branch. Please try again.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl py-2 sm:py-4">
      <div className="mb-7 border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Link
            href="/dashboard"
            className="hover:text-neutral-900"
          >
            Dashboard
          </Link>

          <ChevronRight size={15} />

          <Link
            href="/dashboard/branches"
            className="hover:text-neutral-900"
          >
            Branches
          </Link>

          <ChevronRight size={15} />

          <strong className="text-primary-900">
            Edit branch
          </strong>
        </div>

        <h1 className="mt-2 text-2xl font-bold text-neutral-900">
          Edit branch
        </h1>

        <p className="mt-1 text-sm text-neutral-600">
          Update agency location information and details.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-900">
              Branch Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Pokhara Office"
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900">
              Address
            </label>

            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., Lakeside, Pokhara"
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900">
              Phone
            </label>

            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., +977 61 520000"
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900">
              Branch Manager
            </label>

            <select
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">Select Manager</option>

              {staff.map((person) => (
                <option
                  key={person.id}
                  value={person.id}
                >
                  {person.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4">
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
            Update branch
          </button>
        </div>
      </form>
    </div>
  );
}