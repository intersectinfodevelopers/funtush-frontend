"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import VideoForm from "@/components/agency/videos/VideoForm";
import { useVideo } from "@/hooks/useAgencyMedia";

export default function EditVideoPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useVideo(id);
  if (isLoading) return <div className="mx-auto h-40 max-w-3xl animate-pulse border border-neutral-200 bg-white" />;
  if (!data) return <div className="mx-auto max-w-3xl border border-neutral-200 bg-white p-6 text-sm text-neutral-700">This video doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/videos">Back to videos</Link></div>;
  return <VideoForm video={data} />;
}
