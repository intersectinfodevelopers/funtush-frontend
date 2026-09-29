"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, ImagePlus, Sparkles, UploadCloud, X } from "lucide-react";

import { BlogPhotoLibraryModal } from "@/components/agency/blog/BlogPhotoLibraryModal";
import { QuillEditor } from "@/components/agency/blog/QuillEditor";
import { Modal } from "@/components/ui/modal";
import { useCategories } from "@/hooks/useAgencyBlog";
import { createBlog, updateBlog, type BlogPost } from "@/lib/api/agency/blog";
import { validateUpload } from "@/lib/api/upload";
import type { ApiError } from "@/lib/api/client";

const field = "mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const label = "block text-sm font-semibold text-neutral-800";
const Req = () => <span className="ml-0.5 text-danger-600" aria-hidden="true">*</span>;
const MAX_TAGS = 10;

/** `<input type="datetime-local">` works in the browser's LOCAL time — these convert to/from the ISO
 * string the API stores, and give the `min` that keeps a past date/time from being picked at all. */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
function nowLocalInput(): string {
  return toLocalInput(new Date().toISOString());
}

const WRITING_TIPS = [
  "Lead with the traveller's problem or question, not your agency's name.",
  "Break long paragraphs at natural pauses — one idea per paragraph reads easier on a phone.",
  "Use a specific number or place name in the first two sentences (\"3 days\", \"Poon Hill\") — vague openings lose readers fast.",
  "End with something the reader can do next: a season to book, a permit to check, a trail to compare.",
];

interface Photo { url: string; source: "kept" | "gallery"; }
type BlogStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED";

