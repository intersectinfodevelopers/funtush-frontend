"use client";

export interface ActiveTrek {
  id: string;
  name: string;
  guide_name: string;
  location_name: string;
  lat: number;
  lng: number;
  last_ping: string;
  has_sos: boolean;
}

interface ActiveTrekListProps {
  treks: ActiveTrek[];
  selectedTrekId: string | null;
  onSelectTrek: (id: string) => void;
}

export function ActiveTrekList({ treks, selectedTrekId, onSelectTrek }: ActiveTrekListProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm h-full">
      <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center justify-between">
        <span>Active Trekking Teams</span>
        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-semibold">
          {treks.length} Live
        </span>
      </h3>
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {treks.map((trek) => (
          <div
            key={trek.id}
            onClick={() => onSelectTrek(trek.id)}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer select-none ${
              selectedTrekId === trek.id 
                ? "bg-blue-50/60 border-blue-400 shadow-xs" 
                : trek.has_sos 
                  ? "bg-red-50/40 border-red-200 hover:bg-red-50/60" 
                  : "bg-slate-50/60 border-slate-100 hover:bg-slate-50"
            }`}
          >
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-slate-800 text-xs truncate max-w-[180px]">{trek.name}</h4>
              {trek.has_sos && (
                <span className="bg-red-600 text-white text-[9px] font-black tracking-wider uppercase px-1 rounded animate-pulse">
                  SOS
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Guide: <span className="font-semibold text-slate-700">{trek.guide_name}</span>
            </p>
            <p className="text-[11px] text-slate-500">
              Position: <span className="font-semibold text-slate-700">{trek.location_name}</span>
            </p>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-200/40">
              <span>ID: {trek.id}</span>
              <span className="italic">{trek.last_ping}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}