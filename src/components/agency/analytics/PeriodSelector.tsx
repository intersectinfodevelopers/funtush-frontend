"use client";
import { useState } from "react";

export type AnalyticsPeriod = "Daily" | "Weekly" | "Monthly" | "Yearly" | "Custom";

interface PeriodSelectorProps {
  currentPeriod: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
}

export function PeriodSelector({ currentPeriod, onPeriodChange }: PeriodSelectorProps) {
  const periods: AnalyticsPeriod[] = ["Daily", "Weekly", "Monthly", "Yearly", "Custom"];
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => onPeriodChange(p)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-all select-none ${
              currentPeriod === p
                ? "bg-white text-slate-800 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {currentPeriod === "Custom" && (
        <div className="flex items-center gap-2 animate-fade-in">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-700"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-700"
          />
        </div>
      )}
    </div>
  );
}