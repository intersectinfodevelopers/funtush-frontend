"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ImagePlus, Star, X } from "lucide-react";

import { uploadFile, validateUpload } from "@/lib/api/upload";
import { DESTINATION_CATEGORIES, DESTINATION_DIFFICULTIES, createDestination, updateDestination, type Destination } from "@/lib/api/agency/destinations";
import type { ApiError } from "@/lib/api/client";

const input = "mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const label = "block text-xs font-semibold text-neutral-700";
const Req = () => <span className="ml-0.5 text-danger-600" aria-hidden="true">*</span>;
const SUGGESTED_ACTIVITIES = ["trekking", "hiking", "camping", "sightseeing", "photography", "wildlife"];
const PHOTO_MAX_MB = 3;
const MAX_PHOTOS = 13; // 1 featured + up to 12 gallery
type Errors = Record<string, string>;

const num = (v: string): number | null => (v.trim() === "" ? null : Number(v));

function Card({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
      <p className="text-xs text-neutral-500">{hint}</p>
      <div className="mt-3 border-t border-neutral-100 pt-4">{children}</div>
    </section>
  );
}

function Toggle({ on, onChange, label: text, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <div>
      <span className={label}>{text}</span>
      <button type="button" role="switch" aria-checked={on} aria-label={text} onClick={() => onChange(!on)} className={`mt-2 flex h-6 w-12 items-center rounded-full p-0.5 transition ${on ? "bg-primary-900" : "bg-neutral-200"}`}>
        <span className={`h-5 w-5 rounded-full bg-white shadow transition ${on ? "translate-x-6" : ""}`} />
      </button>
      {hint && <p className="mt-1 max-w-[16rem] text-[11px] text-neutral-500">{hint}</p>}
    </div>
  );
}

