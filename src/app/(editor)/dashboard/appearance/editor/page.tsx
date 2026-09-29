"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowLeft, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";

import FileUploadField from "@/components/ui/FileUploadField";
import { siteKeys, useSitePage, useSitePageOptions } from "@/hooks/useAgencySite";
import { saveSitePage, type PageSection, type SitePage, type SitePageOptions, type SitePagePatch } from "@/lib/api/agency/site";
import type { ApiError } from "@/lib/api/client";

const input = "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50";
const LIST_TYPES = ["CATEGORIES", "PACKAGES", "DESTINATIONS", "BLOGS", "GALLERY", "VIDEOS", "REVIEWS"];
const AD_SLOTS = ["homepage-top", "sidebar-1", "footer-1"];
const HEX = /^#[0-9a-fA-F]{6}$/;
const isLink = (s: string) => /^\/(?![/\\])\S*$/.test(s) || /^https?:\/\/\S+$/i.test(s);

const blankSection = (type: string): PageSection => ({
  type, title: null, text: null, subtitle: null, image: null, link: null, ctaText: null, ctaText2: null, ctaLink2: null, heroHeight: null,
  overlayEnabled: false, fontSize: null, speed: null, direction: null, useThemeBg: true, bgColor: null, useThemeText: true, textColor: null,
  spacingTop: null, spacingBottom: null, itemCount: null, selectedIds: [], cardWidth: null, cardHeight: null, adPosition: null, widthPercent: 100,
});

/** The GET adds server-only keys (id, position, siteId, timestamps) the strict PATCH schema rejects. */
const SECTION_KEYS = Object.keys(blankSection("HERO")) as (keyof PageSection)[];
function toInput(s: PageSection): SitePagePatch["sections"] extends (infer U)[] | undefined ? U : never {
  const out: Record<string, unknown> = {};
  for (const k of SECTION_KEYS) out[k] = s[k];
  return out as never;
}

function move<T>(list: T[], i: number, by: -1 | 1): T[] {
  const j = i + by;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function Txt({ label, value, onChange, max, area }: { label: string; value: string | null; onChange: (v: string | null) => void; max?: number; area?: boolean }) {
  const set = (v: string) => onChange(v === "" ? null : v);
  return (
    <label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">{label}</span>
      {area ? <textarea aria-label={label} rows={3} className={input} maxLength={max} value={value ?? ""} onChange={(e) => set(e.target.value)} /> : <input aria-label={label} className={input} maxLength={max} value={value ?? ""} onChange={(e) => set(e.target.value)} />}
    </label>
  );
}
function Num({ label, value, onChange, min, max }: { label: string; value: number | null; onChange: (v: number | null) => void; min?: number; max?: number }) {
  return (
    <label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">{label}</span>
      <input aria-label={label} type="number" min={min} max={max} className={input} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Math.round(Number(e.target.value)))} /></label>
  );
}

