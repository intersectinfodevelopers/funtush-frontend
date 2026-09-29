"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ImagePlus, Plus, Star, Trash2, Upload, X } from "lucide-react";

import { useDestinationList } from "@/hooks/useAgencyDestinations";
import { usePackageDetail } from "@/hooks/useAgencyPackages";
import { uploadFile, validateUpload } from "@/lib/api/upload";
import {
  DIFFICULTY_LABEL,
  PACKAGE_CATEGORIES,
  PACKAGE_CURRENCIES,
  addAddOn,
  addDeparture,
  addItineraryDay,
  createPackage,
  deleteAddOn,
  deleteDeparture,
  deleteItineraryDay,
  publishPackage,
  restorePackage,
  unpublishPackage,
  updateAddOn,
  updateDeparture,
  updateItineraryDay,
  updatePackage,
  type ApiPackageDetail,
  type Difficulty,
  type PackageInput,
} from "@/lib/api/agency/packages";
import type { ApiError } from "@/lib/api/client";

const field = "mt-1 w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const lbl = "block text-xs font-semibold text-neutral-700";
const h2 = "text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-600";
const strip = "flex items-end justify-between gap-3 bg-neutral-50 px-5 py-3";
const sub = "text-xs text-neutral-500";
const btnDark = "inline-flex items-center gap-1.5 bg-primary-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-800 disabled:opacity-50";
const btnGhost = "inline-flex items-center gap-2 border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 disabled:opacity-50";
const errText = (e: unknown) => (e as ApiError).message || "That didn't work — please try again.";
const PHOTO_MAX_MB = 3;
const MAX_PHOTOS = 5;

// ── Form state ──────────────────────────────────────────────────────────────

interface DayRow { location: string; altitude: string; description: string }
interface DepRow { id?: string; startDate: string; maxSlots: string; booked: number }
interface AddOnRow { id?: string; name: string; price: string; perPerson: boolean }
interface TierRow { minPeople: string; percentOff: string }
interface FormState {
  title: string; destination: string; category: string; difficulty: Difficulty;
  durationDays: string; maxGroupSize: string; minDuration: string; maxDuration: string;
  altMin: string; altMax: string; region: string; bestTime: string; activities: string; routes: string;
  shortSummary: string; description: string; photos: string[];
  days: DayRow[]; departures: DepRow[]; addOns: AddOnRow[];
  price: string; currency: string; tiers: TierRow[];
  published: boolean; featured: boolean;
}

const EMPTY: FormState = {
  title: "", destination: "", category: "", difficulty: "MODERATE", durationDays: "1", maxGroupSize: "12", minDuration: "", maxDuration: "",
  altMin: "", altMax: "", region: "", bestTime: "", activities: "", routes: "", shortSummary: "", description: "", photos: [],
  days: [], departures: [], addOns: [], price: "", currency: "NPR", tiers: [], published: false, featured: false,
};

const n = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v));

function toForm(p: ApiPackageDetail): FormState {
  return {
    title: p.title, destination: p.destination ?? "", category: p.category ?? "", difficulty: p.difficulty,
    durationDays: String(p.durationDays), maxGroupSize: String(p.maxGroupSize), minDuration: n(p.minDurationDays), maxDuration: n(p.maxDurationDays),
    altMin: n(p.altitudeMinM), altMax: n(p.altitudeMaxM), region: p.region ?? "", bestTime: p.bestTimeToVisit ?? "",
    activities: (p.activities ?? []).join(", "), routes: (p.routes ?? []).join(", "), shortSummary: p.shortSummary ?? "", description: p.description ?? "",
    photos: p.photos ?? [],
    days: [...p.itineraries].sort((a, b) => a.dayNumber - b.dayNumber).map((d) => ({ location: d.location ?? "", altitude: n(d.altitudeM), description: d.description ?? "" })),
    departures: [...p.departureDates].sort((a, b) => a.startDate.localeCompare(b.startDate)).map((d) => ({ id: d.id, startDate: d.startDate.slice(0, 10), maxSlots: String(d.maxSlots), booked: d.bookedSlots })),
    addOns: p.addOns.map((a) => ({ id: a.id, name: a.name, price: String(Number(a.price)), perPerson: a.perPerson })),
    price: String(Number(p.pricePerPerson)), currency: p.currency ?? "NPR",
    tiers: (p.volumeDiscounts ?? []).map((t) => ({ minPeople: String(t.minPeople), percentOff: String(t.percentOff) })),
    published: p.status === "PUBLISHED", featured: Boolean(p.isFeatured),
  };
}

