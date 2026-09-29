"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Trash2, X } from "lucide-react";

import { uploadFile, validateUpload } from "@/lib/api/upload";
import { LANGUAGE_SUGGESTIONS, languageLabel } from "@/lib/languages";
import { createGuide, updateGuide, type Certification, type GuideDetail, type GuideInput } from "@/lib/api/agency/guides";
import type { GuideStatus } from "@/lib/api/agency/dashboard";
import type { ApiError } from "@/lib/api/client";

const input = "mt-1 w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const label = "block text-xs font-semibold text-neutral-700";
const stripCls = "flex flex-wrap items-end justify-between gap-3 bg-neutral-50 px-5 py-3";
const h2Cls = "text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-600";
const subCls = "text-xs text-neutral-500";
const Req = () => <span className="ml-0.5 text-danger-600" aria-hidden="true">*</span>;

type Cert = Omit<Certification, "id">;
const blankCert = (): Cert => ({ name: "", issuingBody: null, number: "", expiry: "", document: null });
type Errors = Record<string, string>;

/** Drag & drop (or choose) one photo: a big preview area, the file name, and the button — as in the design. */
function PhotoDrop({ value, onChange, error }: { value: string | null; onChange: (url: string | null) => void; error?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function take(file: File | undefined) {
    if (!file) return;
    const bad = validateUpload(file);
    if (bad) return setProblem(bad);
    setProblem(null);
    setBusy(true);
    try {
      onChange(await uploadFile(file));
      setFileName(file.name);
    } catch (e) {
      setProblem((e as ApiError).message || "Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className={label}>Upload photo</span>
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); void take(e.dataTransfer.files?.[0]); }}
        className={`mt-1 border-2 border-dashed p-5 ${over ? "border-primary-400 bg-primary-50" : "border-neutral-300"}`}
      >
        <div className="flex h-36 items-center justify-center overflow-hidden border border-neutral-200 bg-neutral-100 sm:h-40">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Guide photo preview" className="h-full w-full object-cover" />
          ) : (
            <p className="px-4 text-center text-xs text-neutral-500">{busy ? "Uploading…" : "Drag & drop an image here"}</p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="bg-primary-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-800 disabled:opacity-50">Choose file</button>
          <span className="text-xs text-neutral-500">{value ? (fileName ?? "Photo added") : "No file chosen"}</span>
          {value && <button type="button" onClick={() => { onChange(null); setFileName(null); }} aria-label="Remove photo" className="inline-flex items-center gap-1 text-xs font-semibold text-danger-600 hover:underline"><X className="h-3 w-3" /> Remove</button>}
        </div>
        <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif" aria-label="Choose guide photo" className="sr-only" onChange={(e) => { void take(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      <p className="mt-2 text-xs text-neutral-500">Drag and drop a photo or choose one from your device. If you skip this, a default avatar will be used.</p>
      {(problem || error) && <p role="alert" className="mt-1 text-xs text-danger-600">{problem ?? error}</p>}
    </div>
  );
}

