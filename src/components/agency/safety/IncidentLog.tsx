"use client";

import { useTheme } from "@/context/theme";
import { AlertTriangle, Check, FileText } from "lucide-react";

export interface IncidentItem {
  id: string;
  date: string;
  trek: string;
  guide: string;
  status: string;
  notes: string;
  coordinates?: string;
  time?: string;
  response?: string;
}

interface IncidentLogProps {
  incidents: IncidentItem[];
}

export function IncidentLog({ incidents }: IncidentLogProps) {
  const { isDark } = useTheme();

  return (
    <div 
      id="incident-log-table" 
      className={`rounded-xl border shadow-sm overflow-hidden transition-colors ${
        isDark 
          ? "bg-slate-900 border-slate-800 text-slate-100" 
          : "bg-white border-slate-200/60 text-slate-800"
      }`}
    >
      <div className={`p-4 border-b ${
        isDark 
          ? "border-slate-800 bg-slate-900/50" 
          : "border-slate-200/60 bg-slate-50/80"
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-bold text-sm ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            Incident Log
          </h3>
          <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Immutable — cannot be edited or deleted
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className={`border-b font-bold uppercase tracking-wider ${
              isDark 
                ? "bg-slate-900/80 border-slate-800 text-slate-400" 
                : "bg-slate-50 border-slate-200 text-slate-400"
            }`}>
              <th className="p-3.5">Incident ID</th>
              <th className="p-3.5">Trek / Guide</th>
              <th className="p-3.5">Coordinates</th>
              <th className="p-3.5">Time</th>
              <th className="p-3.5">Response</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Export</th>
            </tr>
          </thead>
          <tbody className={`divide-y font-medium ${
            isDark ? "divide-slate-800 text-slate-300" : "divide-slate-100 text-slate-600"
          }`}>
            {incidents.map((incident) => (
              <tr 
                key={incident.id} 
                className={`transition-colors ${
                  isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50/50"
                }`}
              >
                {/* Incident ID */}
                <td className="p-3.5 whitespace-nowrap font-mono font-bold">
                  <span className={incident.status === 'Active' ? 'text-red-500' : (isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {incident.id}
                  </span>
                </td>

                {/* Trek / Guide */}
                <td className="p-3.5 whitespace-nowrap">
                  <div className={`font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    {incident.trek}
                  </div>
                  <div className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {incident.guide}
                  </div>
                </td>

                {/* Coordinates */}
                <td className={`p-3.5 whitespace-nowrap font-mono text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {incident.coordinates || "28.007°N 86.852°E"}
                </td>

                {/* Time */}
                <td className="p-3.5 whitespace-nowrap">
                  <div className={isDark ? "text-slate-200" : "text-slate-700"}>
                    {incident.date}
                  </div>
                  <div className={`text-[11px] font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {incident.time || "09:14 NPT"}
                  </div>
                </td>

                {/* Response */}
                <td className="p-3.5 whitespace-nowrap font-mono font-semibold">
                  {incident.status === 'Active' ? (
                    <span className="text-amber-500 flex items-center gap-1">
                      {incident.response || "04:52"} <AlertTriangle className="w-3.5 h-3.5 inline-block" />
                    </span>
                  ) : (
                    <span className="text-emerald-500 flex items-center gap-1">
                      {incident.response || "08:14"} <Check className="w-3.5 h-3.5 inline-block" />
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="p-3.5 whitespace-nowrap">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    incident.status === 'Active' 
                      ? isDark 
                        ? 'bg-red-950/80 text-red-400 border border-red-900/50' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                      : isDark 
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/50' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {incident.status}
                  </span>
                </td>

                {/* Export */}
                <td className="p-3.5 whitespace-nowrap">
                  <button 
                    onClick={() => console.log(`Export PDF for ${incident.id}`)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
                      isDark 
                        ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white" 
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}