function SectionEditor({ s, opts, onChange }: { s: PageSection; opts: SitePageOptions; onChange: (n: PageSection) => void }) {
  const set = <K extends keyof PageSection>(k: K) => (v: PageSection[K]) => onChange({ ...s, [k]: v });
  const T = s.type;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {T === "TOPBAR" && (<><div className="sm:col-span-2"><Txt label="Text" value={s.text} onChange={set("text")} max={200} /></div><Num label="Speed" value={s.speed} onChange={set("speed")} /><label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">Direction</span><select aria-label="Direction" className={input} value={s.direction ?? "LTR"} onChange={(e) => set("direction")(e.target.value)}>{opts.directions.map((d) => <option key={d}>{d}</option>)}</select></label></>)}
      {T !== "TOPBAR" && (<><Txt label="Title" value={s.title} onChange={set("title")} max={120} /><Txt label="Subtitle" value={s.subtitle} onChange={set("subtitle")} max={200} /></>)}
      {T === "TEXTBLOCK" && (<><div className="sm:col-span-2"><Txt label="Text" value={s.text} onChange={set("text")} max={2000} area /></div><Num label="Font size" value={s.fontSize} onChange={set("fontSize")} /></>)}
      {T === "HERO" && (
        <>
          <div className="sm:col-span-2"><FileUploadField label="Background image" value={s.image} onChange={set("image")} /></div>
          <Txt label="Button label" value={s.ctaText} onChange={set("ctaText")} max={40} /><Txt label="Button link" value={s.link} onChange={set("link")} />
          <Txt label="Second button label" value={s.ctaText2} onChange={set("ctaText2")} max={40} /><Txt label="Second button link" value={s.ctaLink2} onChange={set("ctaLink2")} />
          <label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">Height</span><select aria-label="Height" className={input} value={s.heroHeight ?? "LARGE"} onChange={(e) => set("heroHeight")(e.target.value)}>{opts.heroHeights.map((h) => <option key={h}>{h}</option>)}</select></label>
          <label className="flex items-center gap-2 self-end text-sm"><input type="checkbox" checked={s.overlayEnabled} onChange={(e) => set("overlayEnabled")(e.target.checked)} /> Dark overlay on the image</label>
        </>
      )}
      {LIST_TYPES.includes(T) && <Num label="How many to show" value={s.itemCount} onChange={set("itemCount")} min={1} />}
      {T === "ADS" && (<label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">Ad slot</span><select aria-label="Ad slot" className={input} value={s.adPosition ?? ""} onChange={(e) => set("adPosition")(e.target.value || null)}><option value="">Choose…</option>{AD_SLOTS.map((a) => <option key={a}>{a}</option>)}</select></label>)}
      <label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">Width</span><select aria-label="Width" className={input} value={s.widthPercent} onChange={(e) => set("widthPercent")(Number(e.target.value))}>{opts.widthPercentOptions.map((w) => <option key={w} value={w}>{w}%</option>)}</select></label>
      <Num label="Space above" value={s.spacingTop} onChange={set("spacingTop")} min={0} /><Num label="Space below" value={s.spacingBottom} onChange={set("spacingBottom")} min={0} />
      <div className="flex items-end gap-3 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.useThemeBg} onChange={(e) => onChange({ ...s, useThemeBg: e.target.checked, bgColor: e.target.checked ? null : s.bgColor ?? "#FFFFFF" })} /> Use theme background</label>
        {!s.useThemeBg && <input aria-label="Background colour" className={`${input} !w-32`} value={s.bgColor ?? ""} onChange={(e) => set("bgColor")(e.target.value || null)} placeholder="#FFFFFF" />}
      </div>
    </div>
  );
}

function check(page: { headerCtaLink: string | null; sections: PageSection[] }, opts: SitePageOptions): string | null {
  if (page.headerCtaLink && !isLink(page.headerCtaLink)) return "The header button link must start with / or https://.";
  for (const [i, s] of page.sections.entries()) {
    const n = `Section ${i + 1} (${opts.sectionTypes.find((t) => t.value === s.type)?.label ?? s.type})`;
    for (const v of [s.title, s.subtitle, s.text, s.ctaText, s.ctaText2]) if (v && /[<>]/.test(v)) return `${n}: text can't contain < or >.`;
    for (const v of [s.link, s.ctaLink2]) if (v && !isLink(v)) return `${n}: links must start with / or https://.`;
    if (!s.useThemeBg && !(s.bgColor && HEX.test(s.bgColor))) return `${n}: the background must be a hex colour like #FFFFFF.`;
  }
  return null;
}

function Editor({ initial, opts }: { initial: SitePage; opts: SitePageOptions }) {
  const qc = useQueryClient();
  const [name, setName] = useState(initial.name);
  const [headerStyle, setHeaderStyle] = useState(initial.header.style);
  const [headerCtaText, setHeaderCtaText] = useState(initial.header.ctaText);
  const [headerCtaLink, setHeaderCtaLink] = useState(initial.header.ctaLink);
  const [sticky, setSticky] = useState(initial.header.sticky);
  const [footerStyle, setFooterStyle] = useState(initial.footer.style);
  const [sections, setSections] = useState<PageSection[]>(initial.sections);
  const [open, setOpen] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    const problem = check({ headerCtaLink, sections }, opts);
    if (problem) return setMsg({ ok: false, text: problem });
    setSaving(true); setMsg(null);
    try {
      const patch: SitePagePatch = { name, headerStyle, headerCtaText, headerCtaLink, headerSticky: sticky, footerStyle, sections: sections.map(toInput) };
      await saveSitePage(patch);
      await qc.invalidateQueries({ queryKey: [...siteKeys.all, "site-page"] });
      setMsg({ ok: true, text: "Saved" });
    } catch (e) { setMsg({ ok: false, text: (e as ApiError).message || "Couldn't save." }); } finally { setSaving(false); }
  }
  const label = (t: string) => opts.sectionTypes.find((x) => x.value === t)?.label ?? t;

  return (
    <div className="mx-auto min-h-screen max-w-4xl space-y-5 px-4 py-6">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-white/95 px-1 py-3 backdrop-blur">
        <div className="flex items-center gap-3"><Link href="/dashboard/appearance?tab=templates" className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-600 hover:text-neutral-900"><ArrowLeft className="h-4 w-4" /> Back</Link><h1 className="text-lg font-bold text-neutral-900">Page editor</h1></div>
        <div className="flex items-center gap-3">
          {msg && <span role={msg.ok ? "status" : "alert"} className={`text-sm font-medium ${msg.ok ? "text-success-700" : "text-danger-600"}`}>{msg.text}</span>}
          <button type="button" onClick={() => void save()} disabled={saving} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{saving ? "Saving…" : "Save page"}</button>
        </div>
      </header>

      <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm" aria-label="Header and footer">
        <h2 className="font-bold text-neutral-900">Header &amp; footer</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Txt label="Site name" value={name} onChange={setName} max={60} />
          <label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">Header style</span><select aria-label="Header style" className={input} value={headerStyle} onChange={(e) => setHeaderStyle(e.target.value)}>{opts.headerStyles.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}</select></label>
          <Txt label="Header button label" value={headerCtaText} onChange={setHeaderCtaText} max={40} /><Txt label="Header button link" value={headerCtaLink} onChange={setHeaderCtaLink} />
          <label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">Footer style</span><select aria-label="Footer style" className={input} value={footerStyle} onChange={(e) => setFooterStyle(e.target.value)}>{opts.footerStyles.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}</select></label>
          <label className="flex items-center gap-2 self-end text-sm"><input type="checkbox" checked={sticky} onChange={(e) => setSticky(e.target.checked)} /> Keep the header fixed while scrolling</label>
        </div>
      </section>

      <section className="space-y-3" aria-label="Sections">
        <div className="flex items-center justify-between"><h2 className="font-bold text-neutral-900">Sections <span className="text-sm font-normal text-neutral-500">({sections.length}/{opts.limits.maxSections})</span></h2>
          {sections.length < opts.limits.maxSections && <button type="button" onClick={() => setAdding((a) => !a)} className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-semibold hover:bg-neutral-50"><Plus className="h-4 w-4" /> Add section</button>}</div>
        {adding && (
          <div className="grid gap-2 rounded-2xl border border-neutral-200 bg-white p-4 sm:grid-cols-2" role="menu" aria-label="Section types">
            {opts.sectionTypes.map((t) => <button key={t.value} type="button" role="menuitem" onClick={() => { setSections([...sections, blankSection(t.value)]); setOpen(sections.length); setAdding(false); }} className="rounded-xl border border-neutral-200 p-3 text-left hover:bg-neutral-50"><div className="text-sm font-semibold">{t.label}</div><div className="text-xs text-neutral-500">{t.description}</div></button>)}
          </div>
        )}
        {sections.length === 0 && <p className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">No sections yet — add one to start building your home page.</p>}
        {sections.map((s, i) => (
          <article key={s.id ?? `new-${i}`} aria-label={`Section ${i + 1}`} className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 p-3">
              <button type="button" aria-expanded={open === i} aria-label={`Toggle section ${i + 1}`} onClick={() => setOpen(open === i ? null : i)} className="flex flex-1 items-center gap-2 text-left"><ChevronDown className={`h-4 w-4 transition ${open === i ? "rotate-180" : ""}`} /><span className="text-sm font-semibold text-neutral-900">{i + 1}. {label(s.type)}</span><span className="truncate text-xs text-neutral-500">{s.title ?? s.text ?? ""}</span></button>
              <button type="button" aria-label={`Move section ${i + 1} up`} onClick={() => setSections(move(sections, i, -1))} className="rounded-md p-1.5 hover:bg-neutral-100"><ArrowUp className="h-4 w-4" /></button>
              <button type="button" aria-label={`Move section ${i + 1} down`} onClick={() => setSections(move(sections, i, 1))} className="rounded-md p-1.5 hover:bg-neutral-100"><ArrowDown className="h-4 w-4" /></button>
              <button type="button" aria-label={`Remove section ${i + 1}`} onClick={() => { setSections(sections.filter((_, k) => k !== i)); setOpen(null); }} className="rounded-md p-1.5 text-danger-600 hover:bg-danger-50"><Trash2 className="h-4 w-4" /></button>
            </div>
            {open === i && <div className="border-t border-neutral-100 p-4"><SectionEditor s={s} opts={opts} onChange={(n) => setSections(sections.map((x, k) => (k === i ? n : x)))} /></div>}
          </article>
        ))}
      </section>
    </div>
  );
}

export default function EditorPage() {
  const page = useSitePage();
  const options = useSitePageOptions();
  if (page.isLoading || options.isLoading) return <div className="mx-auto mt-10 h-64 max-w-4xl animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (page.isError || options.isError || !page.data || !options.data) return <p role="alert" className="p-8 text-sm text-danger-600">Couldn&apos;t load your page. <Link href="/dashboard/appearance" className="font-semibold underline">Back to Appearance</Link></p>;
  return <Editor initial={page.data} opts={options.data} />;
}
