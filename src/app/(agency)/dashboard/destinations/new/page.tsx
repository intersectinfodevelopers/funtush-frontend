"use client";

import { useRouter } from "next/navigation";
import DestinationForm from "@/components/agency/destinations/DestinationForm";

export default function NewDestinationPage() {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col gap-5 min-h-0">
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
            onClick={() => router.push("/dashboard/destinations")}
            className="hover:text-neutral-900"
          >
            Destinations
          </button>

          <span className="text-neutral-300">/</span>

          <span className="font-semibold text-neutral-900">
            New destination
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-bold text-neutral-900">
          Add destination
        </h1>

        <p className="mt-1 text-sm text-neutral-600">
          Create a new destination and configure its details.
        </p>
      </div>

      <DestinationForm isNew />
    </div>
  );
}
