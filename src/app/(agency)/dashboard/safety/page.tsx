"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SOSAlertBanner } from "@/components/agency/safety/SOSAlertBanner";
import { ActiveTrekList } from "@/components/agency/safety/ActiveTrekList";
import { IncidentLog } from "@/components/agency/safety/IncidentLog";
import { useTheme } from "@/context/theme";
import { FileText } from "lucide-react";


const SafetyMap = dynamic(() => import("@/components/agency/safety/SafetyMap"), {

  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-slate-50 border border-dashed rounded-xl flex flex-col items-center justify-center text-slate-400 gap-2 animate-pulse">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
      <span className="text-xs font-medium">Mounting Live Telemetry Canvas...</span>
    </div>
  ),
});

const mockActiveTreks = [
  { id: "trk-101", name: "Everest Base Camp Trek", guide_name: "Pasang Sherpa", location_name: "Namche Bazaar", lat: 27.8069, lng: 86.7140, last_ping: "2 mins ago", has_sos: true },
  { id: "trk-102", name: "Annapurna Circuit Route", guide_name: "Nima Tamang", location_name: "Manang", lat: 28.6667, lng: 84.0167, last_ping: "14 mins ago", has_sos: false },
  { id: "trk-103", name: "Langtang Valley Expedition", guide_name: "Dorje Lama", location_name: "Kyanjin Gompa", lat: 28.2115, lng: 85.5670, last_ping: "Just now", has_sos: false }
];

const mockIncidents = [
  { id: "sos-901", date: "2026-06-22", trek: "Everest Base Camp", guide: "Pasang Sherpa", status: "Active", notes: "Trekker displaying mild acute mountain sickness symptoms. Supplemental oxygen container deployed. Remaining static at Namche Bazaar altitude." },
  { id: "sos-892", date: "2026-06-18", trek: "Mardi Himal Trek", guide: "Ramesh Gurung", status: "Resolved", notes: "Heavy whiteout storms restricted track pathway alignment. Team safely sheltered at High Camp. Weather cleared, trek successfully resumed." }
];

export default function SafetyPage() {
  const { isDark } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [selectedTrek, setSelectedTrek] = useState<string | null>(null);
  
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  const activeSosCount = mockActiveTreks.filter(t => t.has_sos).length;

  if (!mounted) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2">
        <div>
          <h1 className={`text-xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"
            }`}>
Safety Monitoring
            </h1>
          <div className="flex items-center gap-1.5 text-xs mt-0.5">
            <span className={isDark ? "text-slate-400" : "text-slate-500"}>

  Safety            </span>
            <span className={isDark ? "text-slate-600" : "text-slate-300"}>›</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">
Live Overview            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors shadow-2xs ${isDark
                ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <SOSAlertBanner activeSosCount={activeSosCount} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">


        <div className="lg:col-span-2 h-[420px]">
          <SafetyMap treks={mockActiveTreks} />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <ActiveTrekList
            treks={mockActiveTreks}
            selectedTrekId={selectedTrek}
            onSelectTrek={setSelectedTrek}
          />
        </div>
      </div>

      <IncidentLog incidents={mockIncidents} />
    </div>
  );
}