const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const intOrNull = (s: string) => (s.trim() === "" ? null : Number(s));

/** Everything the form can say about the package itself (not its itinerary / departures / add-ons). */
function toInput(f: FormState): PackageInput {
  return {
    title: f.title.trim(), description: f.description.trim() || undefined, durationDays: Number(f.durationDays), pricePerPerson: Number(f.price),
    difficulty: f.difficulty, maxGroupSize: Number(f.maxGroupSize), photos: f.photos,
    destination: f.destination.trim() || null, category: f.category || null,
    minDurationDays: intOrNull(f.minDuration), maxDurationDays: intOrNull(f.maxDuration), altitudeMinM: intOrNull(f.altMin), altitudeMaxM: intOrNull(f.altMax),
    region: f.region.trim() || null, bestTimeToVisit: f.bestTime.trim() || null, activities: list(f.activities), routes: list(f.routes),
    shortSummary: f.shortSummary.trim() || null, currency: f.currency, isFeatured: f.featured,
    volumeDiscounts: f.tiers.filter((t) => t.minPeople || t.percentOff).map((t) => ({ minPeople: Number(t.minPeople), percentOff: Number(t.percentOff) })),
  };
}

/** Today as YYYY-MM-DD in the user's own timezone (what a date input compares against). */
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

type Errors = Record<string, string>;

/** Every problem with the form, keyed by the input it belongs to (the server checks everything again). */
function problems(f: FormState, original: ApiPackageDetail | null): Errors {
  const e: Errors = {};
  if (!f.title.trim()) e.title = "Title is required.";
  if (!Number.isInteger(Number(f.durationDays)) || Number(f.durationDays) < 1) e.durationDays = "Enter the number of days (1 or more).";
  if (!Number.isInteger(Number(f.maxGroupSize)) || Number(f.maxGroupSize) < 1) e.maxGroupSize = "Enter a group size (1 or more).";
  if (f.price.trim() === "" || !(Number(f.price) >= 0)) e.pricePerPerson = "Price is required.";
  if (f.photos.length === 0) e.photos = "Add at least one photo.";
  for (const [v, k, l] of [[f.minDuration, "minDurationDays", "Minimum duration"], [f.maxDuration, "maxDurationDays", "Maximum duration"], [f.altMin, "altitudeMinM", "Minimum altitude"], [f.altMax, "altitudeMaxM", "Maximum altitude"]] as const) {
    if (v.trim() !== "" && (!Number.isInteger(Number(v)) || Number(v) < 0)) e[k] = `${l} must be a whole number.`;
  }
  if (!e.minDurationDays && !e.maxDurationDays && f.minDuration && f.maxDuration && Number(f.minDuration) > Number(f.maxDuration)) e.minDurationDays = "Minimum can't be more than the maximum.";
  if (!e.altitudeMinM && !e.altitudeMaxM && f.altMin && f.altMax && Number(f.altMin) > Number(f.altMax)) e.altitudeMinM = "Minimum can't be more than the maximum.";
  const seen = new Set<string>();
  for (const [i, d] of f.departures.entries()) {
    if (!d.startDate) e[`departures.${i}`] = "Pick a departure date.";
    else if (seen.has(d.startDate)) e[`departures.${i}`] = "Another departure already has this date.";
    else {
      seen.add(d.startDate);
      // A new or re-dated departure can't be in the past (one that's already gone by is left alone).
      const was = d.id ? original?.departureDates.find((o) => o.id === d.id)?.startDate.slice(0, 10) : undefined;
      if (d.startDate !== was && d.startDate < today()) e[`departures.${i}`] = "The date can't be in the past — pick today or later.";
    }
    if (!e[`departures.${i}`]) {
      if (!Number.isInteger(Number(d.maxSlots)) || Number(d.maxSlots) < 1) e[`departures.${i}`] = "Enter the number of slots (1 or more).";
      else if (d.booked > Number(d.maxSlots)) e[`departures.${i}`] = `${d.booked} seats are already booked, so this needs at least ${d.booked} slots.`;
    }
  }
  for (const [i, t] of f.tiers.entries()) if (!(Number(t.minPeople) >= 2) || !(Number(t.percentOff) > 0 && Number(t.percentOff) <= 90)) e[`tiers.${i}`] = "Use a group of 2 or more and a discount between 0 and 90%.";
  for (const [i, a] of f.addOns.entries()) if (!a.name.trim() || a.price.trim() === "" || !(Number(a.price) >= 0)) e[`addOns.${i}`] = "An add-on needs a name and a price.";
  return e;
}

