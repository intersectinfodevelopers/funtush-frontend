"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

import { useTheme } from "@/context/theme";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { QuillEditor } from "./QuillEditor";

import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import SparklesIcon from "@mui/icons-material/AutoAwesome";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ImageIcon from "@mui/icons-material/Image";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  htmlContent?: string;
  category?: string;
  status: "Published" | "Scheduled" | "Draft";
  publishDate?: string;
  tag?: string;
  photoOption?: "local" | "gallery";
  photoUrl?: string;
  date: string;
  views: number;
}

interface BlogFormSharedProps {
  postId?: string;
}

interface FormErrors {
  title: string;
  content: string;
  category: string;
  publishDate: string;
  photo: string;
}

interface GalleryImage {
  id: string;
  url: string;
  title?: string;
  owner?: string;
}

const STATIC_FALLBACK_IMAGES: GalleryImage[] = [
  { id: "1", url: "/images/coding.jpg", title: "Coding Setup", owner: "Tech" },
  { id: "2", url: "/images/editor.jpg", title: "Code Editor", owner: "Developer" },
  { id: "3", url: "/images/workspace.jpg", title: "Laptop Workspace", owner: "Office" },
  { id: "4", url: "/images/matrix.jpg", title: "Matrix Code", owner: "Security" },
  { id: "5", url: "/images/webdev.jpg", title: "Web Development", owner: "Design" },
  { id: "6", url: "/images/analytics.jpg", title: "Analytics Dashboard", owner: "Marketing" },
  { id: "7", url: "/images/growth.jpg", title: "Business Growth", owner: "Strategy" },
  { id: "8", url: "/images/team.jpg", title: "Team Collaboration", owner: "Work" },
  { id: "9", url: "/images/discussion.jpg", title: "Creative Discussion", owner: "Team" },
  { id: "10", url: "/images/coffee.jpg", title: "Coffee & Notebook", owner: "Lifestyle" },
];

