"use client";

import Link from "next/link";
import DestinationForm from "@/components/agency/destinations/DestinationForm";

export default function NewDestinationPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 py-2 sm:py-4">
      <div className="border-b border-neutral-200 pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link>
          <span className="text-neutral-300">/</span>
          <Link href="/dashboard/destinations" className="hover:text-neutral-900">Destinations</Link>
          <span className="text-neutral-300">/</span>
          <span className="font-semibold text-primary-900">New destination</span>
        </nav>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Add destination</h1>
        <p className="mt-1 text-sm text-neutral-600">Create a new destination and configure its details.</p>
      </div>
      <DestinationForm />
    </div>
  );
}