/** Brings the server's itinerary / departures / add-ons in line with the form (only what changed). */
/** Runs one step of the sync and, if it fails, says which itinerary day / departure / add-on it was. */
async function step<T>(what: string, run: () => Promise<T>): Promise<T> {
  try { return await run(); } catch (err) {
    const e = err as ApiError;
    throw Object.assign(new Error(`${what}: ${e.message || "couldn't be saved."}`), { status: e.status });
  }
}

async function syncChildren(id: string, f: FormState, before: ApiPackageDetail | null) {
  const oldDays = new Map((before?.itineraries ?? []).map((d) => [d.dayNumber, d]));
  for (const [i, d] of f.days.entries()) {
    const body = { location: d.location.trim() || undefined, description: d.description.trim() || undefined, altitudeM: intOrNull(d.altitude) };
    const old = oldDays.get(i + 1);
    if (!old) await step(`Itinerary day ${i + 1}`, () => addItineraryDay(id, { dayNumber: i + 1, ...body }));
    else if ((old.location ?? "") !== d.location.trim() || (old.description ?? "") !== d.description.trim() || (old.altitudeM ?? null) !== body.altitudeM) {
      await step(`Itinerary day ${i + 1}`, () => updateItineraryDay(id, i + 1, { location: d.location.trim(), description: d.description.trim(), altitudeM: body.altitudeM }));
    }
  }
  for (const day of [...oldDays.keys()].filter((k) => k > f.days.length).sort((a, b) => b - a)) await step(`Itinerary day ${day}`, () => deleteItineraryDay(id, day));

  const oldDeps = new Map((before?.departureDates ?? []).map((d) => [d.id, d]));
  const keep = new Set(f.departures.map((d) => d.id).filter(Boolean));
  for (const old of oldDeps.values()) if (!keep.has(old.id)) await step(`Departure ${old.startDate.slice(0, 10)}`, () => deleteDeparture(id, old.id));
  for (const d of f.departures) {
    const old = d.id ? oldDeps.get(d.id) : undefined;
    if (!old) await step(`Departure ${d.startDate}`, () => addDeparture(id, { startDate: d.startDate, maxSlots: Number(d.maxSlots) }));
    else if (old.startDate.slice(0, 10) !== d.startDate || old.maxSlots !== Number(d.maxSlots)) {
      await step(`Departure ${d.startDate}`, () => updateDeparture(id, old.id, { ...(old.startDate.slice(0, 10) !== d.startDate ? { startDate: d.startDate } : {}), maxSlots: Number(d.maxSlots) }));
    }
  }

  const oldAdd = new Map((before?.addOns ?? []).map((a) => [a.id, a]));
  const keepAdd = new Set(f.addOns.map((a) => a.id).filter(Boolean));
  for (const old of oldAdd.values()) if (!keepAdd.has(old.id)) await step(`Add-on “${old.name}”`, () => deleteAddOn(id, old.id));
  for (const a of f.addOns) {
    const old = a.id ? oldAdd.get(a.id) : undefined;
    const body = { name: a.name.trim(), price: Number(a.price), perPerson: a.perPerson };
    if (!old) await step(`Add-on “${body.name}”`, () => addAddOn(id, body));
    else if (old.name !== body.name || Number(old.price) !== body.price || old.perPerson !== body.perPerson) await step(`Add-on “${body.name}”`, () => updateAddOn(id, old.id, body));
  }
}

// ── Small pieces ────────────────────────────────────────────────────────────

/** The red * that marks a required field. */
const Req = () => <span className="ml-0.5 text-danger-600" aria-hidden="true">*</span>;

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div>
      <span className={lbl}>{label}</span>
      <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`mt-2 flex h-6 w-12 items-center rounded-full p-0.5 transition ${on ? "bg-primary-900" : "bg-neutral-200"}`}>
        <span className={`h-5 w-5 rounded-full bg-white shadow transition ${on ? "translate-x-6" : ""}`} />
      </button>
    </div>
  );
}

