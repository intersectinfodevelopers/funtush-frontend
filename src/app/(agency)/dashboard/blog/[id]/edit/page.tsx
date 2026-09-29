"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import BlogForm from "@/components/agency/blog/BlogForm";
import { useBlogs } from "@/hooks/useAgencyBlog";

export default function EditBlogPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useBlogs();
  const post = data?.data.find((p) => p.id === id);
  if (isLoading) return <div className="mx-auto h-40 max-w-6xl animate-pulse border border-neutral-200 bg-white" />;
  if (!post) return <div className="mx-auto max-w-6xl border border-neutral-200 bg-white p-6 text-sm text-neutral-700">This post doesn&apos;t exist. <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/blog">Back to blog</Link></div>;
  return <BlogForm post={post} />;
}
