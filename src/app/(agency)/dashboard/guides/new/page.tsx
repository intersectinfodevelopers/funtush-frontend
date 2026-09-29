"use client";

import Link from "next/link";
import GuideForm from "@/components/agency/guides/GuideForm";

export default function NewGuidePage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 py-2 sm:py-4">
      <div className="border-b border-neutral-200 pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link>
          <span className="text-neutral-300">/</span>
          <Link href="/dashboard/guides" className="hover:text-neutral-900">Guides</Link>
          <span className="text-neutral-300">/</span>
          <span className="font-semibold text-primary-900">New guide</span>
        </nav>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Add guide</h1>
        <p className="mt-1 text-sm text-neutral-600">Create a new guide profile with a clean dashboard form layout.</p>
      </div>
      <GuideForm />
    </div>
  );
}
