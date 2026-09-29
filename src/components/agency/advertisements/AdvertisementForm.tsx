"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ImagePlus, Megaphone } from "lucide-react";

import { uploadFile, validateUpload } from "@/lib/api/upload";
import { useAdPositions } from "@/hooks/useAgencyAds";
import { createAd, updateAd, type AdStatus, type SiteAd } from "@/lib/api/agency/ads";
import type { ApiError } from "@/lib/api/client";

const field = "mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const label = "block text-sm font-semibold text-neutral-800";
const Req = () => <span className="ml-0.5 text-danger-600" aria-hidden="true">*</span>;

export default function AdvertisementForm({ ad }: { ad?: SiteAd }) {
  const router = useRouter();
  const qc = useQueryClient();
  const editing = Boolean(ad);
  const positions = useAdPositions();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(ad?.title ?? "");
  const [image, setImage] = useState<string | null>(ad?.image ?? null);
  const [link, setLink] = useState(ad?.linkUrl ?? "");
  const [position, setPosition] = useState(ad?.position ?? "");
  const [active, setActive] = useState((ad?.status ?? "active") === "active");
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => {
      const body = { title: title.trim(), image: image!, linkUrl: link.trim() || null, position, status: (active ? "active" : "paused") as AdStatus };
      return ad ? updateAd(ad.id, body) : createAd(body);
    },
    onSuccess: (a) => {
      toast.success(editing ? `“${a.title}” was saved` : `“${a.title}” was created`);
      void qc.invalidateQueries({ queryKey: ["agency", "ads"] });
      router.push("/dashboard/advertisements");
    },
    onError: (e) => {
      const err = e as unknown as ApiError;
      setSummary(err.message || "Couldn't save the advertisement.");
      toast.error(err.message || "Couldn't save the advertisement.", { duration: 6000 });
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    },
  });

  async function pick(file: File | undefined) {
    if (!file) return;
    const problem = validateUpload(file);
    if (problem) return toast.error(problem);
    setBusy(true);
    try { setImage(await uploadFile(file)); } catch (e) { toast.error((e as ApiError).message || "Upload failed."); } finally { setBusy(false); }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (!title.trim()) found.title = "Advertisement title is required.";
    if (!image) found.image = "Upload an image for the ad.";
    if (link.trim() && !/^https?:\/\//i.test(link.trim()) && !/^\/(?![/\\])/.test(link.trim())) found.link = "The link must start with https:// (or / for a page on your site).";
    if (!position) found.position = "Choose where the ad appears.";
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
          <Link href="/dashboard/advertisements" className="hover:text-neutral-900">Advertisements</Link><span className="text-neutral-300">/</span>
          <span className="font-semibold text-neutral-900">{editing ? "Edit" : "New advertisement"}</span>
        </nav>
        <div className="mt-2 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><Megaphone className="h-5 w-5" /></span>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{editing ? "Edit Advertisement" : "Add Advertisement"}</h1>
            <p className="mt-0.5 text-sm text-neutral-500">{editing ? "Update this advertisement's details." : "Create a new advertisement and configure its details."}</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div>
              <label htmlFor="at" className={label}>Title<Req /></label>
              <input id="at" aria-invalid={Boolean(errors.title)} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Enter advertisement title" className={`${field}${bad("title")}`} />
              {E("title")}
            </div>

            <div>
              <p className={label}>Photo<Req /></p>
              {image ? (
                <div className="mt-1.5 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-neutral-200 p-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="Advertisement" className="max-h-48 w-full rounded-xl object-cover" />
                  <div className="flex gap-3">
                    <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-900 hover:bg-neutral-50">Change image</button>
                    <button type="button" onClick={() => setImage(null)} className="rounded-full border border-danger-200 bg-white px-4 py-2 text-xs font-semibold text-danger-600 hover:bg-danger-50">Remove</button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                  onDragLeave={() => setOver(false)}
                  onDrop={(e) => { e.preventDefault(); setOver(false); void pick(e.dataTransfer.files?.[0]); }}
                  className={`mt-1.5 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center ${over ? "border-primary-400 bg-primary-50" : errors.image ? "border-danger-400" : "border-neutral-200"}`}
                >
                  <ImagePlus className="h-7 w-7 text-neutral-400" />
                  <p className="text-sm text-neutral-500">{busy ? "Uploading…" : "Drag & drop an image here"}</p>
                  <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="rounded-full bg-primary-900 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">Choose file</button>
                  <p className="text-xs text-neutral-400">JPG, PNG, WebP or GIF, up to 10 MB</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif" aria-label="Choose advertisement image" className="sr-only" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
              {E("image")}
            </div>

            <div>
              <label htmlFor="al" className={label}>Link (optional)</label>
              <input id="al" aria-invalid={Boolean(errors.link)} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://… or /packages/everest" className={`${field}${bad("link")}`} />
              {E("link")}
            </div>
          </div>

          <div className="space-y-5 lg:border-l lg:border-neutral-100 lg:pl-8">
            <h2 className="text-base font-bold text-neutral-900">Publish Settings</h2>
            <div>
              <label htmlFor="ap" className={label}>Position<Req /></label>
              <select id="ap" aria-invalid={Boolean(errors.position)} value={position} onChange={(e) => setPosition(e.target.value)} className={`${field}${bad("position")}`}>
                <option value="">Select position</option>
                {(positions.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              {E("position")}
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
          <Link href="/dashboard/advertisements" className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Cancel</Link>
          <button type="submit" disabled={save.isPending || busy} className="rounded-full bg-primary-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{save.isPending ? "Saving…" : editing ? "Save changes" : "Add Advertisement"}</button>
        </div>
      </form>
    </div>
  );
}
