"use client";

import { useParams, useRouter } from "next/navigation";
import blogsData from "../../../../../../data/blogs.json";

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const post = blogsData.blogs.find((item) => String(item.id) === id);

  if (!post) return <div className="p-6 text-sm text-neutral-500">Blog post not found.</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <button type="button" onClick={() => router.push("/dashboard/blog")} className="text-sm font-medium text-primary-900 hover:underline">← Back to blogs</button>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Blog post</p><h1 className="mt-1 text-2xl font-bold text-neutral-900">{post.title}</h1><p className="mt-1 text-sm text-neutral-600">{post.description}</p></div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${post.status === "Published" ? "bg-success-50 text-success-700" : "bg-warning-50 text-warning-700"}`}>{post.status}</span>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Category</p><p className="mt-2 font-semibold text-neutral-900">{post.category}</p></div><div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Author</p><p className="mt-2 font-semibold text-neutral-900">{post.author.name}</p></div><div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Views</p><p className="mt-2 font-semibold text-neutral-900">{post.views}</p></div></div>
      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"><p className="text-sm leading-7 text-neutral-700">{post.description}</p><p className="mt-4 text-xs text-neutral-500">Published {post.date} at {post.time}</p><div className="mt-5 flex justify-end"><button type="button" onClick={() => router.push(`/dashboard/blog/${post.id}/edit`)} className="rounded-2xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800">Edit post</button></div></section>
    </div>
  );
}