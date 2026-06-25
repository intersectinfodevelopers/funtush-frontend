"use client";
import { useState } from "react";
import { PeriodSelector, AnalyticsPeriod } from "@/components/agency/analytics/PeriodSelector";
import { TierGateOverlay } from "@/components/agency/analytics/TierGateOverlay";

export default function Page() {
  const [agencyTier, setAgencyTier] = useState<"Free" | "Small" | "Medium" | "Large">("Medium");
  const [period, setPeriod] = useState<AnalyticsPeriod>("Monthly");

  const handleUpgradeMock = () => {
    alert("Redirecting to upgrade payment gateway context...");
    setAgencyTier("Medium");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative min-h-[85vh]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Expedition Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track agency operational conversion curves and customer metrics metrics channels.</p>
        </div>
        
        <div className="flex items-center gap-2 border bg-slate-50 px-2 py-1 rounded-lg text-[11px] self-start">
          <span className="text-slate-400">Layout Tier Test:</span>
          <select 
            value={agencyTier} 
           onChange={(e) => setAgencyTier(e.target.value as "Free" | "Small" | "Medium" | "Large")}
            className="bg-transparent font-semibold text-slate-700 outline-hidden cursor-pointer"
          >
            <option value="Free">Free (Locked)</option>
            <option value="Small">Small (Locked)</option>
            <option value="Medium">Medium (Unlocked)</option>
            <option value="Large">Large (Unlocked)</option>
          </select>
        </div>
      </div>

      <PeriodSelector currentPeriod={period} onPeriodChange={setPeriod} />

      <div className="relative min-h-[450px] grid grid-cols-1 md:grid-cols-3 gap-6">
        <TierGateOverlay currentTier={agencyTier} onUpgrade={handleUpgradeMock} />

        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-xs md:col-span-2 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Booking Conversion Performance Matrix</h3>
            <span className="text-[10px] text-blue-600 bg-blue-50 font-bold px-2 py-0.5 rounded-sm">{period} View</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-300 border border-dashed border-slate-200 rounded-lg mt-4 bg-slate-50/50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h2.25A1.125 1.125 0 014.125 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <span className="text-xs font-medium text-slate-400">Interactive Telemetry Graph Stub Active</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Traffic Demographics</h3>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-300 border border-dashed border-slate-200 rounded-lg mt-4 bg-slate-50/50">
            <div className="w-24 h-24 rounded-full border-8 border-slate-200 border-t-blue-500 animate-spin-slow mb-3" />
            <span className="text-xs font-medium text-slate-400">Regional Distribution Stub</span>
          </div>
        </div>
      </div>
    </div>
  );
}