export function BlogFormShared({ postId }: BlogFormSharedProps) {
  const router = useRouter();
  const { isDark } = useTheme();

  /* --------------------------------------------------
     Form State
  -------------------------------------------------- */
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Draft");
  const [publishDate, setPublishDate] = useState("Jul 19, 2026 10:30 AM");
  const [tag, setTag] = useState("");

  const [selectedGalleryImage, setSelectedGalleryImage] = useState<GalleryImage | null>(null);
  const [photoOption, setPhotoOption] = useState<"local" | "gallery">("local");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  /* --------------------------------------------------
     Gallery & Tag States
  -------------------------------------------------- */
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [gallerySearch, setGallerySearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  /* --------------------------------------------------
     Centralized Errors
  -------------------------------------------------- */
  const [errors, setErrors] = useState<FormErrors>({
    title: "",
    content: "",
    category: "",
    publishDate: "",
    photo: "",
  });

  /* --------------------------------------------------
     Load Gallery Images
  -------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setGalleryImages(data as GalleryImage[]);
        } else {
          setGalleryImages(STATIC_FALLBACK_IMAGES);
        }
      })
      .catch((err) => {
        console.warn("Failed to load gallery from API, using static fallback:", err);
        if (mounted) {
          setGalleryImages(STATIC_FALLBACK_IMAGES);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  /* --------------------------------------------------
     Load Existing Blog
  -------------------------------------------------- */
  useEffect(() => {
    if (!postId) return;

    const loadBlog = async () => {
      try {
        const fallbackPosts = (await import("@/../data/blogs.json")).default?.blogs ?? [];
        const data = localStorage.getItem("funtush_blog_posts");
        const posts: BlogPost[] = data ? JSON.parse(data) : fallbackPosts;

        if (!Array.isArray(posts)) {
          toast.error("Invalid blog data.");
          return;
        }

        const target = posts.find((post) => String(post.id) === String(postId));

        if (!target) {
          toast.error("Blog post could not be found.");
          return;
        }

        setTitle(target.title || "");
        setSubtitle(target.subtitle || "");
        setHtmlContent(target.htmlContent || "");
        setCategory(target.category || "");
        setStatus(target.status || "Draft");
        setPublishDate(target.publishDate || "Jul 19, 2026 10:30 AM");
        setTag(target.tag || "");

        if (target.tag) {
          setTagsList(
            target.tag
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          );
        }

        setPhotoOption(target.photoOption || "local");
        if (target.photoUrl) {
          setSelectedGalleryImage({
            id: target.photoUrl,
            url: target.photoUrl,
            title: "",
            owner: "",
          });
        }
      } catch (error) {
        console.error("Failed to load blog:", error);
        toast.error("Failed to load blog details. Please try again.");
      }
    };

    loadBlog();
  }, [postId]);

  /* --------------------------------------------------
     Clear Error
  -------------------------------------------------- */
  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  /* --------------------------------------------------
     Validation
  -------------------------------------------------- */
  const validateForm = (targetStatus: string) => {
    const newErrors: FormErrors = {
      title: "",
      content: "",
      category: "",
      publishDate: "",
      photo: "",
    };

    if (!title.trim()) {
      newErrors.title = "Blog title is required.";
    }

    const plainContent = htmlContent
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, "")
      .trim();

    if (!plainContent) {
      newErrors.content = "Blog content is required.";
    }

    if (targetStatus === "Published" && !category.trim()) {
      newErrors.category = "Category is required before publishing.";
    }

    if (targetStatus === "Scheduled" && !publishDate.trim()) {
      newErrors.publishDate = "Publish date is required for scheduled posts.";
    }
    const hasPhoto = Boolean(selectedFile || selectedGalleryImage);
    if (!hasPhoto) {
      newErrors.photo = "Please upload an image or select one from the gallery.";
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error !== "");
  };

  /* --------------------------------------------------
     Tag Handlers
  -------------------------------------------------- */
  const handleAddTag = (newTag: string) => {
    const trimmed = newTag.trim();
    if (trimmed && !tagsList.includes(trimmed)) {
      const updated = [...tagsList, trimmed];
      setTagsList(updated);
      setTag(updated.join(", "));
    }
    setTagInput("");
  };

  const handleRemoveTag = (indexToRemove: number) => {
    const updated = tagsList.filter((_, index) => index !== indexToRemove);
    setTagsList(updated);
    setTag(updated.join(", "));
  };

  /* --------------------------------------------------
     File / Photo Handlers
  -------------------------------------------------- */
  const validateFile = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return "Only JPG, JPEG, PNG, and WEBP images are allowed.";
    }
    if (file.size > maxSize) {
      return "Image size must not exceed 2MB.";
    }
    return "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setErrors((prev) => ({ ...prev, photo: "An image is required." }));
      return;
    }

    const fileError = validateFile(file);
    if (fileError) {
      setSelectedFile(null);
      setErrors((prev) => ({ ...prev, photo: fileError }));
      return;
    }

    setSelectedFile(file);
    setSelectedGalleryImage(null);
    setErrors((prev) => ({ ...prev, photo: "" }));
  };

  const handlePhotoOptionChange = (option: "local" | "gallery") => {
    setPhotoOption(option);
    setSelectedFile(null);
    setSelectedGalleryImage(null);
    setErrors((prev) => ({ ...prev, photo: "An image is required." }));
  };

  const handleGalleryImageSelect = (image: GalleryImage) => {
    setSelectedGalleryImage(image);
    setSelectedFile(null);
    setErrors((prev) => ({ ...prev, photo: "" }));
  };

  /* --------------------------------------------------
     Save / Publish / Schedule
  -------------------------------------------------- */
  const handleSave = (e?: React.FormEvent, targetStatus?: string) => {
    if (e) {
      e.preventDefault();
    }

    const finalStatus = targetStatus || status;

    if (!validateForm(finalStatus)) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    try {
      const currentRecords = localStorage.getItem("funtush_blog_posts");
      let recordsList: BlogPost[] = [];

      if (currentRecords) {
        try {
          const parsedRecords = JSON.parse(currentRecords);
          if (Array.isArray(parsedRecords)) {
            recordsList = parsedRecords;
          } else {
            toast.error("Invalid saved blog data.");
            return;
          }
        } catch (error) {
          console.error("Failed to parse saved blogs:", error);
          toast.error("Unable to read saved blogs. Please try again.");
          return;
        }
      }

      const dateValue = new Date().toISOString().split("T")[0];

      if (postId) {
        const blogExists = recordsList.some((item) => String(item.id) === String(postId));

        if (!blogExists) {
          toast.error("The blog you are trying to update could not be found.");
          return;
        }

        recordsList = recordsList.map((item) =>
          String(item.id) === String(postId)
            ? {
              ...item,
              title: title.trim(),
              subtitle: subtitle.trim(),
              htmlContent,
              category,
              status: finalStatus as "Draft" | "Scheduled" | "Published",
              publishDate,
              tag,
              photoOption,
              photoUrl: photoOption === "gallery" ? selectedGalleryImage?.url || "" : item.photoUrl || "",
              date: dateValue,
            }
            : item
        );

        localStorage.setItem("funtush_blog_posts", JSON.stringify(recordsList));

        if (finalStatus === "Published") {
          toast.success("Blog published successfully!");
        } else if (finalStatus === "Scheduled") {
          toast.success("Blog scheduled successfully!");
        } else {
          toast.success("Blog saved as draft successfully!");
        }
      } else {
        const newPost: BlogPost = {
          id: `post-${Date.now()}`,
          title: title.trim(),
          subtitle: subtitle.trim(),
          htmlContent,
          category,
          status: finalStatus as "Draft" | "Scheduled" | "Published",
          publishDate,
          tag,
          photoOption,
          photoUrl: photoOption === "gallery" ? selectedGalleryImage?.url || "" : "",
          date: dateValue,
          views: 0,
        };

        recordsList = [newPost, ...recordsList];

        localStorage.setItem("funtush_blog_posts", JSON.stringify(recordsList));

        if (finalStatus === "Published") {
          toast.success("Blog published successfully!");
        } else if (finalStatus === "Scheduled") {
          toast.success("Blog scheduled successfully!");
        } else {
          toast.success("Blog saved as draft successfully!");
        }
      }

      router.push("/dashboard/blog");
    } catch (error) {
      console.error("Failed to save blog:", error);
      toast.error("Failed to save the blog. Please try again.");
    }
  };

  /* --------------------------------------------------
     Preview
  -------------------------------------------------- */
  const handlePreview = () => {
    const newErrors: FormErrors = {
      title: "",
      content: "",
      category: "",
      publishDate: "",
      photo: "",
    };

    if (!title.trim()) {
      newErrors.title = "Blog title is required.";
    }

    const plainContent = htmlContent
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, "")
      .trim();

    if (!plainContent) {
      newErrors.content = "Blog content is required.";
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== "");

    if (hasErrors) {
      toast.error("Please fix the highlighted fields before previewing.");
      return;
    }

    try {
      localStorage.setItem(
        "funtush_blog_preview",
        JSON.stringify({
          title,
          subtitle,
          htmlContent,
          category,
          status,
          publishDate,
          tag,
          photoOption,
        })
      );

      toast.success("Preview generated successfully!");
      router.push("/dashboard/blog/preview");
    } catch (error) {
      console.error("Preview failed:", error);
      toast.error("Unable to generate preview. Please try again.");
    }
  };

  /* --------------------------------------------------
     Styles & Helpers
  -------------------------------------------------- */
  const cardClass = isDark
    ? "bg-neutral-900 text-neutral-50 border-neutral-700"
    : "bg-white text-neutral-900 border-neutral-200";

  const inputClass = isDark
    ? "border-neutral-700 bg-neutral-800 text-neutral-50 placeholder-neutral-500 focus:border-primary-400 focus:ring-primary-400"
    : "border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 focus:border-primary-500 focus:ring-primary-500";

  const selectClass = isDark
    ? "border-neutral-700 bg-neutral-800 text-neutral-200"
    : "border-neutral-300 bg-white text-neutral-700";

  const errorInputClass = "border-danger-500 focus:border-danger-500 focus:ring-danger-500";
  const secondaryText = isDark ? "text-neutral-400" : "text-neutral-500";

  const filteredGalleryImages = galleryImages.filter((img) => {
    if (!gallerySearch.trim()) return true;
    const q = gallerySearch.toLowerCase();
    return (
      (img.title || "").toLowerCase().includes(q) ||
      (img.url || "").toLowerCase().includes(q) ||
      (img.owner || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredGalleryImages.length / itemsPerPage) || 1;
  const paginatedGalleryImages = filteredGalleryImages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */
  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className={
                isDark
                  ? "whitespace-nowrap text-neutral-400 transition hover:text-neutral-200"
                  : "whitespace-nowrap text-neutral-500 transition hover:text-neutral-900"
              }
            >
              Dashboard
            </button>
            <span className={isDark ? "text-neutral-600" : "text-neutral-300"}>/</span>
            <button
              type="button"
              onClick={() => router.push("/dashboard/blog")}
              className={
                isDark
                  ? "whitespace-nowrap text-neutral-400 transition hover:text-neutral-200"
                  : "whitespace-nowrap text-neutral-500 transition hover:text-neutral-900"
              }
            >
              All Blogs
            </button>
            <span className={isDark ? "text-neutral-600" : "text-neutral-300"}>/</span>
            <span
              className={
                isDark
                  ? "whitespace-nowrap font-semibold text-neutral-100"
                  : "whitespace-nowrap font-semibold text-neutral-900"
              }
            >
              {postId ? "Edit Blog" : "Add Blog"}
            </span>
          </div>

          <h1
            className={
              isDark
                ? "text-2xl font-semibold text-neutral-100"
                : "text-2xl font-semibold text-neutral-900"
            }
          >
            {postId ? "Edit Blog" : "Add Blog"}
          </h1>

          <p
            className={
              isDark
                ? "text-sm leading-6 text-neutral-400"
                : "text-sm leading-6 text-neutral-600"
            }
          >
            {postId ? "Edit and update your blog post" : "Create and publish a new blog post"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3 lg:w-auto">
          <button
            type="button"
            onClick={() => handleSave(undefined, "Draft")}
            className={`
              w-full cursor-pointer whitespace-nowrap rounded-lg border px-4 py-2.5
              text-xs font-semibold shadow-sm transition-colors sm:w-auto
              ${isDark
                ? "border-neutral-700 bg-neutral-800 text-neutral-100 hover:bg-neutral-700"
                : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
              }
            `}
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={handlePreview}
            className={`
              flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap
              rounded-lg border px-4 py-2.5 text-xs font-semibold shadow-sm transition-colors sm:w-auto
              ${isDark
                ? "border-neutral-700 bg-neutral-800 text-neutral-100 hover:bg-neutral-700"
                : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
              }
            `}
          >
            <VisibilityIcon sx={{ fontSize: 16 }} />
            Preview
          </button>

          <button
            type="button"
            onClick={() => handleSave(undefined, "Published")}
            className="
              flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap
              rounded-lg px-5 py-2.5 text-xs font-semibold shadow-sm transition-colors sm:w-auto
              bg-primary-900 text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-900/20
            "
          >
            <AddIcon sx={{ fontSize: 16 }} />
            Publish
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid w-full grid-cols-1 items-start gap-4 lg:grid-cols-3">
        {/* Editor Section */}
        <Card
          className={`
            lg:col-span-2 ${cardClass} rounded-2xl border p-6 shadow-sm
          `}
        >
          {/* Blog Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold">
              Blog Title <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clearError("title");
              }}
              placeholder="Enter blog title..."
              className={`
                w-full rounded-xl border px-3.5 py-3 text-xs shadow-sm
                focus:outline-none focus:ring-2 transition-colors
                ${errors.title ? errorInputClass : inputClass}
              `}
            />
            {errors.title && <p className="text-xs text-danger-500">{errors.title}</p>}
          </div>

          {/* Sub Title */}
          <div className="mt-4 space-y-1.5">
            <label className="block text-xs font-bold">Sub title</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Enter sub title..."
              className={`
                w-full rounded-xl border px-3.5 py-3 text-xs shadow-sm
                focus:outline-none focus:ring-2 transition-colors ${inputClass}
              `}
            />
          </div>

          {/* Content */}
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold">
                Content <span className="text-danger-500">*</span>
              </label>
              <button
                type="button"
                className={`
                  flex items-center gap-1.5 text-[11px] font-medium transition-colors
                  ${isDark ? "text-primary-400 hover:text-primary-300" : "text-primary-500 hover:text-primary-600"}
                `}
              >
                <SparklesIcon style={{ fontSize: 14 }} />
                Copy-writing tips
              </button>
            </div>

            <div className={errors.content ? "rounded-xl border border-danger-500" : ""}>
              <QuillEditor
                content={htmlContent}
                onChange={(val) => {
                  setHtmlContent(val);
                  clearError("content");
                }}
              />
            </div>

            {errors.content && <p className="text-xs text-danger-500">{errors.content}</p>}
          </div>
        </Card>

        {/* Publish Settings Section */}
        <div className="lg:sticky lg:top-24">
          <Card className={`${cardClass} rounded-2xl border p-6 shadow-sm space-y-5 h-fit overflow-hidden`}>
            <h2 className="text-sm font-bold">Publish Settings</h2>

            {/* CATEGORY */}
            <div className="space-y-1.5">
              <label className="block font-bold text-xs">
                Select Category <span className="text-danger-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  clearError("category");
                }}
                className={`w-full rounded-xl border px-3.5 py-3 text-xs shadow-sm focus:outline-none focus:ring-2 ${errors.category
                  ? "border-danger-500 focus:ring-danger-500"
                  : `${selectClass} focus:border-primary-500 focus:ring-primary-500`
                  }`}
              >
                <option value="" disabled>Select Category</option>
                <option value="tech">Technology</option>
                <option value="marketing">Marketing</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
              {errors.category && <p className="text-xs text-danger-500">{errors.category}</p>}
            </div>

            {/* STATUS */}
            <div className="space-y-1.5">
              <label className="block font-bold text-xs">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  const val = e.target.value;
                  setStatus(val);
                  if (val !== "Scheduled") {
                    clearError("publishDate");
                  }
                }}
                className={`w-full rounded-xl border px-3.5 py-3 text-xs shadow-sm focus:outline-none focus:ring-2 ${selectClass} focus:border-primary-500 focus:ring-primary-500`}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>

            {status === "Scheduled" && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="block font-bold text-xs">
                  Publish Date <span className="text-danger-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={publishDate}
                    onChange={(e) => {
                      setPublishDate(e.target.value);
                      clearError("publishDate");
                    }}
                    placeholder="Enter publish date and time"
                    className={`w-full rounded-xl border px-3.5 py-3 pr-10 text-xs shadow-sm focus:outline-none focus:ring-2 ${errors.publishDate
                      ? "border-danger-500 focus:ring-danger-500"
                      : `${inputClass} focus:border-primary-500 focus:ring-primary-500`
                      }`}
                  />
                  <CalendarTodayIcon className="absolute right-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
                {errors.publishDate ? (
                  <p className="text-xs text-danger-500">{errors.publishDate}</p>
                ) : (
                  <p className={`text-[11px] ${secondaryText} mt-1`}>Set the date and time to publish the blog.</p>
                )}
              </div>
            )}

            {/* TAGS */}
            <div className="space-y-1.5">
              <label className="block font-bold text-xs">Tags</label>
              <div className={`w-full rounded-xl border px-3 py-2 text-xs shadow-sm ${inputClass}`}>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {tagsList.map((t, index) => (
                    <span key={index} className="inline-flex items-center gap-1 bg-primary-500 text-white text-[11px] px-2 py-0.5 rounded-md">
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="hover:text-danger-200 font-bold ml-0.5 transition-colors"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(tagInput);
                      }
                    }}
                    placeholder="Type a tag and press add..."
                    className={`w-full bg-transparent focus:outline-none text-xs py-1 ${isDark ? "text-neutral-50 placeholder-neutral-500" : "text-neutral-900 placeholder-neutral-500"}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(tagInput)}
                    className="shrink-0 rounded-lg bg-primary-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-800"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* PHOTOS */}
            <div className="space-y-3 pt-2">
              <label className="block font-bold text-xs">
                Photos <span className="text-danger-500">*</span>
              </label>

              <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-5">
                <label className={`flex cursor-pointer items-center gap-1.5 ${isDark ? "text-neutral-200" : "text-neutral-700"}`}>
                  <input
                    type="radio"
                    name="photoSource"
                    checked={photoOption === "local"}
                    onChange={() => handlePhotoOptionChange("local")}
                    className="accent-primary-500"
                  />
                  <span>Upload from Local Drive</span>
                </label>

                <label className={`flex cursor-pointer items-center gap-1.5 ${isDark ? "text-neutral-200" : "text-neutral-700"}`}>
                  <input
                    type="radio"
                    name="photoSource"
                    checked={photoOption === "gallery"}
                    onChange={() => handlePhotoOptionChange("gallery")}
                    className="accent-primary-500"
                  />
                  <span>Add from Gallery</span>
                </label>
              </div>

             {photoOption === "local" && (
  <>
    {!selectedFile && (
      <div
        className={`border border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3 ${
          errors.photo
            ? "border-danger-500"
            : isDark
            ? "border-neutral-700 bg-neutral-800/50"
            : "border-neutral-300 bg-neutral-50"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center">
          <UploadFileIcon className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium">Drag & drop Image here</p>
          <p className={`text-[11px] ${secondaryText}`}>Or</p>
        </div>
        <label className="cursor-pointer rounded-xl bg-primary-900 px-4 py-2 text-xs font-medium text-white shadow-md shadow-primary-900/20 transition-colors hover:bg-primary-800">
          Upload Image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    )}

    {/* Show the preview card when a file IS selected */}
    {selectedFile && (
      <div className="relative rounded-xl overflow-hidden border border-primary-500/30 w-full">
        <Image
          src={URL.createObjectURL(selectedFile)}
          alt={selectedFile.name}
          width={800}
          height={450}
          className="w-full h-32 object-cover"
        />
        <div className={`p-2 text-xs flex justify-between items-center ${isDark ? "bg-neutral-900 text-neutral-200" : "bg-white text-neutral-800"}`}>
          <span className="font-medium truncate">{selectedFile.name}</span>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="text-danger-500 hover:underline font-medium text-[11px]"
          >
            Remove
          </button>
        </div>
      </div>
    )}

    {errors.photo && <p className="text-xs text-danger-500 mt-1">{errors.photo}</p>}
  </>
)}

              {photoOption === "gallery" && (
                <div className={`rounded-2xl border p-4 ${isDark ? "border-neutral-700 bg-neutral-800/50" : "border-neutral-200 bg-neutral-50"}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary-500" />
                      <p className="text-xs font-semibold">Gallery Selection</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowGalleryModal(true)}
                      className="rounded-lg bg-primary-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-800"
                    >
                      Open Gallery
                    </button>
                  </div>

                  {selectedGalleryImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-primary-500/30">
                      <Image
                        src={selectedGalleryImage.url}
                        alt={selectedGalleryImage.title || "Selected image"}
                        width={800}
                        height={450}
                        className="w-full h-32 object-cover"
                      />
                      <div className={`p-2 text-xs flex justify-between items-center ${isDark ? "bg-neutral-900 text-neutral-200" : "bg-white text-neutral-800"}`}>
                        <span className="font-medium truncate">{selectedGalleryImage.title}</span>
                        <CheckCircleIcon className="w-4 h-4 text-primary-500 shrink-0" />
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center border border-dashed rounded-xl">
                      <ImageIcon className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
                      <p className={`text-xs ${secondaryText}`}>No image selected from gallery.</p>
                    </div>
                  )}

                  {errors.photo && <p className="text-xs text-danger-500 mt-2">{errors.photo}</p>}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* GALLERY MODAL */}
      <Modal
        isOpen={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
        title="Select Image from Gallery"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-neutral-500">Search and pick an image to use in your blog post.</p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={gallerySearch}
                onChange={(e) => {
                  setGallerySearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by title or category..."
                className={`w-full sm:w-64 rounded-lg border px-3 py-2 text-xs shadow-sm ${isDark ? "border-neutral-700 bg-neutral-800 text-neutral-50" : "border-neutral-300 bg-white text-neutral-900"
                  }`}
              />
              <button
                type="button"
                onClick={() => {
                  setGallerySearch("");
                  setCurrentPage(1);
                }}
                className="text-xs text-neutral-500 hover:text-neutral-700 shrink-0"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 md:grid-cols-3 gap-3 min-h-[240px]">
            {paginatedGalleryImages.length === 0 ? (
              <div className="col-span-full py-16 text-center">
                <p className="text-sm text-neutral-500">No images match your search.</p>
              </div>
            ) : (
              paginatedGalleryImages.map((image) => {
                const isSelected = selectedGalleryImage?.id === image.id;

                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => {
                      handleGalleryImageSelect(image);
                      setShowGalleryModal(false);
                    }}
                    className={`relative overflow-hidden rounded-xl border-2 text-left transition-all ${isSelected
                      ? "border-primary-500 ring-2 ring-primary-500/20"
                      : isDark
                        ? "border-neutral-700 hover:border-primary-400"
                        : "border-neutral-200 hover:border-primary-400"
                      }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.title || "Gallery image"}
                      width={800}
                      height={450}
                      className="w-full h-32 object-cover"
                    />
                    <div className={`px-2 py-1.5 text-[11px] truncate ${isDark ? "bg-neutral-900 text-neutral-200" : "bg-white text-neutral-700"}`}>
                      {image.title || "Untitled"}
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center shadow">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {totalPages > 0 && (
            <div className="pt-2 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}