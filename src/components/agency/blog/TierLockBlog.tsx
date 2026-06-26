"use client";

interface TierLockBlogProps {
  currentTier: "Free" | "Small" | "Medium" | "Large";
  onUpgrade?: () => void;
}

export function TierLockBlog({ currentTier, onUpgrade }: TierLockBlogProps) {
  const isLocked = currentTier === "Free" || currentTier === "Small";

  if (!isLocked) return null;

  return (
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center rounded-xl animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md border border-slate-100 flex flex-col items-center">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6.125c0-.621.504-1.125 1.125-1.125H15M16.5 7.5V18a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 001.5-1.5V7.5M12 9a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Content Marketing Suite Locked</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Publishing indexable expedition blogs, travel guides, and organic SEO content requires a active <span className="font-semibold text-slate-800">Medium</span> or <span className="font-semibold text-slate-800">Large</span> license.
        </p>
        <div className="mt-6 w-full space-y-2">
          <button
            onClick={onUpgrade}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl text-xs shadow-sm transition-colors"
          >
            Upgrade to Medium Plan
          </button>
          <div className="text-[10px] text-slate-400 font-medium">Your current tier: {currentTier}</div>
        </div>
      </div>
    </div>
  );
}