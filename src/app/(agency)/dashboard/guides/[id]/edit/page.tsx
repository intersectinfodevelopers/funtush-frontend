"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import GuideForm from "@/components/agency/guides/GuideForm";
import { useGuideDetail } from "@/hooks/useAgencyGuides";

export default function EditGuidePage() {
  const { id } = useParams<{ id: string }>();
  const { data: guide, isLoading } = useGuideDetail(id);
  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (!guide) return <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-700">This guide doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/guides">Back to guides</Link></div>;
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 py-2 sm:py-4">
      <div className="border-b border-neutral-200 pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link>
          <span className="text-neutral-300">/</span>
          <Link href="/dashboard/guides" className="hover:text-neutral-900">Guides</Link>
          <span className="text-neutral-300">/</span>
          <Link href={`/dashboard/guides/${id}`} className="hover:text-neutral-900">{guide.name}</Link>
          <span className="text-neutral-300">/</span>
          <span className="font-semibold text-primary-900">Edit</span>
        </nav>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">Edit guide</h1>
        <p className="mt-1 text-sm text-neutral-600">Update this guide&apos;s profile, languages and certifications.</p>
      </div>
      <GuideForm guide={guide} />
    </div>
  );
}
