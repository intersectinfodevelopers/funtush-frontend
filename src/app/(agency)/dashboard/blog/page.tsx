"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowUpRight, BarChart3, CheckCircle2, Eye, FileText } from "lucide-react";
import { DeleteOutlined, EditOutlined, VisibilityOutlined } from "@mui/icons-material";
import blogsData from "../../../../../data/blogs.json";
import { Pagination } from "@/components/ui/pagination";

type BlogPost = {
  id: number;
  title: string;
  description: string;
  category: string;
  author: { name: string; avatar: string };
  date: string;
  time: string;
  status: "Draft" | "Scheduled" | "Published" | "Archived";
  views: string;
  likes: number;
  thumbnail: string;
};

const initialPosts = blogsData.blogs as BlogPost[];

export default function BlogPage() {
  const router = useRouter();
  // Start with server-safe initialPosts to keep SSR and first client render consistent.
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);

  // On mount, hydrate posts from localStorage if present so runtime edits are reflected.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedPosts = window.localStorage.getItem("funtush_blog_posts");
      if (!storedPosts) {
        window.localStorage.setItem("funtush_blog_posts", JSON.stringify(initialPosts));
        return;
      }
      const parsed = JSON.parse(storedPosts);
      if (Array.isArray(parsed) && parsed.length > 0) setPosts(parsed as BlogPost[]);
    } catch {
      // ignore parse errors and keep initialPosts
    }
  }, []);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialog, setDialog] = useState<{ type: "edit" | "delete"; post: BlogPost } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("funtush_blog_posts", JSON.stringify(posts));
  }, [posts]);

  const categories = useMemo(() => Array.from(new Set(posts.map((post) => post.category))), [posts]);
  const filteredPosts = useMemo(() => posts.filter((post) => {
    const query = search.toLowerCase();
    return (
      (post.title.toLowerCase().includes(query) || post.description.toLowerCase().includes(query)) &&
      (category === "all" || post.category === category) &&
      (status === "all" || post.status === status)
    );
  }), [category, posts, search, status]);
  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / perPage));
  const pagePosts = filteredPosts.slice((currentPage - 1) * perPage, currentPage * perPage);
  const publishedCount = posts.filter((post) => post.status === "Published").length;
  const draftCount = posts.filter((post) => post.status === "Draft").length;
  const archivedCount = posts.filter((post) => post.status === "Archived").length;

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <button type="button" onClick={() => router.push("/dashboard")} className="hover:text-neutral-900">Dashboard</button>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">All Blogs</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-neutral-900">All Blogs</h1>
          <p className="mt-1 text-sm text-neutral-600">Manage and organize all your blog posts.</p>
        </div>
        <button type="button" onClick={() => router.push("/dashboard/blog/new")} className="w-fit rounded-2xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800">+ Add new Blog</button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total Blogs" value={posts.length} tone="primary" />
        <SummaryCard label="Published" value={publishedCount} tone="success" />
        <SummaryCard label="Draft" value={draftCount} tone="warning" />
        <SummaryCard label="Total Views" value={posts.reduce((total, post) => total + parseViews(post.views), 0).toLocaleString()} tone="accent" />
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px_180px]">
        <input value={search} onChange={(event) => { setSearch(event.target.value); setCurrentPage(1); }} placeholder="Search blogs" className="rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
        <select value={category} onChange={(event) => { setCategory(event.target.value); setCurrentPage(1); }} className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select value={status} onChange={(event) => { setStatus(event.target.value); setCurrentPage(1); }} className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"><option value="all">All status</option><option value="Published">Published</option><option value="Draft">Draft</option><option value="Archived">Archived</option><option value="Scheduled">Scheduled</option></select>
      </div>

      <div className="overflow-x-auto border-b border-neutral-200">
        <div className="flex min-w-max items-center gap-5 sm:gap-8">
          <StatusTab label="All" active={status === "all"} count={posts.length} onClick={() => setStatus("all")} />
          <StatusTab label="Published" active={status === "Published"} count={publishedCount} onClick={() => setStatus("Published")} />
          <StatusTab label="Draft" active={status === "Draft"} count={draftCount} onClick={() => setStatus("Draft")} />
          <StatusTab label="Archived" active={status === "Archived"} count={archivedCount} onClick={() => setStatus("Archived")} />
        </div>
      </div>

      <div className="overflow-x-auto border-t border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            <tr><th className="px-4 py-3">S.NO</th><th className="px-4 py-3">Blog</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Author</th><th className="px-4 py-3">Published date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Views</th><th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody>
            {pagePosts.map((post, index) => (
              <tr key={post.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                <td className="px-4 py-3 font-semibold text-neutral-900">{(currentPage - 1) * perPage + index + 1}</td>
                <td className="max-w-sm px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      <Image src={`/${post.thumbnail}`} alt="" fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="font-semibold text-neutral-900">{post.title}</div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{post.category}</span></td>
                <td className="px-4 py-3 text-neutral-700">{post.author?.name ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-700">{post.date}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${post.status === "Published" ? "bg-success-50 text-success-700" : post.status === "Draft" ? "bg-warning-50 text-warning-700" : post.status === "Archived" ? "bg-danger-50 text-danger-700" : "bg-neutral-100 text-neutral-700"}`}>{post.status}</span></td>
                <td className="px-4 py-3 text-neutral-700">{post.views}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><ActionButton label="View" tone="primary" onClick={() => router.push(`/dashboard/blog/${post.id}`)}><VisibilityOutlined sx={{ fontSize: 18 }} /></ActionButton><ActionButton label="Edit" tone="warning" onClick={() => setDialog({ type: "edit", post })}><EditOutlined sx={{ fontSize: 18 }} /></ActionButton><ActionButton label="Delete" tone="danger" onClick={() => setDialog({ type: "delete", post })}><DeleteOutlined sx={{ fontSize: 18 }} /></ActionButton></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {pagePosts.length === 0 && <p className="px-4 py-8 text-center text-sm text-neutral-500">No blog posts found.</p>}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {dialog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><h2 className="text-lg font-semibold text-neutral-900">{dialog.type === "delete" ? "Delete blog post?" : "Edit blog post?"}</h2><p className="mt-2 text-sm leading-6 text-neutral-600">{dialog.type === "delete" ? `Remove ${dialog.post.title} from the blog list?` : `Open ${dialog.post.title} in the editor?`}</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setDialog(null)} className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900">Cancel</button><button type="button" onClick={() => { if (dialog.type === "edit") router.push(`/dashboard/blog/${dialog.post.id}/edit`); else setPosts((items) => items.filter((post) => post.id !== dialog.post.id)); setDialog(null); }} className={`rounded-2xl px-4 py-2 text-sm font-semibold text-white ${dialog.type === "delete" ? "bg-danger-600" : "bg-primary-900"}`}>{dialog.type === "delete" ? "Delete post" : "Continue"}</button></div></div></div>}
    </div>
  );
}

function parseViews(value: number | string) {
  const s = String(value ?? "");
  const numeric = Number.parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
  return /k/i.test(s) ? numeric * 1000 : numeric;
}
function SummaryCard({ label, value, tone }: { label: string; value: number | string; tone: "primary" | "success" | "warning" | "accent" }) {
  const styles = {
    primary: { card: "border-primary-100 bg-primary-50", icon: "bg-primary-900 text-white", Icon: FileText },
    success: { card: "border-success-100 bg-success-50", icon: "bg-success-600 text-white", Icon: CheckCircle2 },
    warning: { card: "border-warning-100 bg-warning-50", icon: "bg-warning-500 text-white", Icon: BarChart3 },
    accent: { card: "border-accent-100 bg-accent-50", icon: "bg-accent-600 text-white", Icon: Eye },
  };
  const style = styles[tone];
  const Icon = style.Icon;

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${style.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${style.icon}`}><Icon className="h-4 w-4" /></div>
        <ArrowUpRight className="h-4 w-4 text-success-600" />
      </div>
      <p className="mt-3 text-sm font-semibold text-neutral-700">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
      <p className="mt-2 flex items-center gap-1 text-xs text-neutral-600"><span className="font-semibold text-success-700">12.5%</span> from last month</p>
    </div>
  );
}
function StatusTab({ label, active, count, onClick }: { label: string; active: boolean; count: number; onClick: () => void }) { return <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold ${active ? "border-primary-900 text-primary-900" : "border-transparent text-neutral-600 hover:border-neutral-300"}`}>{label}<span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">{count}</span></button>; }
function ActionButton({ label, tone, onClick, children }: { label: string; tone: "primary" | "warning" | "danger"; onClick: () => void; children: React.ReactNode }) { const styles = { primary: "bg-primary-50 text-primary-700 hover:bg-primary-100", warning: "bg-warning-50 text-warning-700 hover:bg-warning-100", danger: "bg-danger-50 text-danger-700 hover:bg-danger-100" }; return <button type="button" title={label} aria-label={label} onClick={onClick} className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${styles[tone]}`}>{children}</button>; }
