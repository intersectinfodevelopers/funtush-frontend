"use client";
import { useState } from "react";
import Link from "next/link";
import { TierLockBlog } from "@/components/agency/blog/TierLockBlog";

interface BlogPost {
  id: string;
  title: string;
  status: "Draft" | "Scheduled" | "Published";
  date: string;
  views: number;
}

export default function Page() {
  const fallbackMock: BlogPost[] = [
    { id: "post-1", title: "Top 10 High Altitude Safety Protocols for Everest Expeditions", status: "Published", date: "2026-06-12", views: 1420 }
  ];
  const [agencyTier, setAgencyTier] = useState<"Free" | "Small" | "Medium" | "Large">("Medium");
  const [posts] = useState<BlogPost[]>(() => {
  if (typeof window !== "undefined") { 
    const localData = localStorage.getItem("funtush_blog_posts");
    return localData ? JSON.parse(localData) : fallbackMock;
  }
  return fallbackMock;
});



  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative min-h-[80vh]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Content Marketing Suite</h1>
          <p className="text-sm text-slate-500 mt-0.5">Author SEO articles, organize scheduled travel insights, and track page views.</p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <div className="flex items-center gap-1 border bg-slate-50 px-2 py-1 rounded-lg text-[11px]">
            <span className="text-slate-400">Tier:</span>
            <select
              value={agencyTier}
              onChange={(e) => setAgencyTier(e.target.value as "Free" | "Small" | "Medium" | "Large")}
              className="bg-transparent font-semibold text-slate-700 outline-hidden cursor-pointer"
            >
              <option value="Free">Free (Locked)</option>
              <option value="Small">Small (Locked)</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>

          {agencyTier !== "Free" && agencyTier !== "Small" && (
            <Link
              href="/dashboard/blog/new"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xs transition-colors"
            >
              + Author New Post
            </Link>
          )}
        </div>
      </div>

      <div className="relative min-h-[350px] bg-white rounded-xl border border-slate-200/60 shadow-xs overflow-hidden">
        <TierLockBlog currentTier={agencyTier} onUpgrade={() => setAgencyTier("Medium")} />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3.5">Article Title</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Publish Target Date</th>
                <th className="p-3.5 text-right">Telemetry Views</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="p-3.5 font-bold text-slate-800 truncate max-w-sm">{post.title}</td>
                  <td className="p-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${post.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        post.status === 'Scheduled' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-slate-100 text-slate-600'
                      }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">{post.date}</td>
                  <td className="p-3.5 text-right font-mono text-slate-700 font-bold">{post.views.toLocaleString()}</td>
                  <td className="p-3.5 text-center">
                    <Link
                      href={`/dashboard/blog/${post.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Modify
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}