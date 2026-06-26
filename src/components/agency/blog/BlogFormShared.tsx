"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TipTapEditor } from "./TipTapEditor";
import { BlogSEOPanel } from "./BlogSEOPanel";
import { BlogScheduler } from "./BlogScheduler";

interface BlogPost {
  id: string;
  title: string;
  status: "Published" | "Scheduled";
  date: string;
  views: number;
}

interface BlogFormSharedProps {
  postId?: string; 
}

export function BlogFormShared({ postId }: BlogFormSharedProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [htmlContent, setHtmlContent] = useState("<p>Begin writing article content segments...</p>");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [seoOpen, setSeoOpen] = useState(false);
  const [seo, setSeo] = useState({ metaTitle: "", metaDescription: "", ogImage: "" });

  useEffect(() => {
    if (!postId) return;

    const data = localStorage.getItem("funtush_blog_posts");
    if (data) {
      const posts: BlogPost[] = JSON.parse(data);
      const target = posts.find((p) => p.id === postId);
      if (target) {
       setTimeout(() => {
          setTitle(target.title);
          setSeo({ 
            metaTitle: target.title, 
            metaDescription: "Stored description snippet", 
            ogImage: "" 
          });
        }, 0);
      }
    }
  }, [postId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const currentRecords = localStorage.getItem("funtush_blog_posts");
    let recordsList: BlogPost[] = currentRecords ? JSON.parse(currentRecords) : [];

    const statusValue = isScheduled ? "Scheduled" : "Published";
    const dateValue = isScheduled && scheduledDateTime ? scheduledDateTime.split("T")[0] : new Date().toISOString().split("T")[0];

    if (postId) {
      recordsList = recordsList.map((item) => 
        item.id === postId ? { ...item, title, status: statusValue, date: dateValue } : item
      );
    } else {
      const newPost: BlogPost = {
        id: `post-${Math.floor(100 + Math.random() * 900)}`,
        title,
        status: statusValue,
        date: dateValue,
        views: 0
      };
      recordsList = [newPost, ...recordsList];
    }

    localStorage.setItem("funtush_blog_posts", JSON.stringify(recordsList));
    alert(postId ? "Post adjustments committed successfully!" : "New campaign article initialized successfully!");
    router.push("/dashboard/blog");
  };

  return (
    <form onSubmit={handleSave} className="p-6 max-w-4xl mx-auto space-y-6 text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{postId ? "Modify Campaign Blueprint" : "Initialize New Core Article"}</h2>
          <p className="text-slate-400 mt-0.5">Author deep operational insights or marketing dispatches below.</p>
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-xs transition-colors"
        >
          {postId ? "Commit Adjustments" : "Deploy Post"}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Article Headline *</label>
          <input
            type="text"
            required
            placeholder="e.g., Tactical Oxygen Route Navigation Layout Matrix"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-slate-800 font-bold focus:ring-1 focus:ring-blue-500 outline-hidden text-sm"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Rich Text Content Editor Canvas</label>
          <TipTapEditor content={htmlContent} onChange={setHtmlContent} />
        </div>

        <BlogScheduler 
          isScheduled={isScheduled} 
          onToggleSchedule={setIsScheduled} 
          scheduledDateTime={scheduledDateTime} 
          onDateTimeChange={setScheduledDateTime} 
        />

        <BlogSEOPanel 
          isOpen={seoOpen} 
          onToggle={() => setSeoOpen(!seoOpen)} 
          metadata={seo} 
          onChange={setSeo} 
        />
      </div>
    </form>
  );
}