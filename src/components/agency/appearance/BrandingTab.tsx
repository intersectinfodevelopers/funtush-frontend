"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Field, SaveBar, TextInput } from "@/components/agency/settings/settings-kit";
import { useApiForm } from "@/hooks/useApiForm";
import { siteKeys, useBranding, useBrandingOptions } from "@/hooks/useAgencySite";
import { saveBranding, type Branding, type BrandingOptions, type BrandingPatch } from "@/lib/api/agency/site";

const selectClass = "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50";
const HEX = /^#[0-9a-fA-F]{6}$/;

/** Decodes the picked image and checks it against the exact size the API enforces. */
function checkImage(file: File, spec: { width: number; height: number; maxBytes: number }, label: string): Promise<string | null> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return Promise.resolve(`${label} must be a PNG, JPG or WebP image.`);
  if (file.size > spec.maxBytes) return Promise.resolve(`${label} must be under ${Math.round(spec.maxBytes / 1024)} KB.`);
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img.width === spec.width && img.height === spec.height ? null : `${label} must be exactly ${spec.width} × ${spec.height} px (yours is ${img.width} × ${img.height}).`); };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(`That file isn't a readable image.`); };
    img.src = url;
  });
}

function ImagePicker({ id, label, current, spec, file, onPick }: { id: string; label: string; current: string | null; spec: { width: number; height: number; maxBytes: number }; file: File | undefined; onPick: (f: File | undefined) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  const shown = file ? preview : current;
  return (
    <Field label={label} htmlFor={id} hint={`Exactly ${spec.width} × ${spec.height} px, PNG/JPG/WebP, under ${Math.round(spec.maxBytes / 1024)} KB.`} error={error ?? undefined}>
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {shown ? <img src={shown} alt={`${label} preview`} className="h-14 max-w-[180px] rounded border border-neutral-200 bg-neutral-50 object-contain" /> : <div className="grid h-14 w-24 place-items-center rounded border border-dashed border-neutral-300 text-xs text-neutral-400">None</div>}
        <input id={id} type="file" accept="image/png,image/jpeg,image/webp" className="text-sm"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            const problem = await checkImage(f, spec, label);
            setError(problem);
            if (!problem) onPick(f);
          }} />
      </div>
    </Field>
  );
}

