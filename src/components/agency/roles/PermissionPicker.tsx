"use client";

import { usePermissionCatalog } from "@/hooks/useAgencyTeam";

/**
 * The API's canonical permission catalog, flattened into a 2-column grid of toggle cards; controlled by a list of keys.
 * `onToggle` (not a full replacement array) so the caller can apply it as a functional state update — two toggles
 * clicked in the same React batch would otherwise both read the same stale `value` and the second silently drops
 * the first (confirmed live: toggling two switches back-to-back only ever saved the last one).
 */
export default function PermissionPicker({ value, onToggle }: { value: string[]; onToggle: (key: string) => void }) {
  const { data, isLoading } = usePermissionCatalog();
  const permissions = (data ?? []).flatMap((g) => g.permissions);

  if (isLoading) return <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-100" />)}</div>;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {permissions.map((p) => {
        const on = value.includes(p.key);
        return (
          <div key={p.key} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-sm font-bold text-neutral-900">{p.label}</p>
              <p className="truncate text-xs text-neutral-500" title={p.description}>{p.description}</p>
            </div>
            <button type="button" role="switch" aria-checked={on} aria-label={p.label} onClick={() => onToggle(p.key)} className={`flex h-6 w-12 shrink-0 items-center rounded-full p-0.5 transition ${on ? "bg-primary-900" : "bg-neutral-300"}`}>
              <span className={`h-5 w-5 rounded-full bg-white shadow transition ${on ? "translate-x-6" : ""}`} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
