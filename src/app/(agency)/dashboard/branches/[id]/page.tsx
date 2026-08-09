"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import BranchForm from "@/components/agency/branches/BranchForm";
import { useBranches } from "@/hooks/useBranches";
export default function EditBranchPage() {
  const { id } = useParams<{ id: string }>();
  const { getBranch } = useBranches();
  const branch = getBranch(id);
  if (!branch)
    return (
      <div className="p-8 text-center text-neutral-600">
        Branch not found.{" "}
        <Link className="text-primary-700 underline" href="/dashboard/branches">
          Back to branches
        </Link>
      </div>
    );
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Link href="/dashboard">Dashboard</Link>
          <ChevronRight size={15} />
          <Link href="/dashboard/branches">Branches</Link>
          <ChevronRight size={15} />
          <strong className="text-primary-900">{branch.name}</strong>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">
          Edit branch
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Update the branch details and manager.
        </p>
      </div>
      <BranchForm branch={branch} />
    </div>
  );
}
