"use client";

import { useTheme } from "@/context/theme";
import { Compass, AlertTriangle} from "lucide-react";

export interface ActiveTrek {
  id: string;
  name: string;
  guide_name: string;
  location_name: string;
  lat: number;
  lng: number;
  last_ping: string;
  has_sos: boolean;
  elevation?: string;
  progressText?: string;
  progressPercentage?: number;
}

interface ActiveTrekListProps {
  treks: ActiveTrek[];
  selectedTrekId: string | null;
  onSelectTrek: (id: string) => void;
}

export function ActiveTrekList({ treks, selectedTrekId, onSelectTrek }: ActiveTrekListProps) {
  const { isDark } = useTheme();
  

  return (
    <div className={`p-4 rounded-xl border shadow-sm h-full transition-colors ${
      isDark 
        ? "bg-slate-900 border-slate-800 text-slate-100" 
        : "bg-white border-slate-200/60 text-slate-800"
    }`}>
      <h3 className={`font-bold text-sm mb-3 flex items-center justify-between ${
        isDark ? "text-slate-100" : "text-slate-800"
      }`}>
        <span>Active Treks</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
        }`}>
          {treks.length} Live
        </span>
      </h3>
      
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {treks.map((trek) => {
          const isSelected = selectedTrekId === trek.id;
          
          return (
            <div
              key={trek.id}
              onClick={() => onSelectTrek(trek.id)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer select-none ${
                isSelected 
                  ? isDark 
                    ? "bg-blue-950/40 border-blue-500 shadow-xs" 
                    : "bg-blue-50/60 border-blue-400 shadow-xs"
                  : trek.has_sos 
                    ? isDark 
                      ? "bg-red-950/30 border-red-900/60 hover:bg-red-950/50" 
                      : "bg-red-50/40 border-red-200 hover:bg-red-50/60"
                    : isDark 
                      ? "bg-slate-850 bg-slate-900/50 border-slate-800 hover:bg-slate-800/80" 
                      : "bg-slate-50/60 border-slate-100 hover:bg-slate-50"
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2.5">
                  {/* Icon badge using lucide-react */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    trek.has_sos
                      ? isDark ? "bg-red-950 border-red-800 text-red-400 animate-pulse" : "bg-red-50 border-red-200 text-red-600 animate-pulse"
                      : isDark ? "bg-slate-800 border-slate-700 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600"
                  }`}>
                    {trek.has_sos ? <AlertTriangle className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
                  </div>

                  <div>
                    <h4 className={`font-bold text-xs truncate max-w-[180px] ${
                      trek.has_sos 
                        ? isDark ? "text-red-400" : "text-red-600"
                        : isDark ? "text-slate-100" : "text-slate-800"
                    }`}>
                      {trek.name} — <span className={isDark ? "text-slate-300 font-medium" : "text-slate-600 font-medium"}>{trek.guide_name}</span>
                    </h4>
                    
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                      {trek.has_sos ? (
                        <span className="font-bold text-red-500 uppercase tracking-wide text-[10px]">
                          SOS ACTIVE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-semibold text-emerald-500 text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> LIVE
                        </span>
                      )}
                      <span className={isDark ? "text-slate-500" : "text-slate-300"}>•</span>
                      <span className={`font-mono text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {trek.elevation || trek.location_name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2.5">
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                  isDark ? "bg-slate-800" : "bg-slate-100"
                }`}>
                  <div 
                    className={`h-full rounded-full ${
                      trek.has_sos ? "bg-red-500" : "bg-blue-600"
                    }`}
                    style={{ width: `${trek.progressPercentage || 65}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] mt-2 pt-1">
                <span className={isDark ? "text-slate-400 font-medium" : "text-slate-500 font-medium"}>
                  {trek.progressText || "Day 4 of 12"}
                </span>
                <span className={`italic ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {trek.last_ping}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}