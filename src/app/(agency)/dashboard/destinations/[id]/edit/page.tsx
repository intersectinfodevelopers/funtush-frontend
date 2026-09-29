"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import DestinationForm from "@/components/agency/destinations/DestinationForm";
import { useDestination } from "@/hooks/useAgencyDestinations";

export default function EditDestinationPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useDestination(id);
  if (isLoading) return <div className="mx-auto h-40 max-w-6xl animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (!data) return <div className="mx-auto max-w-6xl rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-700">This destination doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/destinations">Back to destinations</Link></div>;
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 py-2 sm:py-4">
      <div className="border-b border-neutral-200 pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link>
          <span className="text-neutral-300">/</span>
          <Link href="/dashboard/destinations" className="hover:text-neutral-900">Destinations</Link>
          <span className="text-neutral-300">/</span>
          <Link href={`/dashboard/destinations/${id}`} className="hover:text-neutral-900">{data.title}</Link>
          <span className="text-neutral-300">/</span>
          <span className="font-semibold text-primary-900">Edit</span>
        </nav>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Edit destination</h1>
        <p className="mt-1 text-sm text-neutral-600">Update this destination&apos;s details.</p>
      </div>
      <DestinationForm destination={data} />
    </div>
  );
}
