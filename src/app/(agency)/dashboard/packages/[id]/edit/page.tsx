"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import PackageBuilderForm from "@/components/agency/packages/PackageBuilderForm";

export default function EditPackagePage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 py-2 sm:py-4">
      <div className="border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link>
          <span className="text-neutral-300">/</span>
          <Link href="/dashboard/packages" className="hover:text-neutral-900">Packages</Link>
          <span className="text-neutral-300">/</span>
          <Link href={`/dashboard/packages/${id}`} className="hover:text-neutral-900">Details</Link>
          <span className="text-neutral-300">/</span>
          <span className="font-semibold text-primary-900">Edit</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Edit package</h1>
      </div>
      <PackageBuilderForm packageId={id} />
    </div>
  );
}
