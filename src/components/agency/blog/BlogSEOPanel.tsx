"use client";

interface SEOMetadata {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

interface BlogSEOPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  metadata: SEOMetadata;
  onChange: (updated: SEOMetadata) => void;
}

export function BlogSEOPanel({ isOpen, onToggle, metadata, onChange }: BlogSEOPanelProps) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden transition-all duration-200 shadow-xs">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between bg-slate-50/80 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Search Engine Optimization (SEO) Tuning</span>
        </div>
        <span className="text-slate-400 text-xs">{isOpen ? "Hide" : "Configure"}</span>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-100 space-y-4 text-xs animate-fade-in">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Meta Title Tag</label>
            <input
              type="text"
              placeholder="Recommended size: under 60 characters"
              value={metadata.metaTitle}
              onChange={(e) => onChange({ ...metadata, metaTitle: e.target.value })}
              className="w-full border border-slate-200 rounded-lg p-2 text-slate-700 focus:ring-1 focus:ring-blue-500 font-medium outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Meta Description Tag</label>
            <textarea
              rows={3}
              placeholder="Recommended size: under 160 characters describing post keywords..."
              value={metadata.metaDescription}
              onChange={(e) => onChange({ ...metadata, metaDescription: e.target.value })}
              className="w-full border border-slate-200 rounded-lg p-2 text-slate-700 focus:ring-1 focus:ring-blue-500 font-medium outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Social Open Graph (OG) Image URL</label>
            <input
              type="url"
              placeholder="https://example.com/assets/og-cover.jpg"
              value={metadata.ogImage}
              onChange={(e) => onChange({ ...metadata, ogImage: e.target.value })}
              className="w-full border border-slate-200 rounded-lg p-2 font-mono text-slate-600 focus:ring-1 focus:ring-blue-500 outline-hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}