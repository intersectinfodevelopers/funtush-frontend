"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Palette } from "lucide-react";

import { createCategory, updateCategory, type BlogCategory } from "@/lib/api/agency/blog";
import type { ApiError } from "@/lib/api/client";

const input = "mt-1.5 w-full border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100";
const label = "block text-sm font-semibold text-neutral-800";
const Req = () => <span className="ml-0.5 text-danger-600" aria-hidden="true">*</span>;
const HEX = /^#[0-9a-fA-F]{6}$/;
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export default function CategoryForm({ category }: { category?: BlogCategory }) {
  const router = useRouter();
  const qc = useQueryClient();
  const editing = Boolean(category);
  const [f, setF] = useState({ name: category?.name ?? "", slug: category?.slug ?? "", description: category?.description ?? "", color: category?.color ?? "#358CBD", displayOrder: String(category?.displayOrder ?? 0), isActive: category?.isActive ?? true });
  const [slugTouched, setSlugTouched] = useState(editing);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => {
      const body = { name: f.name.trim(), slug: f.slug.trim(), description: f.description.trim(), color: f.color, displayOrder: Number(f.displayOrder || 0), isActive: f.isActive };
      return category ? updateCategory(category.id, body) : createCategory(body);
    },
    onSuccess: (r) => {
      toast.success(editing ? `“${r.data.name}” was saved` : `“${r.data.name}” was created`);
      void qc.invalidateQueries({ queryKey: ["agency", "categories"] });
      void qc.invalidateQueries({ queryKey: ["agency", "category"] });
      router.push("/dashboard/categories");
    },
    onError: (e) => {
      const err = e as unknown as ApiError;
      setErrors(err.fields ?? {});
      setSummary(err.message || "Couldn't save the category.");
      toast.error(err.message || "Couldn't save the category.", { duration: 6000 });
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    },
  });

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = "Category name is required.";
    if (!f.slug.trim()) e.slug = "Slug is required.";
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(f.slug.trim())) e.slug = "Use lowercase letters, numbers and single hyphens (e.g. travel-tips).";
    if (!HEX.test(f.color)) e.color = "Colour must be a hex value like #358CBD.";
    const n = Number(f.displayOrder || 0);
    if (!Number.isInteger(n) || n < 0 || n > 9999) e.displayOrder = "Display order must be a whole number from 0 to 9999.";
    setErrors(e);
    if (Object.keys(e).length) {
      setSummary(`Please fix ${Object.keys(e).length === 1 ? "the highlighted field" : "the highlighted fields"} and try again.`);
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setSummary(null);
    save.mutate();
  }

  const E = (k: string) => (errors[k] ? <p role="alert" className="mt-1 text-xs text-danger-600">{errors[k]}</p> : null);
  const bad = (k: string) => (errors[k] ? " border-danger-500" : "");

  return (
    <form onSubmit={submit} noValidate className="border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold text-neutral-900">{editing ? "Edit category" : "Add new category"}</h2>
      <div className="mt-5 border-t border-neutral-200 pt-6">
        <h3 className="text-base font-bold text-neutral-900">Category details</h3>
        <p className="text-sm text-neutral-500">Create a content group and define how it should appear across the site.</p>

        <div className="mt-5 grid gap-x-6 gap-y-5 md:grid-cols-2">
          <div>
            <label className={label} htmlFor="c-name">Category name<Req /></label>
            <input id="c-name" aria-invalid={Boolean(errors.name)} value={f.name} maxLength={60} placeholder="e.g. Travel Tips" onChange={(e) => setF((c) => ({ ...c, name: e.target.value, slug: slugTouched ? c.slug : slugify(e.target.value) }))} className={`${input}${bad("name")}`} />
            {E("name")}
          </div>
          <div>
            <label className={label} htmlFor="c-order">Display order</label>
            <input id="c-order" type="number" min={0} aria-invalid={Boolean(errors.displayOrder)} value={f.displayOrder} onChange={(e) => setF((c) => ({ ...c, displayOrder: e.target.value }))} className={`${input}${bad("displayOrder")}`} />
            {E("displayOrder")}
          </div>
          <div>
            <label className={label} htmlFor="c-slug">Slug<Req /></label>
            <input id="c-slug" aria-invalid={Boolean(errors.slug)} value={f.slug} maxLength={80} placeholder="travel-tips" onChange={(e) => { setSlugTouched(true); setF((c) => ({ ...c, slug: e.target.value })); }} className={`${input}${bad("slug")}`} />
            {E("slug")}
          </div>
          <div>
            <label className={label} htmlFor="c-color">Color</label>
            <div className={`mt-1.5 flex items-center gap-3 border border-neutral-200 bg-white px-3 py-2.5${bad("color")}`}>
              <input id="c-color" type="color" aria-label="Pick a colour" value={HEX.test(f.color) ? f.color : "#358CBD"} onChange={(e) => setF((c) => ({ ...c, color: e.target.value.toUpperCase() }))} className="h-9 w-14 cursor-pointer rounded border-0 bg-transparent p-0" />
              <input aria-label="Colour hex value" aria-invalid={Boolean(errors.color)} value={f.color} maxLength={7} onChange={(e) => setF((c) => ({ ...c, color: e.target.value.toUpperCase() }))} className="w-full bg-transparent text-sm text-neutral-800 outline-none" />
            </div>
            {E("color")}
          </div>
          <div className="md:col-span-2">
            <label className={label} htmlFor="c-desc">Description</label>
            <textarea id="c-desc" rows={4} maxLength={500} aria-invalid={Boolean(errors.description)} value={f.description} placeholder="Short description about the category..." onChange={(e) => setF((c) => ({ ...c, description: e.target.value }))} className={`${input}${bad("description")}`} />
            {E("description")}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border border-neutral-200 bg-neutral-50 px-4 py-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800"><Palette className="h-4 w-4 text-neutral-500" /> Active</span>
          <button type="button" role="switch" aria-checked={f.isActive} aria-label="Active" onClick={() => setF((c) => ({ ...c, isActive: !c.isActive }))} className={`flex h-7 w-12 items-center rounded-full p-0.5 transition ${f.isActive ? "bg-primary-900" : "bg-neutral-300"}`}><span className={`h-6 w-6 rounded-full bg-white shadow transition ${f.isActive ? "translate-x-5" : ""}`} /></button>
        </div>
        {!f.isActive && <p className="mt-2 text-xs text-neutral-500">Inactive categories can&apos;t be chosen for new posts.</p>}

        {summary && <p role="alert" className="mt-5 border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{summary}</p>}

        <div className="mt-6 flex justify-end gap-3 border-t border-neutral-200 pt-5">
          <Link href="/dashboard/categories" className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50">Cancel</Link>
          <button type="submit" disabled={save.isPending} className="rounded-full bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{save.isPending ? "Saving…" : editing ? "Save changes" : "Create category"}</button>
        </div>
      </div>
    </form>
  );
}