export default function BlogForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const qc = useQueryClient();
  const editing = Boolean(post);
  const categories = useCategories();

  const [f, setF] = useState({ title: post?.title ?? "", subtitle: post?.subtitle ?? "", categoryId: post?.category?.id ?? "", status: (post?.status ?? "DRAFT") as BlogStatus });
  const [publishAt, setPublishAt] = useState(toLocalInput(post?.publishAt));
  const [content, setContent] = useState(post?.content ?? "");
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [kept, setKept] = useState<string[]>(post?.photos ?? []);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [photoSource, setPhotoSource] = useState<"local" | "gallery">("local");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [over, setOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<string | null>(null);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const photos: Photo[] = useMemo(() => [...kept.map((url) => ({ url, source: "kept" as const })), ...galleryUrls.map((url) => ({ url, source: "gallery" as const }))], [kept, galleryUrls]);
  const totalPhotoCount = photos.length + stagedFiles.length;

  const save = useMutation({
    mutationFn: (status: BlogStatus) => {
      const photosTouched = editing && (stagedFiles.length > 0 || galleryUrls.length > 0 || kept.length !== (post?.photos.length ?? 0));
      const base = { title: f.title.trim(), subtitle: f.subtitle.trim(), content, categoryId: f.categoryId, status, tags, files: stagedFiles, publishAt: status === "SCHEDULED" ? fromLocalInput(publishAt) : null };
      if (!editing) return createBlog({ ...base, photoUrls: galleryUrls });
      return updateBlog(post!.id, photosTouched ? { ...base, keepPhotos: kept, photoUrls: galleryUrls } : base);
    },
    onSuccess: (_r, status) => {
      toast.success(status === "PUBLISHED" ? `“${f.title.trim()}” is published` : status === "SCHEDULED" ? `“${f.title.trim()}” is scheduled` : `“${f.title.trim()}” was saved as a draft`);
      void qc.invalidateQueries({ queryKey: ["agency", "blogs"] });
      router.push("/dashboard/blog");
    },
    onError: (e) => {
      const err = e as unknown as ApiError;
      setSummary(err.message || "Couldn't save the post.");
      toast.error(err.message || "Couldn't save the post.", { duration: 6000 });
    },
  });

  // Only one photo per post: choosing a new one replaces whatever was selected before, from either source.
  function addFiles(list: FileList | File[] | null) {
    if (!list) return;
    const file = Array.from(list)[0];
    if (!file) return;
    const problem = validateUpload(file);
    if (problem) return toast.error(`${file.name}: ${problem}`);
    setKept([]);
    setGalleryUrls([]);
    setStagedFiles([file]);
  }

  function toggleGalleryPhoto(url: string) {
    setGalleryUrls((cur) => (cur.includes(url) ? [] : [url]));
    setKept([]);
    setStagedFiles([]);
  }

  function addTag(raw: string) {
    const t = raw.trim().replace(/,$/, "").trim();
    setTagInput("");
    if (!t) return;
    if (tags.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    if (tags.length >= MAX_TAGS) return toast.error(`A post can have at most ${MAX_TAGS} tags.`);
    setTags((cur) => [...cur, t]);
  }

  function gaps(target: BlogStatus): Record<string, string> {
    const e: Record<string, string> = {};
    if (!f.title.trim()) e.title = "Blog title is required.";
    if (target === "PUBLISHED" || target === "SCHEDULED") {
      if (!f.categoryId) e.categoryId = "Choose a category.";
      if (!content.replace(/<[^>]*>/g, "").trim()) e.content = "Write some content before publishing.";
      if (totalPhotoCount === 0) e.photos = "Add at least one photo before publishing.";
    }
    if (target === "SCHEDULED") {
      if (!publishAt) e.publishAt = "Choose a publish date and time.";
      else if (new Date(publishAt).getTime() <= Date.now()) e.publishAt = "Publish date must be in the future.";
    }
    return e;
  }

  function run(status: BlogStatus) {
    const found = gaps(status);
    setErrors(found);
    if (Object.keys(found).length) {
      setSummary(`Please fix ${Object.keys(found).length === 1 ? "the highlighted field" : "the highlighted fields"} and try again.`);
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setSummary(null);
    setF((c) => ({ ...c, status }));
    save.mutate(status);
  }

  const E = (k: string) => (errors[k] ? <p role="alert" className="mt-1 text-xs text-danger-600">{errors[k]}</p> : null);
  const bad = (k: string) => (errors[k] ? " border-danger-500" : "");
  const plainContent = content.replace(/<[^>]*>/g, "").trim();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 py-2 sm:py-4">
      <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500">
            <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span>
            <Link href="/dashboard/blog" className="hover:text-neutral-900">All Blogs</Link><span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">{editing ? "Edit Blog" : "Add Blog"}</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">{editing ? "Edit Blog" : "Add Blog"}</h1>
          <p className="mt-1 text-sm text-neutral-600">{editing ? "Update this blog post." : "Create and publish a new blog post."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={save.isPending} onClick={() => run("DRAFT")} className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 disabled:opacity-50">{save.isPending && save.variables === "DRAFT" ? "Saving…" : "Save as Draft"}</button>
          <button type="button" onClick={() => setPreviewOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"><Eye className="h-4 w-4" /> Preview</button>
          <button type="button" disabled={save.isPending} onClick={() => run(f.status === "SCHEDULED" ? "SCHEDULED" : "PUBLISHED")} className="inline-flex items-center gap-1.5 rounded-full bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">
            + {save.isPending && (save.variables === "PUBLISHED" || save.variables === "SCHEDULED") ? (f.status === "SCHEDULED" ? "Scheduling…" : "Publishing…") : f.status === "SCHEDULED" ? "Schedule" : "Publish"}
          </button>
        </div>
      </div>

      {summary && <p role="alert" className="border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{summary}</p>}

      <div className="border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-5">
          <div>
            <label className={label} htmlFor="bt">Blog Title<Req /></label>
            <input id="bt" aria-invalid={Boolean(errors.title)} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Enter blog title..." maxLength={200} className={`${field}${bad("title")}`} />
            {E("title")}
          </div>
          <div>
            <label className={label} htmlFor="bs">Sub title</label>
            <input id="bs" value={f.subtitle} onChange={(e) => setF({ ...f, subtitle: e.target.value })} placeholder="Enter sub title..." maxLength={300} className={field} />
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-100 pt-6">
          <h2 className="text-base font-bold text-neutral-900">Publish Settings</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={label} htmlFor="bc">Select Category<Req /></label>
              <select id="bc" aria-invalid={Boolean(errors.categoryId)} value={f.categoryId} onChange={(e) => setF({ ...f, categoryId: e.target.value })} className={`${field}${bad("categoryId")}`}>
                <option value="">Select Category</option>
                {(categories.data ?? []).filter((c) => c.isActive || c.id === f.categoryId).map((c) => <option key={c.id} value={c.id}>{c.name}{c.isActive ? "" : " (inactive)"}</option>)}
              </select>
              {E("categoryId")}
              {(categories.data?.length ?? 0) === 0 && !categories.isLoading && <p className="mt-1 text-xs text-neutral-500"><Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/categories">Create a category</Link> first.</p>}
            </div>
            <div>
              <label className={label} htmlFor="bst">Status</label>
              <select id="bst" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as BlogStatus })} className={field}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="SCHEDULED">Scheduled</option>
              </select>
            </div>
            {f.status === "SCHEDULED" && (
              <div>
                <label className={label} htmlFor="bpublishat">Publish Date<Req /></label>
                <input id="bpublishat" type="datetime-local" aria-invalid={Boolean(errors.publishAt)} min={nowLocalInput()} value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className={`${field}${bad("publishAt")}`} />
                {E("publishAt")}
                <p className="mt-1 text-xs text-neutral-500">Set the date and time to publish the blog.</p>
              </div>
            )}
            <div className={f.status === "SCHEDULED" ? "sm:col-span-2 lg:col-span-1" : ""}>
              <label className={label} htmlFor="btag">Tags</label>
              <div className="mt-1.5 flex gap-2">
                <input id="btag" value={tagInput} onChange={(e) => (e.target.value.endsWith(",") ? addTag(e.target.value) : setTagInput(e.target.value))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } }} placeholder="Type a tag and press add..." className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
                <button type="button" onClick={() => addTag(tagInput)} className="shrink-0 rounded-full bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800">Add</button>
              </div>
              {tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{tags.map((t) => <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-900">{t}<button type="button" aria-label={`Remove ${t}`} onClick={() => setTags((cur) => cur.filter((x) => x !== t))} className="text-primary-700 hover:text-danger-600"><X className="h-3 w-3" /></button></span>)}</div>}
            </div>
          </div>

          <div className="mt-5">
            <p className={label}>Photo<Req /></p>

            {totalPhotoCount > 0 ? (
              <div className="mt-2 flex items-center gap-3">
                {kept[0] && <img src={kept[0]} alt="" className="h-20 w-28 rounded-lg object-cover" />}
                {galleryUrls[0] && <div className="relative"><img src={galleryUrls[0]} alt="" className="h-20 w-28 rounded-lg object-cover" /><span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[9px] text-white">Gallery</span></div>}
                {stagedFiles[0] && <img src={URL.createObjectURL(stagedFiles[0])} alt="" className="h-20 w-28 rounded-lg object-cover" />}
                <button type="button" onClick={() => { setKept([]); setGalleryUrls([]); setStagedFiles([]); }} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"><X className="h-3.5 w-3.5" /> Remove</button>
              </div>
            ) : (
              <>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <label className="inline-flex items-center gap-1.5"><input type="radio" name="photoSource" checked={photoSource === "local"} onChange={() => setPhotoSource("local")} /> Upload from Local Drive</label>
                  <label className="inline-flex items-center gap-1.5"><input type="radio" name="photoSource" checked={photoSource === "gallery"} onChange={() => setPhotoSource("gallery")} /> Add from Gallery</label>
                </div>

                {photoSource === "local" ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                    onDragLeave={() => setOver(false)}
                    onDrop={(e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }}
                    className={`mt-3 flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center sm:flex-row sm:justify-center sm:gap-4 sm:py-4 ${over ? "border-primary-400 bg-primary-50" : "border-neutral-200"} ${errors.photos ? "border-danger-400" : ""}`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700"><UploadCloud className="h-5 w-5" /></span>
                    <p className="text-sm text-neutral-700">Drag &amp; drop Image here, or</p>
                    <label className="cursor-pointer rounded-full bg-primary-900 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-800">
                      Upload Image
                      <input type="file" accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif" aria-label="Upload photo" className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                    </label>
                  </div>
                ) : (
                  <div className={`mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed p-4 ${errors.photos ? "border-danger-400" : "border-neutral-200"}`}>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-800"><ImagePlus className="h-4 w-4 text-primary-700" /> Gallery Selection — no image selected</span>
                    <button type="button" onClick={() => setLibraryOpen(true)} className="rounded-full bg-primary-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-800">Open Gallery</button>
                  </div>
                )}
              </>
            )}
            {E("photos")}
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-100 pt-6">
          <div className="flex items-center justify-between">
            <label className={label} htmlFor="bcontent">Content<Req /></label>
            <div className="relative">
              <button type="button" onClick={() => setTipsOpen((v) => !v)} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline"><Sparkles className="h-3.5 w-3.5" /> Copy-writing tips</button>
              {tipsOpen && (
                <div className="absolute right-0 top-6 z-10 w-72 border border-neutral-200 bg-white p-4 text-xs text-neutral-700 shadow-lg">
                  <ul className="list-disc space-y-2 pl-4">{WRITING_TIPS.map((t) => <li key={t}>{t}</li>)}</ul>
                  <button type="button" onClick={() => setTipsOpen(false)} className="mt-3 font-semibold text-primary-700 hover:underline">Got it</button>
                </div>
              )}
            </div>
          </div>
          <div id="bcontent" className="mt-1.5" aria-invalid={Boolean(errors.content)}><QuillEditor content={content} onChange={setContent} /></div>
          {E("content")}
        </div>
      </div>

      <BlogPhotoLibraryModal isOpen={libraryOpen} onClose={() => setLibraryOpen(false)} onSelect={(url) => toggleGalleryPhoto(url)} />

      <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="Preview" size="lg">
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          {photos[0] && <img src={photos[0].url} alt="" className="h-56 w-full rounded-xl object-cover" />}
          {!photos[0] && stagedFiles[0] && <img src={URL.createObjectURL(stagedFiles[0])} alt="" className="h-56 w-full rounded-xl object-cover" />}
          <div>
            <h3 className="text-xl font-bold text-neutral-900">{f.title.trim() || "Untitled post"}</h3>
            {f.subtitle.trim() && <p className="mt-1 text-neutral-600">{f.subtitle}</p>}
          </div>
          {tags.length > 0 && <div className="flex flex-wrap gap-1.5">{tags.map((t) => <span key={t} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">{t}</span>)}</div>}
          {plainContent ? <div className="prose prose-sm max-w-none break-words [overflow-wrap:anywhere]" dangerouslySetInnerHTML={{ __html: content }} /> : <p className="text-sm text-neutral-400">No content yet.</p>}
        </div>
      </Modal>
    </div>
  );
}
