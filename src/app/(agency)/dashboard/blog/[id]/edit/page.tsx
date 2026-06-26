"use client";
import { use } from "react";
import { BlogFormShared } from "@/components/agency/blog/BlogFormShared";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const unwrappedParams = use(params);
  
  return <BlogFormShared postId={unwrappedParams.id} />;
}