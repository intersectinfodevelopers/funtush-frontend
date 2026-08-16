"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import GuideForm from "@/components/agency/guides/GuideForm";
import { useGuides } from "@/hooks/useGuides";

export default function EditGuidePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { getGuide, updateGuide } = useGuides();

  const guide = getGuide(params.id);

  if (!guide) {
    return (
      <div className="mx-auto w-full max-w-6xl py-6">
        <p className="text-sm text-neutral-600">Guide not found.</p>
      </div>
    );
  }

  const handleSave = (data: Parameters<typeof updateGuide>[1]) => {
    try {
      updateGuide(params.id, {
        ...data,
        id: params.id,
      });
      toast.success("Guide updated successfully.");
      router.push("/dashboard/guides");
    } catch {
      toast.error("Could not update the guide. Please try again.");
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="mb-6">
        <div>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Link href="/dashboard">Dashboard</Link>
            <ChevronRight size={15} />
            <Link href="/dashboard/guides" className="transition hover:text-primary-700">
              Guides
            </Link>
            <ChevronRight size={15} />
            <span className="font-semibold text-primary-900">Edit guide</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Update guide</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Adjust the guide profile and certification details.
          </p>
        </div>
      </div>

      <GuideForm
        initialData={{
          name: guide.name,
          email: guide.email,
          phone: guide.phone,
          photo: guide.photo,
          bio: guide.bio,
          languages: guide.languages,
          certifications: guide.certifications,
          status: guide.status,
          rating: guide.rating,
          totalTreks: guide.totalTreks,
          upcomingAssignments: guide.upcomingAssignments,
        }}
        onSave={handleSave}
        isNew={false}
      />
    </div>
  );
}
