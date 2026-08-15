"use client";

import { useRouter } from "next/navigation";
import PackageBuilderForm from "@/components/agency/packages/PackageBuilderForm";

export default function NewPackagePage() {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-6xl py-2 sm:py-4">
      <div className="mb-7 border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <button type="button" onClick={() => router.push("/dashboard")} className="hover:text-neutral-900">
            Dashboard
          </button>
          <span className="text-neutral-300">/</span>
          <button type="button" onClick={() => router.push("/dashboard/packages")} className="hover:text-neutral-900">
            Packages
          </button>
          <span className="text-neutral-300">/</span>
          <span className="font-semibold text-neutral-900">New package</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Add package</h1>
        <p className="mt-1 text-sm text-neutral-600">Create a new trekking package and configure its details.</p>
      </div>

      <PackageBuilderForm isNew />
    </div>
  );
}
