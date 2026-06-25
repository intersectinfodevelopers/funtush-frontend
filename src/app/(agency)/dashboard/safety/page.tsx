"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SOSAlertBanner } from "@/components/agency/safety/SOSAlertBanner";
import { ActiveTrekList } from "@/components/agency/safety/ActiveTrekList";
import { IncidentLog } from "@/components/agency/safety/IncidentLog";

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
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Safety & Live Tracking</h1>
        <p className="text-sm text-slate-500 mt-0.5">Real-time GPS tracker telemetry updates and emergency SOS incident dispatch monitoring.</p>
      </div>

      <SOSAlertBanner activeSosCount={activeSosCount} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4 lg:col-span-1">
          <ActiveTrekList 
            treks={mockActiveTreks} 
            selectedTrekId={selectedTrek} 
            onSelectTrek={setSelectedTrek} 
          />
        </div>

        <div className="lg:col-span-2 h-[420px]">
          <SafetyMap treks={mockActiveTreks}  />
        </div>
      </div>

      <IncidentLog incidents={mockIncidents} />
    </div>
  );
}