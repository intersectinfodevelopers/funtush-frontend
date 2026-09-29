"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ImagePlus, Star, Upload, X } from "lucide-react";

import { uploadFile, validateUpload } from "@/lib/api/upload";
import { createGalleryPost, updateGalleryPost, type GalleryPost, type PostStatus } from "@/lib/api/agency/media";
import type { ApiError } from "@/lib/api/client";

const MAX_IMAGES = 5;
const CATEGORIES = ["Nature", "People", "Adventure", "Culture", "Trekking", "Mountains", "Wildlife", "Travel", "Other"];
const field = "mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const label = "block text-sm font-semibold text-neutral-800";
const Req = () => <span className="ml-0.5 text-danger-600" aria-hidden="true">*</span>;

export default function UploadImageForm({ post }: { post?: GalleryPost }) {
  const router = useRouter();
  const qc = useQueryClient();
  const editing = Boolean(post);
  const [title, setTitle] = useState(post?.title ?? "");
  const [description, setDescription] = useState(post?.description ?? "");
  const [category, setCategory] = useState(post?.category ?? "Nature");
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "published");
  const [images, setImages] = useState<string[]>(post?.images ?? []);
  const [featured, setFeatured] = useState<string | null>(post?.featuredImage ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const save = useMutation({
    mutationFn: () => {
      const body = { title: title.trim(), description: description.trim() || null, category, status, images, featuredImage: featured && images.includes(featured) ? featured : images[0] };
      return post ? updateGalleryPost(post.id, body) : createGalleryPost(body);
    },
    onSuccess: () => { toast.success(post ? "Gallery post saved" : "Gallery post published"); void qc.invalidateQueries({ queryKey: ["agency", "gallery"] }); router.push("/dashboard/gallery"); },
    onError: (e) => setError((e as unknown as ApiError).message || "Couldn't save the post."),
  });

  async function add(list: FileList | null) {
    if (!list) return;
    const files = Array.from(list).slice(0, MAX_IMAGES - images.length);
    setBusy(true); setError(null);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const problem = validateUpload(file);
        if (problem) throw new Error(`${file.name}: ${problem}`);
        urls.push(await uploadFile(file));
      }
      setImages((c) => [...c, ...urls].slice(0, MAX_IMAGES));
    } catch (e) { setError((e as Error).message || "Upload failed."); } finally { setBusy(false); }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Add a title.");
    if (images.length === 0) return setError("Add at least one image.");
    save.mutate();
  }

  function resetForm() {
    setTitle(post?.title ?? "");
    setDescription(post?.description ?? "");
    setCategory(post?.category ?? "Nature");
    setStatus(post?.status ?? "published");
    setImages(post?.images ?? []);
    setFeatured(post?.featuredImage ?? null);
    setError(null);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 py-2 sm:py-4">
      <div className="border-b border-neutral-200 pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span>
          <Link href="/dashboard/gallery" className="hover:text-neutral-900">Gallery</Link><span className="text-neutral-300">/</span>
          <span className="font-semibold text-neutral-900">{editing ? "Edit" : "Upload"}</span>
        </nav>
        <div className="mt-2 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><ImagePlus className="h-5 w-5" /></span>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{editing ? "Edit gallery post" : "Upload gallery post"}</h1>
            <p className="mt-0.5 text-sm text-neutral-500">{editing ? "Update the photos and details for this gallery post." : "Add up to five photos to one gallery post. The first photo is the featured image."}</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div>
              <p className={label}>Post photos<Req /></p>
              <p className="mt-1 text-xs text-neutral-500">Use × to remove a photo before saving, then add a replacement if needed.</p>
              <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); void add(e.dataTransfer.files); }} className={`mt-3 rounded-2xl border-2 border-dashed px-4 py-7 text-center transition-colors ${dragging ? "border-primary-500 bg-primary-50" : "border-neutral-200 bg-white"}`}>
                <Upload className="mx-auto h-7 w-7 text-neutral-400" />
                <p className="mt-2 text-sm text-neutral-500">Drag &amp; drop photos here</p>
                <button type="button" disabled={busy || images.length >= MAX_IMAGES} onClick={() => inputRef.current?.click()} className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-900 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50"><Upload className="h-4 w-4" /> Choose photos</button>
                <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" aria-label="Add images" disabled={busy} onChange={(e) => { void add(e.target.files); e.target.value = ""; }} className="hidden" />
                <p className="mt-3 text-xs text-neutral-400">{images.length}/{MAX_IMAGES} photos selected · JPG, PNG and WEBP</p>
              </div>
              {images.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {images.map((u) => {
                    const cover = (featured && images.includes(featured) ? featured : images[0]) === u;
                    return (
                      <div key={u} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u} alt="" className={`h-24 w-24 rounded-lg object-cover ${cover ? "ring-2 ring-warning-500" : ""}`} />
                        <button type="button" aria-label="Set as cover" onClick={() => setFeatured(u)} className="absolute -left-2 -top-2 rounded-full bg-white p-1 shadow"><Star className={`h-3.5 w-3.5 ${cover ? "fill-warning-500 text-warning-500" : ""}`} /></button>
                        <button type="button" aria-label="Remove image" onClick={() => setImages(images.filter((i) => i !== u))} className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    );
                  })}
                </div>
              )}
              {busy && <p className="mt-2 text-xs text-neutral-500">Uploading…</p>}
            </div>
            <div>
              <label htmlFor="gt" className={label}>Post title<Req /></label>
              <input id="gt" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Enter post title..." className={field} />
            </div>
            <div>
              <label htmlFor="gd" className={label}>Description (optional)</label>
              <textarea id="gd" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter a short description..." className={field} />
            </div>
          </div>

          <div className="space-y-5 lg:border-l lg:border-neutral-100 lg:pl-8">
            <h2 className="text-base font-bold text-neutral-900">Publish Settings</h2>
            <div>
              <label htmlFor="gc" className={label}>Category<Req /></label>
              <select id="gc" value={category} onChange={(e) => setCategory(e.target.value)} className={field}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <span className="text-sm font-semibold text-neutral-800">Published</span>
              <button type="button" role="switch" aria-checked={status === "published"} aria-label="Published" onClick={() => setStatus((s) => (s === "published" ? "draft" : "published"))} className={`flex h-6 w-12 items-center rounded-full p-0.5 transition ${status === "published" ? "bg-primary-900" : "bg-neutral-300"}`}>
                <span className={`h-5 w-5 rounded-full bg-white shadow transition ${status === "published" ? "translate-x-6" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {error && <p role="alert" className="mt-6 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</p>}

        <div className="mt-6 flex justify-end gap-3 border-t border-neutral-100 pt-5">
          <button type="button" onClick={resetForm} className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Reset</button>
          <button type="submit" disabled={save.isPending || busy} className="rounded-full bg-primary-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{save.isPending ? "Saving…" : post ? "Save changes" : "Publish gallery post"}</button>
        </div>
      </form>
    </div>
  );
}
