"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Field, SaveBar, TextInput, ToggleRow } from "@/components/agency/settings/settings-kit";
import { useApiForm } from "@/hooks/useApiForm";
import { siteKeys, useNavigation, useNavigationOptions } from "@/hooks/useAgencySite";
import { saveNavigation, type NavItem, type NavLinkType, type NavigationSettings } from "@/lib/api/agency/site";

const selectClass = "rounded-xl border border-neutral-300 bg-white px-2.5 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50";
const blank = (): NavItem => ({ label: "", linkType: "INTERNAL", url: "/", openInNewTab: false });
const isHttp = (s: string) => { try { const u = new URL(s); return u.protocol === "http:" || u.protocol === "https:"; } catch { return false; } };

function problem(item: NavItem, where: string): string | null {
  if (!item.label.trim()) return `${where}: add a label.`;
  if (/[<>]/.test(item.label)) return `${where}: the label can't contain < or >.`;
  if (item.linkType === "INTERNAL" && !/^\/(?![/\\])/.test(item.url.trim())) return `${where}: a site link must start with / (e.g. /packages).`;
  if (item.linkType === "EXTERNAL" && !isHttp(item.url.trim())) return `${where}: an external link must start with https://.`;
  return null;
}

function move<T>(list: T[], i: number, by: -1 | 1): T[] {
  const j = i + by;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function ItemRow({ item, label, onChange, onRemove, onUp, onDown }: { item: NavItem; label: string; onChange: (n: NavItem) => void; onRemove: () => void; onUp: () => void; onDown: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <TextInput aria-label={`${label} label`} placeholder="Label" value={item.label} onChange={(e) => onChange({ ...item, label: e.target.value })} className="!w-40" maxLength={30} />
      <select aria-label={`${label} type`} className={selectClass} value={item.linkType} onChange={(e) => onChange({ ...item, linkType: e.target.value as NavLinkType, url: e.target.value === "INTERNAL" ? "/" : "https://" })}><option value="INTERNAL">Page on my site</option><option value="EXTERNAL">External link</option></select>
      <TextInput aria-label={`${label} link`} value={item.url} onChange={(e) => onChange({ ...item, url: e.target.value })} className="!w-56" />
      <label className="flex items-center gap-1 text-xs text-neutral-600"><input type="checkbox" checked={item.openInNewTab ?? false} onChange={(e) => onChange({ ...item, openInNewTab: e.target.checked })} /> New tab</label>
      <button type="button" aria-label={`Move ${label} up`} onClick={onUp} className="rounded-md p-1.5 hover:bg-neutral-100"><ArrowUp className="h-4 w-4" /></button>
      <button type="button" aria-label={`Move ${label} down`} onClick={onDown} className="rounded-md p-1.5 hover:bg-neutral-100"><ArrowDown className="h-4 w-4" /></button>
      <button type="button" aria-label={`Remove ${label}`} onClick={onRemove} className="rounded-md p-1.5 text-danger-600 hover:bg-danger-50"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

export function NavigationTab() {
  const qc = useQueryClient();
  const nav = useNavigation();
  const options = useNavigationOptions();
  const form = useApiForm<NavigationSettings>(nav.data, (changed) => {
    if (changed.items) {
      for (const [i, it] of changed.items.entries()) {
        const p = problem(it, `Menu item ${i + 1}`) ?? (it.children ?? []).map((c, j) => problem(c, `Menu item ${i + 1}, sub-item ${j + 1}`)).find(Boolean);
        if (p) return Promise.reject({ message: p });
      }
    }
    if (changed.bookNowLabel !== undefined && changed.bookNowLabel !== null && !changed.bookNowLabel.trim()) return Promise.reject({ message: "Add a Book Now label, or leave it as default." });
    const patch = { items: changed.items?.map((it) => ({ ...it, children: it.children?.length ? it.children : undefined })), bookNowLabel: changed.bookNowLabel, bookNowHidden: changed.bookNowHidden };
    return saveNavigation(patch);
  }, () => void qc.invalidateQueries({ queryKey: [...siteKeys.all, "navigation"] }));

  if (nav.isLoading || options.isLoading) return <div className="h-48 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (nav.isError || options.isError || !form.value || !options.data) return <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load your navigation.</p>;
  const v = form.value;
  const caps = v.capabilities;
  const lim = options.data.limits;
  const items = v.items.length || !caps.customNavigation ? v.items : [];
  const setItems = (next: NavItem[]) => form.patch({ items: next });

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div><h2 className="text-lg font-bold text-neutral-900">Menu</h2><p className="text-sm text-neutral-500">The links in your site&apos;s header, in order.</p></div>
        {!caps.customNavigation && (
          <>
            <p className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800">{options.data.notes.customNavigation}</p>
            <ol aria-label="Current menu" className="list-decimal space-y-1 pl-5 text-sm text-neutral-700">{v.effectiveNavigation.items.map((i) => <li key={i.label}>{i.label} <span className="text-neutral-400">{i.url}</span></li>)}</ol>
          </>
        )}
        {caps.customNavigation && (
          <div className="space-y-4">
            {items.length === 0 && <p className="text-sm text-neutral-500">No custom menu yet — your site uses the standard one. Add an item to start your own.</p>}
            {items.map((item, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-neutral-200 p-3">
                <ItemRow item={item} label={`Item ${i + 1}`} onChange={(n) => setItems(items.map((x, k) => (k === i ? { ...n, children: x.children } : x)))} onRemove={() => setItems(items.filter((_, k) => k !== i))} onUp={() => setItems(move(items, i, -1))} onDown={() => setItems(move(items, i, 1))} />
                <div className="ml-6 space-y-2 border-l border-neutral-200 pl-4">
                  {(item.children ?? []).map((c, j) => (
                    <ItemRow key={j} item={c} label={`Item ${i + 1} sub-item ${j + 1}`} onChange={(n) => setItems(items.map((x, k) => (k === i ? { ...x, children: (x.children ?? []).map((y, m) => (m === j ? n : y)) } : x)))} onRemove={() => setItems(items.map((x, k) => (k === i ? { ...x, children: (x.children ?? []).filter((_, m) => m !== j) } : x)))} onUp={() => setItems(items.map((x, k) => (k === i ? { ...x, children: move(x.children ?? [], j, -1) } : x)))} onDown={() => setItems(items.map((x, k) => (k === i ? { ...x, children: move(x.children ?? [], j, 1) } : x)))} />
                  ))}
                  {(item.children ?? []).length < lim.maxDropdownItems && <button type="button" onClick={() => setItems(items.map((x, k) => (k === i ? { ...x, children: [...(x.children ?? []), blank()] } : x)))} className="text-xs font-semibold text-primary-700 hover:underline">+ Add dropdown item under “{item.label || `Item ${i + 1}`}”</button>}
                </div>
              </div>
            ))}
            {items.length < lim.maxTopLevelItems && <button type="button" onClick={() => setItems([...items, blank()])} className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-semibold hover:bg-neutral-50"><Plus className="h-4 w-4" /> Add menu item</button>}
            {v.items.length > 0 && <button type="button" onClick={() => setItems([])} className="ml-3 text-sm font-semibold text-danger-600 hover:underline">Reset to the standard menu</button>}
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div><h2 className="text-lg font-bold text-neutral-900">Book Now button</h2></div>
        {!caps.bookNowCustomization && <p className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800">{options.data.notes.bookNow}</p>}
        <Field label="Button label" htmlFor="nav-book" hint="Leave empty to use the default.">
          <TextInput id="nav-book" disabled={!caps.bookNowCustomization} value={v.bookNowLabel ?? ""} maxLength={24} placeholder={v.effectiveNavigation.bookNow.label} onChange={(e) => form.patch({ bookNowLabel: e.target.value === "" ? null : e.target.value })} />
        </Field>
        <ToggleRow label="Hide the Book Now button" checked={v.bookNowHidden} disabled={!caps.bookNowCustomization} onChange={(x) => form.patch({ bookNowHidden: x })} />
      </section>
      <SaveBar dirty={form.dirty} onSave={form.submit} onReset={form.reset} saving={form.saving} error={form.error} />
    </div>
  );
}
