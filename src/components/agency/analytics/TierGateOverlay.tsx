"use client";

interface TierGateOverlayProps {
  currentTier: "Free" | "Small" | "Medium" | "Large";
  onUpgrade?: () => void;
}

export function TierGateOverlay({ currentTier, onUpgrade }: TierGateOverlayProps) {
  const isLocked = currentTier === "Free" || currentTier === "Small";

  if (!isLocked) return null;

  return (
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in rounded-xl">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md border border-slate-100 flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Advanced Analytics Locked</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Expedition telemetry graphs, booking conversion statistics, and performance charts are exclusive to <span className="font-semibold text-slate-800">Medium</span> and <span className="font-semibold text-slate-800">Large</span> agency networks.
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