function PhotoDrop({ photos, onChange }: { photos: string[]; onChange: (p: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  async function add(files: FileList | File[] | null) {
    const picked = Array.from(files ?? []).slice(0, MAX_PHOTOS - photos.length);
    if (picked.length === 0) return;
    setBusy(true);
    const urls: string[] = [];
    for (const file of picked) {
      const bad = validateUpload(file, { maxMb: PHOTO_MAX_MB });
      if (bad) { toast.error(`${file.name}: ${bad}`); continue; }
      try { urls.push(await uploadFile(file, { maxMb: PHOTO_MAX_MB })); } catch (e) { toast.error(`${file.name}: ${errText(e)}`); }
    }
    setBusy(false);
    if (urls.length) onChange([...photos, ...urls]);
  }

  return (
    <section className="border-b border-neutral-200">
      <div className={strip}>
        <div>
          <h2 className={h2}>Photos<Req /></h2>
          <p className={sub}>At least one photo is required, up to {MAX_PHOTOS}. The first one is the featured photo — click ★ on any other to change it.</p>
        </div>
        <span className={`text-xs font-semibold ${photos.length ? "text-neutral-600" : "text-danger-600"}`}>{photos.length}/{MAX_PHOTOS} photos</span>
      </div>
      <div className="p-5">
      {photos.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {photos.map((u, i) => (
            <li key={u} className="group relative overflow-hidden border border-neutral-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt={`Package photo ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
              {i === 0 && <span className="absolute left-2 top-2 bg-primary-900 px-2 py-0.5 text-[10px] font-semibold text-white">Featured</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/50 p-1.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                {i !== 0 && <button type="button" aria-label="Make featured" title="Make featured" onClick={() => onChange([u, ...photos.filter((x) => x !== u)])} className="bg-white p-1.5 text-neutral-800"><Star className="h-3.5 w-3.5" /></button>}
                <button type="button" aria-label="Remove photo" title="Remove" onClick={() => onChange(photos.filter((x) => x !== u))} className="bg-white p-1.5 text-danger-600"><X className="h-3.5 w-3.5" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {photos.length < MAX_PHOTOS && (
        <div
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); void add(e.dataTransfer.files); }}
          className={`mt-3 flex flex-col items-center gap-3 border-2 border-dashed p-8 text-center ${over ? "border-primary-400 bg-primary-50" : "border-neutral-200"}`}
        >
          <Upload className="h-6 w-6 text-neutral-400" />
          <p className="text-xs text-neutral-500">Drag &amp; drop up to {MAX_PHOTOS - photos.length} photo{MAX_PHOTOS - photos.length === 1 ? "" : "s"} here (JPG, JPEG, PNG, WebP or GIF, up to 3 MB)</p>
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className={btnDark}><ImagePlus className="h-4 w-4" />{busy ? "Uploading…" : "Choose files"}</button>
          <input ref={inputRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif" aria-label="Choose photos" className="sr-only" onChange={(e) => { void add(e.target.files); e.target.value = ""; }} />
        </div>
      )}
      </div>
    </section>
  );
}

function Section({ title, hint, action, children }: { title: string; hint?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-b border-neutral-200">
      <div className={strip}>
        <div>
          <h2 className={h2}>{title}</h2>
          {hint && <p className={sub}>{hint}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-3 p-5">{children}</div>
    </section>
  );
}

const iconBtn = "p-2 text-danger-600 hover:bg-danger-50";
const empty = "border border-dashed border-neutral-200 p-4 text-center text-xs text-neutral-500";

// ── The form ────────────────────────────────────────────────────────────────

function Builder({ initial, original, onSaved }: { initial: FormState; original: ApiPackageDetail | null; onSaved: () => void }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [f, setF] = useState<FormState>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const destinations = useDestinationList({ limit: 100 });
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((c) => ({ ...c, [k]: v }));
  const text = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(k, e.target.value as never);
  const E = (k: string) => (errors[k] ? <p role="alert" className="mt-1 text-xs text-danger-600">{errors[k]}</p> : null);
  const rowErrors = (prefix: string, label: string) => Object.entries(errors).filter(([k]) => k.startsWith(`${prefix}.`)).map(([k, m]) => <p key={k} role="alert" className="text-xs text-danger-600">{label} {Number(k.split(".")[1]) + 1}: {m}</p>);
  const archived = original?.status === "ARCHIVED";
  const editing = original !== null;
  const wasPublished = original?.status === "PUBLISHED";

  const refresh = () => {
    setTimeout(() => void qc.invalidateQueries({ queryKey: ["agency", "package"] }), 900); // the history entry is written just after the response
    setTimeout(() => void qc.invalidateQueries({ queryKey: ["agency", "package-activity"] }), 900); // the bell shows who just did this (written just after the response)
    void qc.invalidateQueries({ queryKey: ["agency", "package"] });
    void qc.invalidateQueries({ queryKey: ["agency", "packages"] });
    void qc.invalidateQueries({ queryKey: ["agency", "summary"] });
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const found = problems(f, original);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const n = Object.keys(found).length;
      setError(`Please fix ${n === 1 ? "the highlighted field" : `the ${n} highlighted fields`} and try again.`);
      toast.error(`Can't save yet — ${n === 1 ? "one field needs" : `${n} fields need`} attention.`);
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setErrors({});
    setError(null);
    setBusy(true);
    let id = original?.id ?? null;
    try {
      if (id) await updatePackage(id, toInput(f));
      else id = (await createPackage(toInput(f))).id;
      await syncChildren(id, f, original);
      if (f.published && !wasPublished && !archived) await publishPackage(id);
      if (!f.published && wasPublished) await unpublishPackage(id);
      const name = `“${f.title.trim()}”`;
      toast.success(!editing ? (f.published ? `${name} was created and published` : `${name} was created as a draft`) : f.published && !wasPublished ? `${name} is now published` : !f.published && wasPublished ? `${name} was unpublished (back to draft)` : `${name} was saved`);
      refresh();
      if (editing) onSaved();
      else router.replace(`/dashboard/packages/${id}/edit`);
    } catch (err) {
      refresh();
      const e = err as ApiError;
      setErrors(e.fields ?? {});
      setError(errText(err));
      toast.error(errText(err));
      // A brand-new package that was created but not fully saved continues on its own edit page.
      if (!editing && id) { toast(`“${f.title.trim()}” was created as a draft, but a part of it couldn't be saved — finish it here.`, { duration: 6000 }); router.replace(`/dashboard/packages/${id}/edit`); }
      else requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    if (!original) return;
    setBusy(true);
    try {
      await restorePackage(original.id);
      toast.success(`“${original.title}” was restored as a draft — review it, then publish`);
      refresh();
      onSaved();
    } catch (err) {
      setError(errText(err));
      toast.error(errText(err), { duration: 6000 });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="border border-neutral-200 bg-white" noValidate>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 p-5">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Package Builder</h2>
          <p className={sub}>{editing ? "Changes are saved when you press the button at the bottom." : "All package settings."} Fields marked <span className="text-danger-600">*</span> are required.</p>
        </div>
      </div>

      {archived && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-warning-200 bg-warning-50 px-5 py-3 text-sm text-warning-800">
          <p>This package is <strong>archived</strong>. You can still edit it. To bring it back, restore it as a draft, then publish — its departure date must be today or later.</p>
          <button type="button" disabled={busy} onClick={() => void restore()} className={btnDark}>Restore as draft</button>
        </div>
      )}
      <Section title="Basic Information" hint="Core details that identify this package.">
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className={lbl} htmlFor="pk-title">Trek Title<Req /></label><input id="pk-title" aria-invalid={Boolean(errors.title)} className={`${field}${errors.title ? " border-danger-500" : ""}`} placeholder="e.g., Manaslu Circuit Tour" value={f.title} onChange={text("title")} />{E("title")}</div>
          <div>
            <label className={lbl} htmlFor="pk-dest">Destination</label>
            <input id="pk-dest" aria-invalid={Boolean(errors.destination)} list="pk-dest-list" className={`${field}${errors.destination ? " border-danger-500" : ""}`} placeholder="Type or choose a destination" value={f.destination} onChange={text("destination")} />{E("destination")}
            <datalist id="pk-dest-list">{(destinations.data?.destinations ?? []).map((d) => <option key={d.id} value={d.title} />)}</datalist>
          </div>
          <div>
            <label className={lbl} htmlFor="pk-cat">Category</label>
            <select id="pk-cat" aria-invalid={Boolean(errors.category)} className={`${field}${errors.category ? " border-danger-500" : ""}`} value={f.category} onChange={text("category")}>
              <option value="">Select a category</option>
              {PACKAGE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>{E("category")}
          </div>
          <div>
            <label className={lbl} htmlFor="pk-diff">Difficulty<Req /></label>
            <select id="pk-diff" aria-invalid={Boolean(errors.difficulty)} className={`${field}${errors.difficulty ? " border-danger-500" : ""}`} value={f.difficulty} onChange={text("difficulty")}>
              {(Object.keys(DIFFICULTY_LABEL) as Difficulty[]).map((d) => <option key={d} value={d}>{DIFFICULTY_LABEL[d]}</option>)}
            </select>{E("difficulty")}
          </div>
          <div><label className={lbl} htmlFor="pk-days">Duration (Days)<Req /></label><input id="pk-days" aria-invalid={Boolean(errors.durationDays)} type="number" min={1} className={`${field}${errors.durationDays ? " border-danger-500" : ""}`} value={f.durationDays} onChange={text("durationDays")} />{E("durationDays")}</div>
          <div><label className={lbl} htmlFor="pk-group">Max Group Size<Req /></label><input id="pk-group" aria-invalid={Boolean(errors.maxGroupSize)} type="number" min={1} className={`${field}${errors.maxGroupSize ? " border-danger-500" : ""}`} value={f.maxGroupSize} onChange={text("maxGroupSize")} />{E("maxGroupSize")}</div>
          <div><label className={lbl} htmlFor="pk-dmin">Duration Min (days, optional)</label><input id="pk-dmin" aria-invalid={Boolean(errors.minDurationDays)} type="number" min={1} className={`${field}${errors.minDurationDays ? " border-danger-500" : ""}`} value={f.minDuration} onChange={text("minDuration")} />{E("minDurationDays")}</div>
          <div><label className={lbl} htmlFor="pk-dmax">Duration Max (days, optional)</label><input id="pk-dmax" aria-invalid={Boolean(errors.maxDurationDays)} type="number" min={1} className={`${field}${errors.maxDurationDays ? " border-danger-500" : ""}`} value={f.maxDuration} onChange={text("maxDuration")} />{E("maxDurationDays")}</div>
          <div><label className={lbl} htmlFor="pk-amin">Altitude Min (m, optional)</label><input id="pk-amin" aria-invalid={Boolean(errors.altitudeMinM)} type="number" min={0} className={`${field}${errors.altitudeMinM ? " border-danger-500" : ""}`} value={f.altMin} onChange={text("altMin")} />{E("altitudeMinM")}</div>
          <div><label className={lbl} htmlFor="pk-amax">Altitude Max (m, optional)</label><input id="pk-amax" aria-invalid={Boolean(errors.altitudeMaxM)} type="number" min={0} className={`${field}${errors.altitudeMaxM ? " border-danger-500" : ""}`} value={f.altMax} onChange={text("altMax")} />{E("altitudeMaxM")}</div>
          <div><label className={lbl} htmlFor="pk-region">Region (optional)</label><input id="pk-region" aria-invalid={Boolean(errors.region)} className={`${field}${errors.region ? " border-danger-500" : ""}`} value={f.region} onChange={text("region")} />{E("region")}</div>
          <div><label className={lbl} htmlFor="pk-best">Best Time to Visit (optional)</label><input id="pk-best" aria-invalid={Boolean(errors.bestTimeToVisit)} className={`${field}${errors.bestTimeToVisit ? " border-danger-500" : ""}`} value={f.bestTime} onChange={text("bestTime")} />{E("bestTimeToVisit")}</div>
          <div><label className={lbl} htmlFor="pk-act">Activities (optional)</label><input id="pk-act" aria-invalid={Boolean(errors.activities)} className={`${field}${errors.activities ? " border-danger-500" : ""}`} placeholder="Comma separated (trekking, camping)" value={f.activities} onChange={text("activities")} />{E("activities")}</div>
          <div><label className={lbl} htmlFor="pk-routes">Routes &amp; Trails (optional)</label><input id="pk-routes" aria-invalid={Boolean(errors.routes)} className={`${field}${errors.routes ? " border-danger-500" : ""}`} placeholder="Comma separated route names" value={f.routes} onChange={text("routes")} />{E("routes")}</div>
        </div>
        <div><label className={lbl} htmlFor="pk-sum">Short Summary Pitch</label><textarea id="pk-sum" aria-invalid={Boolean(errors.shortSummary)} rows={2} maxLength={300} className={`${field}${errors.shortSummary ? " border-danger-500" : ""}`} placeholder="Enter brief overview context…" value={f.shortSummary} onChange={text("shortSummary")} />{E("shortSummary")}</div>
        <div><label className={lbl} htmlFor="pk-desc">Full Description{f.published && <Req />}</label><textarea id="pk-desc" aria-invalid={Boolean(errors.description)} rows={4} className={`${field}${errors.description ? " border-danger-500" : ""}`} placeholder="Write the full itinerary overview…" value={f.description} onChange={text("description")} />{E("description")}</div>
      </Section>

      <PhotoDrop photos={f.photos} onChange={(p) => set("photos", p)} />
      {E("photos") && <div className="px-5 pb-3">{E("photos")}</div>}

      <Section title="Itinerary" hint="Day-by-day route plan." action={<button type="button" onClick={() => set("days", [...f.days, { location: "", altitude: "", description: "" }])} className={btnDark}><Plus className="h-4 w-4" /> Add Day</button>}>
        {f.days.length === 0 ? <p className={empty}>No itinerary days yet — publishing needs at least one.</p> : (
          <ol className="space-y-3">
            {f.days.map((d, i) => (
              <li key={i} className="border border-neutral-200 bg-neutral-50/60 p-4">
                <div className="flex items-center justify-between"><span className="text-sm font-bold text-neutral-900">Day {i + 1}</span><button type="button" aria-label={`Remove day ${i + 1}`} onClick={() => set("days", f.days.filter((_, j) => j !== i))} className={iconBtn}><Trash2 className="h-4 w-4" /></button></div>
                <div className="mt-2 grid gap-3 md:grid-cols-[1fr_180px]">
                  <div><label className={lbl} htmlFor={`d-loc-${i}`}>Location</label><input id={`d-loc-${i}`} className={field} value={d.location} onChange={(e) => set("days", f.days.map((x, j) => (j === i ? { ...x, location: e.target.value } : x)))} /></div>
                  <div><label className={lbl} htmlFor={`d-alt-${i}`}>Altitude (m)</label><input id={`d-alt-${i}`} type="number" min={0} className={field} value={d.altitude} onChange={(e) => set("days", f.days.map((x, j) => (j === i ? { ...x, altitude: e.target.value } : x)))} /></div>
                </div>
                <div className="mt-3"><label className={lbl} htmlFor={`d-desc-${i}`}>What happens</label><textarea id={`d-desc-${i}`} rows={2} className={field} value={d.description} onChange={(e) => set("days", f.days.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} /></div>
              </li>
            ))}
          </ol>
        )}
      </Section>

      <Section title="Departure Date" hint="One departure date per package. Once the date has passed the package is archived automatically." action={f.departures.length === 0 ? <button type="button" onClick={() => set("departures", [{ startDate: "", maxSlots: f.maxGroupSize || "10", booked: 0 }])} className={btnDark}><Plus className="h-4 w-4" /> Add Departure</button> : undefined}>
        {f.departures.length === 0 ? <p className={empty}>No departure date yet — publishing needs one.</p> : (
          <ul className="space-y-3">
            {f.departures.map((d, i) => (
              <li key={d.id ?? i} className="grid items-end gap-3 border border-neutral-200 bg-neutral-50/60 p-4 md:grid-cols-[1fr_1fr_auto]">
                <div><label className={lbl} htmlFor={`dp-date-${i}`}>Departure date<Req /></label><input id={`dp-date-${i}`} type="date" min={d.id && d.startDate < today() ? undefined : today()} className={field} value={d.startDate} onChange={(e) => set("departures", f.departures.map((x, j) => (j === i ? { ...x, startDate: e.target.value } : x)))} /></div>
                <div><label className={lbl} htmlFor={`dp-slots-${i}`}>Slots for this date<Req />{d.booked > 0 ? ` (${d.booked} booked)` : ""}</label><input id={`dp-slots-${i}`} type="number" min={Math.max(1, d.booked)} className={field} value={d.maxSlots} onChange={(e) => set("departures", f.departures.map((x, j) => (j === i ? { ...x, maxSlots: e.target.value } : x)))} /></div>
                <button type="button" aria-label={`Remove departure ${i + 1}`} disabled={d.booked > 0} title={d.booked > 0 ? "This departure has bookings" : "Remove"} onClick={() => set("departures", f.departures.filter((_, j) => j !== i))} className={`${iconBtn} disabled:opacity-30`}><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        )}
      {rowErrors("departures", "Departure")}
      </Section>

      <Section title="Pricing" hint="Base price and optional group-size discounts.">
        <div className="grid gap-4 md:grid-cols-[1fr_200px]">
          <div><label className={lbl} htmlFor="pk-price">Base Price<Req /></label><input id="pk-price" aria-invalid={Boolean(errors.pricePerPerson)} type="number" min={0} step="0.01" className={`${field}${errors.pricePerPerson ? " border-danger-500" : ""}`} placeholder="Price per person" value={f.price} onChange={text("price")} />{E("pricePerPerson")}</div>
          <div>
            <label className={lbl} htmlFor="pk-cur">Currency</label>
            <select id="pk-cur" aria-invalid={Boolean(errors.currency)} className={`${field}${errors.currency ? " border-danger-500" : ""}`} value={f.currency} onChange={text("currency")}>{PACKAGE_CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}</select>{E("currency")}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
          <span className="text-xs font-semibold text-neutral-700">Volume Discount Tiers (optional)</span>
          <button type="button" onClick={() => set("tiers", [...f.tiers, { minPeople: "", percentOff: "" }])} className={btnDark}><Plus className="h-4 w-4" /> Add tier</button>
        </div>
        {f.tiers.map((t, i) => (
          <div key={i} className="grid items-end gap-3 md:grid-cols-[1fr_1fr_auto]">
            <div><label className={lbl} htmlFor={`t-min-${i}`}>Group of at least<Req /></label><input id={`t-min-${i}`} type="number" min={2} className={field} value={t.minPeople} onChange={(e) => set("tiers", f.tiers.map((x, j) => (j === i ? { ...x, minPeople: e.target.value } : x)))} /></div>
            <div><label className={lbl} htmlFor={`t-off-${i}`}>Discount (%)<Req /></label><input id={`t-off-${i}`} type="number" min={1} max={90} step="0.5" className={field} value={t.percentOff} onChange={(e) => set("tiers", f.tiers.map((x, j) => (j === i ? { ...x, percentOff: e.target.value } : x)))} /></div>
            <button type="button" aria-label={`Remove tier ${i + 1}`} onClick={() => set("tiers", f.tiers.filter((_, j) => j !== i))} className={iconBtn}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      {rowErrors("tiers", "Discount tier")}{E("volumeDiscounts")}
      </Section>

      <Section title="Add-ons" hint="Optional extras a trekker can add to a booking." action={<button type="button" onClick={() => set("addOns", [...f.addOns, { name: "", price: "", perPerson: false }])} className={btnDark}><Plus className="h-4 w-4" /> Add add-on</button>}>
        {f.addOns.length === 0 ? <p className={empty}>No add-ons.</p> : f.addOns.map((a, i) => (
          <div key={a.id ?? i} className="grid items-end gap-3 md:grid-cols-[1fr_160px_auto_auto]">
            <div><label className={lbl} htmlFor={`a-name-${i}`}>Name<Req /></label><input id={`a-name-${i}`} className={field} value={a.name} onChange={(e) => set("addOns", f.addOns.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} /></div>
            <div><label className={lbl} htmlFor={`a-price-${i}`}>Price<Req /></label><input id={`a-price-${i}`} type="number" min={0} step="0.01" className={field} value={a.price} onChange={(e) => set("addOns", f.addOns.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} /></div>
            <label className="flex items-center gap-2 pb-3 text-xs text-neutral-700"><input type="checkbox" checked={a.perPerson} onChange={(e) => set("addOns", f.addOns.map((x, j) => (j === i ? { ...x, perPerson: e.target.checked } : x)))} /> per person</label>
            <button type="button" aria-label={`Remove add-on ${i + 1}`} onClick={() => set("addOns", f.addOns.filter((_, j) => j !== i))} className={iconBtn}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      {rowErrors("addOns", "Add-on")}
      </Section>

      <Section title="Publish" hint="Final settings before this package goes live.">
        <div className="flex gap-8">
          {!archived && <Toggle label="Published" on={f.published} onChange={(v) => set("published", v)} />}
          <Toggle label="Featured" on={f.featured} onChange={(v) => set("featured", v)} />
        </div>
        {f.published && <p className={sub}>Publishing needs a full description, a price, at least one itinerary day and one departure date.</p>}
      {E("publish")}
      </Section>

      {error && <p role="alert" className="m-5 border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</p>}
      <div className="flex items-center justify-end gap-3 p-5">
        <Link href="/dashboard/packages" className={btnGhost}>Cancel</Link>
        <button type="submit" disabled={busy} className="bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:opacity-50">
          {busy ? "Saving…" : f.published ? (wasPublished ? "Save changes" : "Publish Package") : editing ? "Save changes" : "Save as draft"}
        </button>
      </div>
    </form>
  );
}

export default function PackageBuilderForm({ packageId }: { packageId?: string }) {
  const { data: pkg, isLoading, isError, refetch } = usePackageDetail(packageId ?? "");
  const [rev, setRev] = useState(0);
  if (!packageId) return <Builder initial={EMPTY} original={null} onSaved={() => undefined} />;
  if (isLoading) return <div className="h-64 animate-pulse border border-neutral-200 bg-white" />;
  if (isError || !pkg) return <p className="border border-neutral-200 bg-white p-6 text-sm text-neutral-700">This package doesn&apos;t exist (or belongs to another agency). <Link className="font-semibold text-primary-700 hover:underline" href="/dashboard/packages">Back to packages</Link></p>;
  return <Builder key={`${pkg.id}:${rev}`} initial={toForm(pkg)} original={pkg} onSaved={() => { void refetch().then(() => setRev((r) => r + 1)); }} />;
}