/** Pick languages from a tidy list (or type your own and press Enter); chips show what's chosen. */
function LanguageTags({ value, onChange, error }: { value: string[]; onChange: (v: string[]) => void; error?: string }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  // Close when you click anywhere outside the field + list.
  useEffect(() => {
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  const has = (name: string) => value.some((v) => languageLabel(v).toLowerCase() === name.toLowerCase() || v.toLowerCase() === name.toLowerCase());
  const q = text.trim().toLowerCase();
  const options = LANGUAGE_SUGGESTIONS.filter((l) => !has(l) && (!q || l.toLowerCase().includes(q)));
  // "Add “…”" only when nothing in the list matches what was typed
  const custom = text.trim() && options.length === 0 && !has(text.trim()) ? text.trim() : null;
  const rows = [...options, ...(custom ? [`Add “${custom}”`] : [])];

  function add(name: string) {
    const t = name.trim().replace(/,$/, "").trim();
    setText("");
    setActive(0);
    if (t && !has(t)) onChange([...value, t]);
  }
  const choose = (i: number) => add(i < options.length ? options[i] : custom ?? "");

  return (
    <div
      ref={box}
      className="relative"
      onBlur={(e) => { if (!box.current?.contains(e.relatedTarget as Node)) setOpen(false); }}
    >
      <label className={label} htmlFor="g-lang">Languages</label>
      <div
        onClick={() => { document.getElementById("g-lang")?.focus(); setOpen(true); }}
        className={`mt-1 flex min-h-[2.75rem] cursor-text flex-wrap items-center gap-2 border bg-white px-3 py-1.5 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 ${error ? "border-danger-500" : "border-neutral-200"}`}
      >
        {value.map((l) => (
          <span key={l} className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-900">
            {languageLabel(l)}
            <button type="button" aria-label={`Remove ${languageLabel(l)}`} onClick={(e) => { e.stopPropagation(); onChange(value.filter((x) => x !== l)); }} className="text-primary-700 hover:text-danger-600"><X className="h-3 w-3" /></button>
          </span>
        ))}
        <input
          id="g-lang"
          role="combobox"
          aria-expanded={open}
          aria-controls="g-lang-list"
          autoComplete="off"
          value={text}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setText(e.target.value.replace(/,/g, "")); setActive(0); setOpen(true); if (e.target.value.endsWith(",")) add(e.target.value); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, Math.max(rows.length - 1, 0))); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
            else if (e.key === "Enter") { e.preventDefault(); if (rows.length) choose(Math.min(active, rows.length - 1)); }
            else if (e.key === "Escape") setOpen(false);
            else if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
          }}
          placeholder={value.length ? "Add another…" : "Type a language and press Enter"}
          className="min-w-[9rem] flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-neutral-400"
        />
      </div>
      {open && rows.length > 0 && (
        <ul id="g-lang-list" role="listbox" className="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto border border-neutral-200 bg-white py-1 shadow-lg">
          {!q && <li className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400" aria-hidden>Suggestions</li>}
          {rows.map((r, i) => (
            <li key={r} role="option" aria-selected={i === active}>
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${i === active ? "bg-primary-50 text-primary-900" : "text-neutral-800"} ${i >= options.length ? "font-semibold text-primary-700" : ""}`}
              >
                <span>{r}</span>
                {i < options.length && <Plus className="h-3.5 w-3.5 text-neutral-400" />}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-1 text-xs text-neutral-500">Pick from the list or type any language and press Enter.</p>
      {error && <p role="alert" className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  );
}

/** "Supporting document": the button + file name, uploads a PDF or an image. */
function DocumentPick({ value, onChange, error }: { value: string | null; onChange: (url: string | null) => void; error?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  async function take(file: File | undefined) {
    if (!file) return;
    const bad = validateUpload(file, { pdf: true });
    if (bad) return setProblem(bad);
    setProblem(null);
    setBusy(true);
    try {
      onChange(await uploadFile(file));
      setName(file.name);
    } catch (e) {
      setProblem((e as ApiError).message || "Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <span className={label}>Supporting document</span>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-primary-900 hover:bg-neutral-50 disabled:opacity-50">{busy ? "Uploading…" : "Choose File"}</button>
        <span className="text-sm text-neutral-600">{value ? (name ?? "Document added") : "No file chosen"}</span>
        {value && <a href={value} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary-700 hover:underline">View</a>}
        {value && <button type="button" onClick={() => { onChange(null); setName(null); }} className="text-xs font-semibold text-danger-600 hover:underline">Remove</button>}
      </div>
      <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,application/pdf,image/*" aria-label="Choose supporting document" className="sr-only" onChange={(e) => { void take(e.target.files?.[0]); e.target.value = ""; }} />
      {(problem || error) && <p role="alert" className="mt-1 text-xs text-danger-600">{problem ?? error}</p>}
    </div>
  );
}

export default function GuideForm({ guide }: { guide?: GuideDetail }) {
  const router = useRouter();
  const qc = useQueryClient();
  const editing = Boolean(guide);
  const [f, setF] = useState({
    name: guide?.name ?? "",
    phone: guide?.phone ?? "",
    email: guide?.email ?? "",
    sex: guide?.sex ?? "",
    bio: guide?.bio ?? "",
    status: (guide?.status ?? "available") as GuideStatus,
    languages: guide?.languages ?? ([] as string[]),
    photo: guide?.photo ?? null,
  });
  const [certs, setCerts] = useState<Cert[]>((guide?.certifications ?? []).map((cert) => ({
    name: cert.name,
    issuingBody: cert.issuingBody,
    number: cert.number,
    expiry: cert.expiry,
    document: cert.document,
  })));
  const [errors, setErrors] = useState<Errors>({});
  const [summary, setSummary] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async (body: GuideInput) => (guide ? updateGuide(guide.id, body) : createGuide(body)),
    onSuccess: (g) => {
      toast.success(guide ? `“${g.name}” was saved` : `“${g.name}” was added as a guide`);
      void qc.invalidateQueries({ queryKey: ["agency", "guides"] });
      void qc.invalidateQueries({ queryKey: ["agency", "guide"] });
      void qc.invalidateQueries({ queryKey: ["agency", "summary"] });
      router.push(`/dashboard/guides/${g.id}`);
    },
    onError: (e) => {
      const err = e as unknown as ApiError;
      setErrors(err.fields ?? {});
      setSummary(err.message || "Couldn't save the guide.");
      toast.error(err.message || "Couldn't save the guide.");
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    },
  });

  const setCert = (i: number, patch: Partial<Cert>) => setCerts((c) => c.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  function problems(): Errors {
    const e: Errors = {};
    if (!f.name.trim()) e.name = "Full name is required.";
    if (!f.phone.trim()) e.phone = "Phone number is required.";
    else if (!/^[+()\d\s-]{6,25}$/.test(f.phone.trim())) e.phone = "Enter a valid phone number.";
    if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Enter a valid email address.";
    if (f.bio.length > 1000) e.bio = "Bio must be at most 1000 characters.";
    certs.forEach((c, i) => {
      if (!(c.name || c.number || c.expiry || c.issuingBody || c.document)) return;
      if (!c.name.trim()) e[`certifications.${i}.name`] = "Enter the certification name.";
      if (!c.number.trim()) e[`certifications.${i}.number`] = "Enter the certificate number.";
      if (!c.expiry) e[`certifications.${i}.expiry`] = "Pick the expiry date.";
    });
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
    save.mutate({
      name: f.name.trim(),
      phone: f.phone.trim(),
      email: f.email.trim() || null,
      ...(editing ? { sex: f.sex || null, status: f.status } : {}),
      bio: f.bio.trim() || null,
      languages: f.languages,
      photo: f.photo,
      certifications: certs.filter((c) => c.name || c.number || c.expiry || c.issuingBody || c.document).map((c) => ({ ...c, name: c.name.trim(), number: c.number.trim() })),
    });
  }

  const E = (k: string) => (errors[k] ? <p role="alert" className="mt-1 text-xs text-danger-600">{errors[k]}</p> : null);
  const bad = (k: string) => (errors[k] ? " border-danger-500" : "");

  return (
    <form onSubmit={submit} noValidate className="border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 p-5">
        <h2 className="text-lg font-bold text-neutral-900">{editing ? "Edit guide" : "Add new guide"}</h2>
        <p className={subCls}>{editing ? "Changes are saved when you press the button at the bottom." : "All guide settings."} Fields marked <span className="text-danger-600">*</span> are required.</p>
      </div>

      <section className="border-b border-neutral-200">
        <div className={stripCls}>
          <div>
            <h3 className={h2Cls}>Guide details</h3>
            <p className={subCls}>Who this guide is and how to reach them.</p>
          </div>
        </div>
        <div className="p-5">
          <div className="grid gap-x-4 gap-y-4 md:grid-cols-2">
            <div>
              <label className={label} htmlFor="g-name">Full name<Req /></label>
              <input id="g-name" aria-invalid={Boolean(errors.name)} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Suresh Gurung" className={`${input}${bad("name")}`} />
              {E("name")}
            </div>
            <div>
              <label className={label} htmlFor="g-phone">Phone<Req /></label>
              <input id="g-phone" type="tel" aria-invalid={Boolean(errors.phone)} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+977 98…" className={`${input}${bad("phone")}`} />
              {E("phone")}
            </div>

            <div className="space-y-4">
              <div>
                <label className={label} htmlFor="g-email">Email address</label>
                <input id="g-email" type="email" aria-invalid={Boolean(errors.email)} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="guide@example.com" className={`${input}${bad("email")}`} />
                {E("email")}
              </div>
              <LanguageTags value={f.languages} onChange={(languages) => setF({ ...f, languages })} error={errors.languages} />
              {editing && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={label} htmlFor="g-sex">Sex</label>
                    <select id="g-sex" value={f.sex} onChange={(e) => setF({ ...f, sex: e.target.value })} className={input}><option value="">Not specified</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select>
                  </div>
                  <div>
                    <label className={label} htmlFor="g-status">Availability</label>
                    <select id="g-status" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as GuideStatus })} className={input}><option value="available">Available</option><option value="on_trek">On trek</option><option value="unavailable">Unavailable</option></select>
                    <p className="mt-1 text-xs text-neutral-500">A guide on a trek can only join that same trek. Set to Available to free them for another trek.</p>
                  </div>
                </div>
              )}
            </div>
            <PhotoDrop value={f.photo} onChange={(photo) => setF({ ...f, photo })} error={errors.photo} />
          </div>

          <div className="mt-4">
            <label className={label} htmlFor="g-bio">Short bio</label>
            <textarea id="g-bio" rows={4} maxLength={1000} aria-invalid={Boolean(errors.bio)} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} placeholder="Experience, specialties, and local knowledge…" className={`${input}${bad("bio")}`} />
            {E("bio")}
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200">
        <div className={stripCls}>
          <div>
            <h3 className={h2Cls}>Certifications</h3>
            <p className={subCls}>Keep license and safety certification details up to date.</p>
          </div>
          <button type="button" onClick={() => setCerts((c) => [...c, blankCert()])} className="inline-flex items-center gap-1.5 bg-primary-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-800"><Plus className="h-4 w-4" /> Add certification</button>
        </div>
        <div className="space-y-3 p-5">
          {certs.length === 0 && <p className="border border-dashed border-neutral-200 p-4 text-center text-xs text-neutral-500">No certifications yet (e.g. trekking guide licence, first aid).</p>}
          {certs.map((c, i) => (
            <div key={i} className="border border-neutral-200 bg-neutral-50/60 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-neutral-900">Certification {i + 1}</h4>
                <button type="button" aria-label={`Remove certification ${i + 1}`} onClick={() => setCerts((all) => all.filter((_, idx) => idx !== i))} className="p-2 text-danger-600 hover:bg-danger-50"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mt-2 grid gap-x-4 gap-y-3 md:grid-cols-2">
                <div>
                  <label className={label} htmlFor={`c-name-${i}`}>Certification name</label>
                  <input id={`c-name-${i}`} aria-invalid={Boolean(errors[`certifications.${i}.name`])} value={c.name} onChange={(e) => setCert(i, { name: e.target.value })} placeholder="e.g. Wilderness First Aid" className={`${input}${bad(`certifications.${i}.name`)}`} />
                  {E(`certifications.${i}.name`)}
                </div>
                <div>
                  <label className={label} htmlFor={`c-body-${i}`}>Issuing body</label>
                  <input id={`c-body-${i}`} value={c.issuingBody ?? ""} onChange={(e) => setCert(i, { issuingBody: e.target.value || null })} placeholder="Organization name" className={input} />
                </div>
                <div>
                  <label className={label} htmlFor={`c-num-${i}`}>Certificate number</label>
                  <input id={`c-num-${i}`} aria-invalid={Boolean(errors[`certifications.${i}.number`])} value={c.number} onChange={(e) => setCert(i, { number: e.target.value })} placeholder="Certificate ID" className={`${input}${bad(`certifications.${i}.number`)}`} />
                  {E(`certifications.${i}.number`)}
                </div>
                <div>
                  <label className={label} htmlFor={`c-exp-${i}`}>Expiry date</label>
                  <input id={`c-exp-${i}`} type="date" aria-invalid={Boolean(errors[`certifications.${i}.expiry`])} value={c.expiry} onChange={(e) => setCert(i, { expiry: e.target.value })} className={`${input}${bad(`certifications.${i}.expiry`)}`} />
                  {E(`certifications.${i}.expiry`)}
                </div>
                <div className="md:col-span-2"><DocumentPick value={c.document} onChange={(url) => setCert(i, { document: url })} error={errors[`certifications.${i}.document`]} /></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {summary && <p role="alert" className="m-5 border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{summary}</p>}
      <div className="flex items-center justify-end gap-3 p-5">
        <Link href={guide ? `/dashboard/guides/${guide.id}` : "/dashboard/guides"} className="border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Cancel</Link>
        <button type="submit" disabled={save.isPending} className="bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:opacity-50">{save.isPending ? "Saving…" : editing ? "Save changes" : "Create guide"}</button>
      </div>
    </form>
  );
}
