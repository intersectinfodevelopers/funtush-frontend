import Link from "next/link";
import { ChevronRight } from "lucide-react";
import BranchForm from "@/components/agency/branches/BranchForm";
export default function NewBranchPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Link href="/dashboard">Dashboard</Link>
          <ChevronRight size={15} />
          <Link href="/dashboard/branches">Branches</Link>
          <ChevronRight size={15} />
          <strong className="text-primary-900">New branch</strong>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">New branch</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Add a location and assign the responsible manager.
        </p>
      </div>
      <BranchForm />
    </div>
  );
}
