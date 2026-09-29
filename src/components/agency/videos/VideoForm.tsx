"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { createVideo, updateVideo, youtubeId, type VideoItem } from "@/lib/api/agency/media";
import type { ApiError } from "@/lib/api/client";

const field = "mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const label = "block text-sm font-semibold text-neutral-800";
const Req = () => <span className="ml-0.5 text-danger-600" aria-hidden="true">*</span>;

export default function VideoForm({ video }: { video?: VideoItem }) {
  const router = useRouter();
  const qc = useQueryClient();
  const editing = Boolean(video);

  const [title, setTitle] = useState(video?.title ?? "");
  const [url, setUrl] = useState(video?.youtubeUrl ?? "");
  const [description, setDescription] = useState(video?.description ?? "");
  const [order, setOrder] = useState(String(video?.order ?? 0));
  const [active, setActive] = useState(video?.status !== "inactive");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<string | null>(null);

  const id = youtubeId(url.trim());

  const save = useMutation({
    mutationFn: () => {
      const body = { title: title.trim(), youtubeUrl: url.trim(), description: description.trim() || null, status: (active ? "active" : "inactive") as "active" | "inactive", order: Number(order || 0) };
      return video ? updateVideo(video.id, body) : createVideo(body);
    },
    onSuccess: (v) => {
      toast.success(editing ? `“${v.title}” was saved` : `“${v.title}” was added`);
      void qc.invalidateQueries({ queryKey: ["agency", "videos"] });
      router.push("/dashboard/videos");
    },
    onError: (e) => {
      const err = e as unknown as ApiError;
      setSummary(err.message || "Couldn't save the video.");
      toast.error(err.message || "Couldn't save the video.", { duration: 6000 });
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    },
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (!title.trim()) found.title = "Video title is required.";
    if (!url.trim()) found.url = "A YouTube link is required.";
    else if (!id) found.url = "Paste a real YouTube link, e.g. https://www.youtube.com/watch?v=…";
    if (order.trim() !== "" && (!Number.isInteger(Number(order)) || Number(order) < 0 || Number(order) > 9999)) found.order = "Order must be a whole number from 0 to 9999.";
    setErrors(found);
    if (Object.keys(found).length) {
      setSummary(`Please fix ${Object.keys(found).length === 1 ? "the highlighted field" : "the highlighted fields"} and try again.`);
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setSummary(null);
    save.mutate();
  }

  const E = (k: string) => (errors[k] ? <p role="alert" className="mt-1 text-xs text-danger-600">{errors[k]}</p> : null);
  const bad = (k: string) => (errors[k] ? " border-danger-500" : "");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 py-2 sm:py-4">
      <div className="border-b border-neutral-200 pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">Dashboard</Link><span className="text-neutral-300">/</span>
          <Link href="/dashboard/videos" className="hover:text-neutral-900">Manage Videos</Link><span className="text-neutral-300">/</span>
          <span className="font-semibold text-neutral-900">{editing ? "Edit video" : "New video"}</span>
        </nav>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">{editing ? "Edit Video" : "Add New Video"}</h1>
        <p className="mt-1 text-sm text-neutral-600">{editing ? "Update this video's details." : "Add a YouTube video to show on your site."}</p>
      </div>

      <form onSubmit={submit} noValidate className="border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div>
              <label className={label} htmlFor="vt">Video Title<Req /></label>
              <input id="vt" aria-invalid={Boolean(errors.title)} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter video title..." maxLength={200} className={`${field}${bad("title")}`} />
              {E("title")}
            </div>
            <div>
              <label className={label} htmlFor="vu">YouTube Link<Req /></label>
              <input id="vu" aria-invalid={Boolean(errors.url)} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" className={`${field}${bad("url")}`} />
              {E("url")}
            </div>
            <div>
              <label className={label} htmlFor="vd">Description (optional)</label>
              <textarea id="vd" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter a short description..." className={field} />
            </div>
          </div>

          <div className="space-y-5 lg:border-l lg:border-neutral-100 lg:pl-8">
            <h2 className="text-base font-bold text-neutral-900">Publish Settings</h2>
            <div>
              <p className={label}>Preview</p>
              {id ? (
                <div className="mt-1.5 overflow-hidden rounded-xl border border-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://img.youtube.com/vi/${encodeURIComponent(id)}/mqdefault.jpg`} alt="Video thumbnail preview" className="aspect-video w-full object-cover" />
                </div>
              ) : (
                <div className="mt-1.5 flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-neutral-200 text-xs text-neutral-400">Paste a link to preview</div>
              )}
            </div>
            <div>
              <label className={label} htmlFor="vo">Display Order (optional)</label>
              <input id="vo" type="number" min={0} aria-invalid={Boolean(errors.order)} value={order} onChange={(e) => setOrder(e.target.value)} className={`${field}${bad("order")}`} />
              {E("order")}
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <span className="text-sm font-semibold text-neutral-800">Active</span>
              <button type="button" role="switch" aria-checked={active} aria-label="Active" onClick={() => setActive((v) => !v)} className={`flex h-6 w-12 items-center rounded-full p-0.5 transition ${active ? "bg-primary-900" : "bg-neutral-300"}`}>
                <span className={`h-5 w-5 rounded-full bg-white shadow transition ${active ? "translate-x-6" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {summary && <p role="alert" className="mt-6 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{summary}</p>}

        <div className="mt-6 flex justify-end gap-3 border-t border-neutral-100 pt-5">
          <Link href="/dashboard/videos" className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Cancel</Link>
          <button type="submit" disabled={save.isPending} className="rounded-full bg-primary-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{save.isPending ? "Saving…" : editing ? "Save changes" : "Add Video"}</button>
        </div>
      </form>
    </div>
  );
}
