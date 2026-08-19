"use client";

import { useRouter } from "next/navigation";
import AdvertisementForm from "@/components/agency/advertisements/AdvertisementForm";

export default function NewAdvertisementPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-0 w-full flex-col gap-5">
      <div className="mb-7 border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="hover:text-neutral-900"
          >
            Dashboard
          </button>

          <span className="text-neutral-300">/</span>

          <button
            type="button"
            onClick={() => router.push("/dashboard/advertisements")}
            className="hover:text-neutral-900"
          >
            Advertisements
          </button>

          <span className="text-neutral-300">/</span>

          <span className="font-semibold text-neutral-900">
            New advertisement
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-bold text-neutral-900">
          Add Advertisement
        </h1>

        <p className="mt-1 text-sm text-neutral-600">
          Create a new advertisement and configure its details.
        </p>
      </div>

      <AdvertisementForm />
    </div>
  );
}
