"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TipTapEditor } from "./TipTapEditor";
import { useTheme } from "@/context/theme";
import Image from "next/image";
import { Eye, Plus, Sparkles, Upload } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  status: "Published" | "Scheduled" | "Draft";
  date: string;
  views: number;
}

interface BlogFormSharedProps {
  postId?: string;
}

export function BlogFormShared({ postId }: BlogFormSharedProps) {
  // const { isDark } = useTheme();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Draft");
  const [publishDate, setPublishDate] = useState("Jul 19, 2026 10:30 AM");
  const [tag, setTag] = useState("");
  const [photoOption, setPhotoOption] = useState<"local" | "gallery">("local");

  useEffect(() => {
    if (!postId) return;

    const data = localStorage.getItem("funtush_blog_posts");
    if (data) {
      const posts: BlogPost[] = JSON.parse(data);
      const target = posts.find((p) => p.id === postId);
      if (target) {
        setTimeout(() => {
          setTitle(target.title);
        }, 0);
      }
    }
  }, [postId]);

  const handleSave = (e?: React.FormEvent, targetStatus?: string) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const currentRecords = localStorage.getItem("funtush_blog_posts");
    let recordsList: BlogPost[] = currentRecords ? JSON.parse(currentRecords) : [];

    const finalStatus = targetStatus || status;
    const dateValue = new Date().toISOString().split("T")[0];

    if (postId) {
      recordsList = recordsList.map((item) =>
        item.id === postId ? { ...item, title, status: finalStatus as any, date: dateValue } : item
      );
    } else {
      const newPost: BlogPost = {
        id: `post-${Math.floor(100 + Math.random() * 900)}`,
        title,
        status: finalStatus as any,
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#070e1b] text-gray-900 dark:text-slate-200 p-6 transition-colors">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between max-w-7xl mx-auto mb-6 gap-4">
        <div>
          <div className="flex items-center text-xs text-gray-500 dark:text-slate-400 gap-1.5 mb-2">
            <span>Dashboard</span>
            <Image src="/formkit_down.png" alt="sidearrow" width={12} height={12} className="object-contain opacity-60" />
            <span>All Blogs</span>
            <Image src="/formkit_down.png" alt="sidearrow" width={12} height={12} className="object-contain opacity-60" />
            <span className="text-slate-200">Add Blogs</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">All Blogs</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Create and Published a new blogs post</p>
        </div> 

        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => handleSave(undefined, "Draft")}
            className="px-4 py-2 rounded-lg bg-[#0d1b32] hover:bg-[#132644] text-slate-200 text-xs font-semibold border border-[#1b2a47] transition-colors"
          >
            Save as Draft
          </button>
          <button 
            type="button" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0d1b32] hover:bg-[#132644] text-slate-200 text-xs font-semibold border border-[#1b2a47] transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
          <button 
            type="button" 
            onClick={(e) => handleSave(e, "Published")}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-gray-900 dark:text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Publish
          </button>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 max-w-7xl mx-auto gap-6">
        
        {/* Left Column: Form Inputs & Editor */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0d1b32] border border-gray-200 dark:border-[#1b2a47] rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSave} className="space-y-5 text-xs">
            
            {/* Blog Title */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-gray-900 dark:text-white">Blog title</label>
                <span className="text-[10px] text-slate-500">{title.length}/100</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Enter blog this here..."
                className="w-full rounded-lg bg-[#111B3A] text-gray-900 dark:text-white border border-[#233a5e] px-3.5 py-2.5 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              />
            </div>

            {/* Sub Title */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-gray-900 dark:text-white">Sub title</label>
                <span className="text-[10px] text-slate-500">{subtitle.length}/100</span>
              </div>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                maxLength={100}
                placeholder="Enter sub title.."
                className="w-full rounded-lg bg-[#111B3A] text-gray-900 dark:text-white border border-[#233a5e] px-3.5 py-2.5 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              />
            </div>

            {/* Content & TipTap Editor */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-gray-900 dark:text-white">Content</label>
                <button type="button" className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 font-medium">
                  <Sparkles className="w-3 h-3" />
                  Copy-writing tips
                </button>
              </div>
              
              <TipTapEditor content={htmlContent} onChange={setHtmlContent} />
              
              <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-500 px-1">
                <span>0 Words</span>
              </div>
            </div>

            {/* YouTube Link */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-gray-900 dark:text-white">YouTube Link</label>
                <span className="text-[10px] text-slate-500">{youtubeLink.length}/100</span>
              </div>
              <input
                type="text"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                maxLength={100}
                placeholder="Your You Tube link here.."
                className="w-full rounded-lg bg-[#111B3A] text-gray-900 dark:text-white border border-[#233a5e] px-3.5 py-2.5 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              />
            </div>

          </form>
        </div>

        {/* Right Column: Publish Settings Sidebar */}
        <div className="bg-white dark:bg-[#0d1b32] border border-gray-200 dark:border-[#1b2a47] rounded-xl p-6 shadow-xl space-y-5 h-fit">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm border-b border-[#1b2a47] pb-3">Publish Settings</h3>

          {/* Select Category */}
          <div className="space-y-1.5">
            <label className="block font-bold text-gray-900 dark:text-white">Select Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-[#233a5e] px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-[#111B3A] text-slate-300 appearance-none"
            >
              <option value="" disabled>Select Category</option>
              <option value="tech">Technology</option>
              <option value="marketing">Marketing</option>
              <option value="lifestyle">Lifestyle</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="block font-bold text-gray-900 dark:text-white">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-[#233a5e] px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-[#111B3A] text-slate-300 appearance-none"
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>

          {/* Publish Date */}
          <div className="space-y-1.5">
            <label className="block font-bold text-gray-900 dark:text-white">Publish Date</label>
            <div className="relative">
              <input
                type="text"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full rounded-lg bg-[#111B3A] text-gray-900 dark:text-white border border-[#233a5e] px-3.5 py-2.5 pr-10 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-slate-400">
                <Image src="/calendar.png" alt="date" width={16} height={16} />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Set the date and time to publish the blog.</p>
          </div>

          {/* Tag */}
          <div className="space-y-1.5">
            <label className="block font-bold text-gray-900 dark:text-white">Tag</label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full rounded-lg border border-[#233a5e] px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-[#111B3A] text-slate-300 appearance-none"
            >
              <option value="" disabled>Enter tags and press comma....</option>
              <option value="marketing">Marketing</option>
              <option value="seo">SEO</option>
              <option value="tips">Tips</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">Example: Marketing, SEO, tips</p>
          </div>

          {/* Photos Upload Section */}
          <div className="space-y-2 pt-2">
            <label className="block font-bold text-gray-900 dark:text-white">Photos</label>
            
            <div className="flex items-center gap-4 text-xs text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="radio" 
                  name="photoSource" 
                  checked={photoOption === "local"} 
                  onChange={() => setPhotoOption("local")}
                  className="accent-blue-600"
                />
                Upload from Local Drive
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="radio" 
                  name="photoSource" 
                  checked={photoOption === "gallery"} 
                  onChange={() => setPhotoOption("gallery")}
                  className="accent-blue-600"
                />
                Add from Gallery
              </label>
            </div>

            {/* Drag & Drop Box */}
            <div className="border border-dashed border-[#233a5e] rounded-xl p-6 text-center bg-[#111B3A]/50 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#162947] flex items-center justify-center text-gray-500 dark:text-slate-400">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-300 font-medium">Drag & drop Image here</p>
                <p className="text-[11px] text-slate-500">Or</p>
              </div>
              <button 
                type="button"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-gray-900 dark:text-white font-medium text-xs transition-colors shadow-md shadow-blue-600/20"
              >
                Upload Image
              </button>
            </div>

            <p className="text-[10px] text-slate-500 text-center mt-1">Recommended size: 1200*628px (Max, 2MB)</p>
          </div>

        </div>

      </div>
    </div>
  );
}