export default function DestinationForm({ destination }: { destination?: Destination }) {
  const router = useRouter();
  const qc = useQueryClient();
  const editing = Boolean(destination);
  const fileRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({
    title: destination?.title ?? "", category: destination?.category ?? "", region: destination?.region ?? "", difficulty: destination?.difficulty ?? "",
    shortDescription: destination?.shortDescription ?? "", longDescription: destination?.longDescription ?? "", bestTimeToVisit: destination?.bestTimeToVisit ?? "",
    durationMin: String(destination?.duration.min ?? ""), durationMax: String(destination?.duration.max ?? ""),
    altitudeMin: String(destination?.altitude.min ?? ""), altitudeMax: String(destination?.altitude.max ?? ""),
    published: destination?.published ?? false, featured: destination?.featured ?? false,
  });
  const [activities, setActivities] = useState<string[]>(destination?.activities ?? []);
  const [activityText, setActivityText] = useState("");
  // One list of photos: the first is the featured image, the rest are the gallery.
  const [photos, setPhotos] = useState<string[]>([...(destination?.featuredImage ? [destination.featuredImage] : []), ...(destination?.gallery ?? [])]);
  const featuredImage = photos[0] ?? null;
  const gallery = photos.slice(1);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [summary, setSummary] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((c) => ({ ...c, [k]: e.target.value }));

  const save = useMutation({
    mutationFn: () => {
      const body = {
        title: f.title.trim(), category: f.category || null, region: f.region.trim() || null, difficulty: f.difficulty || null,
        shortDescription: f.shortDescription.trim() || null, longDescription: f.longDescription.trim() || null, bestTimeToVisit: f.bestTimeToVisit.trim() || null,
        activities, durationMin: num(f.durationMin), durationMax: num(f.durationMax), altitudeMin: num(f.altitudeMin), altitudeMax: num(f.altitudeMax),
        featuredImage, gallery, published: f.published, featured: f.featured,
      };
      return destination ? updateDestination(destination.id, body) : createDestination(body);
    },
    onSuccess: (d) => {
      toast.success(!editing ? (f.published ? `“${d.title}” was created and published` : `“${d.title}” was created as a draft`) : `“${d.title}” was saved`);
      void qc.invalidateQueries({ queryKey: ["agency", "destination"] });
      void qc.invalidateQueries({ queryKey: ["agency", "destinations"] });
      router.push("/dashboard/destinations");
    },
    onError: (e) => {
      const err = e as unknown as ApiError;
      setErrors(err.fields ?? {});
      setSummary(err.message || "Couldn't save the destination.");
      toast.error(err.message || "Couldn't save the destination.", { duration: 6000 });
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    },
  });

  async function addPhotos(files: FileList | File[] | null) {
    const picked = Array.from(files ?? []).slice(0, MAX_PHOTOS - photos.length);
    if (picked.length === 0) return;
    setBusy(true); setImgError(null);
    const urls: string[] = [];
    for (const file of picked) {
      const bad = validateUpload(file, { maxMb: PHOTO_MAX_MB });
      if (bad) { toast.error(`${file.name}: ${bad}`); continue; }
      try { urls.push(await uploadFile(file, { maxMb: PHOTO_MAX_MB })); } catch (e) { toast.error(`${file.name}: ${(e as ApiError).message || "Upload failed."}`); }
    }
    setBusy(false);
    if (urls.length) setPhotos((p) => [...p, ...urls]);
  }
  const addActivity = (raw: string) => {
    const t = raw.trim().replace(/,$/, "").trim();
    setActivityText("");
    if (t && !activities.some((a) => a.toLowerCase() === t.toLowerCase()) && activities.length < 20) setActivities((a) => [...a, t]);
  };

  function problems(): Errors {
    const e: Errors = {};
    if (!f.title.trim()) e.title = "Destination name is required.";
    for (const [k, l, max] of [["durationMin", "Minimum days", 365], ["durationMax", "Maximum days", 365], ["altitudeMin", "Minimum altitude", 9000], ["altitudeMax", "Maximum altitude", 9000]] as const) {
      const v = f[k];
      if (v.trim() !== "" && (!Number.isInteger(Number(v)) || Number(v) < 0 || Number(v) > max)) e[k] = `${l} must be a whole number between 0 and ${max}.`;
    }
    if (!e.durationMin && !e.durationMax && f.durationMin && f.durationMax && Number(f.durationMin) > Number(f.durationMax)) e.durationMin = "Minimum can't be more than the maximum.";
    if (!e.altitudeMin && !e.altitudeMax && f.altitudeMin && f.altitudeMax && Number(f.altitudeMin) > Number(f.altitudeMax)) e.altitudeMin = "Minimum can't be more than the maximum.";
    if (f.published) {
      const gaps = [!f.shortDescription.trim() && "a short description", !featuredImage && "a photo"].filter(Boolean);
      if (gaps.length) e.publish = `To publish, please add: ${gaps.join(" and ")}.`;
    }
    return e;
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const found = problems();
    if (Object.keys(found).length) {
      setErrors(found);
      const n = Object.keys(found).length;
      setSummary(`Please fix ${n === 1 ? "the highlighted field" : `the ${n} highlighted fields`} and try again.`);
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setErrors({});
    setSummary(null);
    save.mutate();
  }

  const E = (k: string) => (errors[k] ? <p role="alert" className="mt-1 text-xs text-danger-600">{errors[k]}</p> : null);
  const bad = (k: string) => (errors[k] ? " border-danger-500" : "");
  const cta = f.published ? (editing ? "Save changes" : "Publish Destination") : editing ? "Save changes" : "Save as draft";

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Card title="Featured Image" hint="This image represents the destination across the site. The first photo is the featured one; add more for the gallery (up to 12).">
        {photos.length > 0 && (
          <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {photos.map((u, i) => (
              <li key={u} className="group relative overflow-hidden rounded-2xl border border-neutral-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt={`Destination photo ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-primary-900 px-2 py-0.5 text-[10px] font-semibold text-white">Featured</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/50 p-1.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                  {i !== 0 && <button type="button" aria-label="Make featured" title="Make featured" onClick={() => setPhotos([u, ...photos.filter((x) => x !== u)])} className="rounded-full bg-white p-1.5 text-neutral-800"><Star className="h-3.5 w-3.5" /></button>}
                  <button type="button" aria-label="Remove photo" title="Remove" onClick={() => setPhotos(photos.filter((x) => x !== u))} className="rounded-full bg-white p-1.5 text-danger-600"><X className="h-3.5 w-3.5" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {photos.length < MAX_PHOTOS && (
          <div
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); void addPhotos(e.dataTransfer.files); }}
            className={`flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed p-8 text-center ${over ? "border-primary-400 bg-primary-50" : "border-neutral-200"}`}
          >
            <ImagePlus className="h-7 w-7 text-neutral-400" />
            <p className="text-xs text-neutral-500">{busy ? "Uploading…" : `Drag & drop up to ${MAX_PHOTOS - photos.length} image${MAX_PHOTOS - photos.length === 1 ? "" : "s"} here (JPG, JPEG, PNG, WebP or GIF, up to 3 MB)`}</p>
            <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="rounded-full bg-primary-900 px-5 py-2 text-xs font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{busy ? "Uploading…" : "Choose files"}</button>
            <input ref={fileRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif" aria-label="Choose photos" className="sr-only" onChange={(e) => { void addPhotos(e.target.files); e.target.value = ""; }} />
          </div>
        )}
        <p className={`mt-2 text-xs font-semibold ${photos.length ? "text-neutral-500" : "text-neutral-400"}`}>{photos.length}/{MAX_PHOTOS} photos</p>
        {imgError && <p role="alert" className="mt-2 text-xs text-danger-600">{imgError}</p>}
        {E("featuredImage")}
        {E("gallery")}
      </Card>

      <Card title="Destination Information" hint="Add the basic information for this destination.">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={label} htmlFor="d-title">Destination Name<Req /></label>
            <input id="d-title" aria-invalid={Boolean(errors.title)} value={f.title} onChange={set("title")} maxLength={150} placeholder="Enter destination name" className={`${input}${bad("title")}`} />
            {E("title")}
          </div>
          <div>
            <label className={label} htmlFor="d-cat">Category</label>
            <select id="d-cat" aria-invalid={Boolean(errors.category)} value={f.category} onChange={set("category")} className={`${input}${bad("category")}`}>
              <option value="">Select category</option>
              {DESTINATION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              {f.category && !(DESTINATION_CATEGORIES as readonly string[]).includes(f.category) && <option value={f.category}>{f.category}</option>}
            </select>
            {E("category")}
          </div>
        </div>
        <div className="mt-4">
          <label className={label} htmlFor="d-short">Short Description{f.published && <Req />}</label>
          <textarea id="d-short" rows={2} maxLength={300} aria-invalid={Boolean(errors.shortDescription)} value={f.shortDescription} onChange={set("shortDescription")} placeholder="Enter a short description" className={`${input}${bad("shortDescription")}`} />
          <div className="flex justify-between">{E("shortDescription") ?? <span />}<span className="mt-1 text-[11px] text-neutral-400">{f.shortDescription.length}/300</span></div>
        </div>
        <div className="mt-4">
          <label className={label} htmlFor="d-long">Long Description (optional)</label>
          <textarea id="d-long" rows={4} aria-invalid={Boolean(errors.longDescription)} value={f.longDescription} onChange={set("longDescription")} placeholder="Enter a detailed description" className={`${input}${bad("longDescription")}`} />
          {E("longDescription")}
        </div>
      </Card>

      <Card title="Location & Details" hint="Add location and destination details.">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={label} htmlFor="d-region">Region (optional)</label>
            <input id="d-region" aria-invalid={Boolean(errors.region)} value={f.region} onChange={set("region")} placeholder="Enter region" className={`${input}${bad("region")}`} />
            {E("region")}
          </div>
          <div>
            <label className={label} htmlFor="d-diff">Difficulty (optional)</label>
            <select id="d-diff" value={f.difficulty} onChange={set("difficulty")} className={input}>
              <option value="">Select difficulty</option>
              {DESTINATION_DIFFICULTIES.map((c) => <option key={c} value={c}>{c}</option>)}
              {f.difficulty && !(DESTINATION_DIFFICULTIES as readonly string[]).includes(f.difficulty) && <option value={f.difficulty}>{f.difficulty}</option>}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="d-act">Activities (optional)</label>
            <div className="mt-1 flex gap-2">
              <input
                id="d-act"
                value={activityText}
                onChange={(e) => (e.target.value.endsWith(",") ? addActivity(e.target.value) : setActivityText(e.target.value))}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addActivity(activityText); } }}
                placeholder="Add activity and press Enter"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
              <button type="button" onClick={() => addActivity(activityText)} className="rounded-xl bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800">Add</button>
            </div>
            {activities.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Chosen activities">
                {activities.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-900">{a}<button type="button" aria-label={`Remove ${a}`} onClick={() => setActivities((all) => all.filter((x) => x !== a))} className="text-primary-700 hover:text-danger-600"><X className="h-3 w-3" /></button></span>
                ))}
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUGGESTED_ACTIVITIES.filter((a) => !activities.includes(a)).map((a) => <button key={a} type="button" onClick={() => addActivity(a)} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600 hover:bg-primary-50 hover:text-primary-900">{a}</button>)}
            </div>
            {E("activities")}
          </div>
          <div>
            <label className={label} htmlFor="d-dmin">Duration Min (days, optional)</label>
            <input id="d-dmin" type="number" min={0} aria-invalid={Boolean(errors.durationMin)} value={f.durationMin} onChange={set("durationMin")} placeholder="Minimum days" className={`${input}${bad("durationMin")}`} />
            {E("durationMin")}
          </div>
          <div>
            <label className={label} htmlFor="d-dmax">Duration Max (days, optional)</label>
            <input id="d-dmax" type="number" min={0} aria-invalid={Boolean(errors.durationMax)} value={f.durationMax} onChange={set("durationMax")} placeholder="Maximum days" className={`${input}${bad("durationMax")}`} />
            {E("durationMax")}
          </div>
          <div>
            <label className={label} htmlFor="d-amin">Altitude Min (m, optional)</label>
            <input id="d-amin" type="number" min={0} aria-invalid={Boolean(errors.altitudeMin)} value={f.altitudeMin} onChange={set("altitudeMin")} placeholder="Minimum altitude" className={`${input}${bad("altitudeMin")}`} />
            {E("altitudeMin")}
          </div>
          <div>
            <label className={label} htmlFor="d-amax">Altitude Max (m, optional)</label>
            <input id="d-amax" type="number" min={0} aria-invalid={Boolean(errors.altitudeMax)} value={f.altitudeMax} onChange={set("altitudeMax")} placeholder="Maximum altitude" className={`${input}${bad("altitudeMax")}`} />
            {E("altitudeMax")}
          </div>
          <div className="md:col-span-2">
            <label className={label} htmlFor="d-best">Best Time to Visit (optional)</label>
            <input id="d-best" value={f.bestTimeToVisit} onChange={set("bestTimeToVisit")} placeholder="e.g. March - May, September - November" className={input} />
            {E("bestTimeToVisit")}
          </div>
        </div>
      </Card>

      <Card title="Publish" hint="Final settings before this destination goes live.">
        <div className="flex flex-wrap gap-10">
          <Toggle label="Published" on={f.published} onChange={(v) => setF((c) => ({ ...c, published: v }))} hint={!destination?.published ? "Your past customers get a notification in the Funtush app the first time you publish it." : undefined} />
          <Toggle label="Featured" on={f.featured} onChange={(v) => setF((c) => ({ ...c, featured: v }))} hint="Featured destinations are shown first." />
        </div>
        {E("publish")}
        {summary && <p role="alert" className="mt-4 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{summary}</p>}
        <div className="mt-5 flex items-center justify-end gap-3 border-t border-neutral-100 pt-4">
          <Link href="/dashboard/destinations" className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Cancel</Link>
          <button type="submit" disabled={save.isPending || busy} className="rounded-full bg-primary-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{save.isPending ? "Saving…" : cta}</button>
        </div>
      </Card>
    </form>
  );
}