export function BrandingTab() {
  const qc = useQueryClient();
  const branding = useBranding();
  const options = useBrandingOptions();
  const [files, setFiles] = useState<{ logo?: File; favicon?: File }>({});
  const form = useApiForm<Branding>(branding.data, async (changed) => {
    const opts = options.data as BrandingOptions;
    if (changed.brandName !== undefined && (changed.brandName.trim().length < 2 || changed.brandName.length > 60)) return Promise.reject({ message: "Brand name must be 2–60 characters." });
    if (changed.primaryColor !== undefined && !HEX.test(changed.primaryColor)) return Promise.reject({ message: "Colour must be a hex value like #0F766E." });
    if (changed.logoWidth !== undefined && (changed.logoWidth < opts.logoWidth.min || changed.logoWidth > opts.logoWidth.max)) return Promise.reject({ message: `Logo width must be ${opts.logoWidth.min}–${opts.logoWidth.max} px.` });
    const patch: BrandingPatch = {
      brandName: changed.brandName, primaryColor: changed.primaryColor, paletteId: changed.paletteId ?? undefined, fontFamily: changed.fontFamily,
      cardImageRatio: changed.cardImageRatio, currencyCode: changed.currencyCode, currencySymbol: changed.currencySymbol, currencyDisplay: changed.currencyDisplay,
      logoWidth: changed.logoWidth, receiptFooter: changed.receiptFooter,
    };
    const out = await saveBranding(patch, files);
    setFiles({});
    return out;
  }, () => { void qc.invalidateQueries({ queryKey: [...siteKeys.all, "branding"] }); void qc.invalidateQueries({ queryKey: ["agency", "dashboard"] }); });

  if (branding.isLoading || options.isLoading) return <div className="h-64 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (branding.isError || options.isError || !form.value || !options.data) return <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load your branding.</p>;
  const v = form.value;
  const o = options.data;
  const dirty = form.dirty || Boolean(files.logo || files.favicon);
  const currency = (code: string) => { const c = o.currencies.find((x) => x.code === code); if (c) form.patch({ currencyCode: c.code, currencySymbol: c.symbol }); };

  return (
    <div className="space-y-5">
      <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div><h2 className="text-lg font-bold text-neutral-900">Identity</h2><p className="text-sm text-neutral-500">Your name, logo and colours across the site and receipts.</p></div>
        <Field label="Brand name" htmlFor="br-name"><TextInput id="br-name" value={v.brandName} maxLength={60} onChange={(e) => form.patch({ brandName: e.target.value })} /></Field>
        <ImagePicker id="br-logo" label="Logo" current={v.logoUrl} spec={o.imageSpecs.logo} file={files.logo} onPick={(f) => setFiles((c) => ({ ...c, logo: f }))} />
        <ImagePicker id="br-favicon" label="Favicon" current={v.faviconUrl} spec={o.imageSpecs.favicon} file={files.favicon} onPick={(f) => setFiles((c) => ({ ...c, favicon: f }))} />
        <Field label={`Logo width: ${v.logoWidth}px`} htmlFor="br-logow">
          <input id="br-logow" type="range" min={o.logoWidth.min} max={o.logoWidth.max} value={v.logoWidth} onChange={(e) => form.patch({ logoWidth: Number(e.target.value) })} className="w-full" />
        </Field>
      </section>

      <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div><h2 className="text-lg font-bold text-neutral-900">Colour & type</h2></div>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-neutral-700">Primary colour</p>
          <div role="radiogroup" aria-label="Primary colour" className="flex flex-wrap gap-2">
            {o.palette.map((s) => (
              <button key={s.id} type="button" role="radio" aria-checked={v.paletteId === s.id} aria-label={s.label} title={s.label} onClick={() => form.patch({ paletteId: s.id, primaryColor: s.hex })}
                className={`h-9 w-9 rounded-full border-2 ${v.paletteId === s.id ? "border-neutral-900 ring-2 ring-offset-2 ring-neutral-300" : "border-white shadow"}`} style={{ backgroundColor: s.hex }} />
            ))}
          </div>
          {o.colorPickerMode === "free" ? (
            <div className="mt-3 max-w-xs"><Field label="Custom colour" htmlFor="br-hex"><TextInput id="br-hex" value={v.primaryColor} onChange={(e) => form.patch({ primaryColor: e.target.value, paletteId: null })} placeholder="#0F766E" /></Field></div>
          ) : <p className="mt-2 text-xs text-neutral-400">Current: {v.primaryColor}. Custom colours are available on higher plans.</p>}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Font" htmlFor="br-font"><select id="br-font" className={selectClass} value={v.fontFamily} onChange={(e) => form.patch({ fontFamily: e.target.value })}>{o.fonts.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}</select></Field>
          <Field label="Card image ratio" htmlFor="br-ratio"><select id="br-ratio" className={selectClass} value={v.cardImageRatio} onChange={(e) => form.patch({ cardImageRatio: e.target.value })}>{o.cardImageRatios.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select></Field>
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div><h2 className="text-lg font-bold text-neutral-900">Currency & receipts</h2></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Currency" htmlFor="br-cur"><select id="br-cur" className={selectClass} value={v.currencyCode} onChange={(e) => currency(e.target.value)}>{o.currencies.map((c) => <option key={c.code} value={c.code}>{c.label} ({c.code})</option>)}</select></Field>
          <Field label="Show prices as" htmlFor="br-disp"><select id="br-disp" className={selectClass} value={v.currencyDisplay} onChange={(e) => form.patch({ currencyDisplay: e.target.value as Branding["currencyDisplay"] })}><option value="SYMBOL">Symbol ({v.currencySymbol} 1,200)</option><option value="CODE">Code ({v.currencyCode} 1,200)</option><option value="SYMBOL_CODE">Both</option></select></Field>
        </div>
        <Field label="Receipt footer" htmlFor="br-foot" hint={`${v.receiptFooter.length}/${o.receiptFooter.maxLength} characters`}><TextInput id="br-foot" value={v.receiptFooter} maxLength={o.receiptFooter.maxLength} onChange={(e) => form.patch({ receiptFooter: e.target.value })} /></Field>
      </section>
      <SaveBar dirty={dirty} onSave={form.submit} onReset={() => { form.reset(); setFiles({}); }} saving={form.saving} error={form.error} />
    </div>
  );
}
