"use client";

import { useMemo, useState } from "react";
import { Search, ExternalLink, Mountain } from "lucide-react";
import toast from "react-hot-toast";

interface SiteTemplate {
  id: string;
  name: string;
  sections: number;
  description: string;
  gradient: string;
}

const TEMPLATES: SiteTemplate[] = [
  {
    id: "classic-trek-operator",
    name: "Classic Trek Operator",
    sections: 7,
    description: "A traditional storefront with hero slider, packages, guides and FAQ.",
    gradient: "from-primary-600 to-accent-500",
  },
  {
    id: "adventure-landing",
    name: "Adventure Landing",
    sections: 5,
    description: "A minimal landing page — hero image, highlights, and a single strong CTA.",
    gradient: "from-neutral-700 to-neutral-500",
  },
  {
    id: "himalayan-story",
    name: "Himalayan Story",
    sections: 8,
    description: "Blog-forward layout that leads with trip reports and photo essays.",
    gradient: "from-success-600 to-success-400",
  },
  {
    id: "expedition-pro",
    name: "Expedition Pro",
    sections: 9,
    description: "Gallery-heavy design for technical climbs and multi-week expeditions.",
    gradient: "from-warning-600 to-danger-500",
  },
  {
    id: "boutique-trekking",
    name: "Boutique Trekking",
    sections: 6,
    description: "An elegant, understated layout for small-group premium treks.",
    gradient: "from-accent-700 to-primary-500",
  },
  {
    id: "family-adventures",
    name: "Family Adventures",
    sections: 6,
    description: "Friendly, colourful layout built around family and beginner routes.",
    gradient: "from-danger-500 to-warning-400",
  },
];

export function TemplatesTab() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TEMPLATES;
    return TEMPLATES.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    );
  }, [query]);

  const addPageFromTemplate = (t: SiteTemplate) => {
    toast.success(`"${t.name}" added as a new page (mock)`);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search templates"
          className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-900 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-white px-6 py-16 text-center">
          <p className="text-sm text-neutral-500">No templates match &quot;{query}&quot;.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`relative flex h-32 items-center justify-center bg-linear-to-br ${t.gradient}`}>
                <Mountain className="h-10 w-10 text-white/70" />
                <button
                  type="button"
                  onClick={() => toast(`Preview coming soon for "${t.name}"`, { icon: "👀" })}
                  className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-lg bg-white/20 text-white backdrop-blur hover:bg-white/30"
                  aria-label={`Preview ${t.name}`}
                >
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm font-bold text-neutral-900">
                  {t.name} <span className="font-normal text-neutral-400">· {t.sections} sections</span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">{t.description}</p>
                <button
                  type="button"
                  onClick={() => addPageFromTemplate(t)}
                  className="mt-3 w-full rounded-xl bg-primary-900 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-800"
                >
                  Add Page
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

