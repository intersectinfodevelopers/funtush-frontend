"use client";

import { useTheme } from "@/context/theme";
import {Phone, MessageSquare, Check, ShieldAlert } from "lucide-react";

interface SOSAlertBannerProps {
  activeSosCount: number;
  guideName?: string;
  trekName?: string;
  coordinates?: string;
  triggeredBy?: string;
  timer?: string;
  onAcknowledge?: () => void;
  onCallGuide?: () => void;
  onWhatsApp?: () => void;
}

export function SOSAlertBanner({ 
  activeSosCount,
  guideName = "Bishal Tamang",
  trekName = "EBC — Day 4",
  coordinates = "28.0071°N 86.8524°E 5,364m",
  triggeredBy = "Guide (mobile app)",
  timer = "04:52",
  onAcknowledge,
  onCallGuide,
  onWhatsApp
}: SOSAlertBannerProps) {
  const { isDark } = useTheme();

  if (activeSosCount === 0) return null;

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${
      isDark 
        ? "bg-red-950/40 border-red-900/60 text-red-200" 
        : "bg-red-50 border-red-200 text-red-900"
    }`}>
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
          <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400 text-xs tracking-wide uppercase">
            <ShieldAlert className="w-4 h-4" />
            <span>ACTIVE SOS — Respond within 15 minutes</span>
          </div>
        </div>
        <div className="font-mono font-bold text-red-600 dark:text-red-400 text-sm">
          {timer}
        </div>
      </div>

      {/* Details Grid & Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs items-center">
        <div>
          <span className={`block text-[11px] ${isDark ? "text-red-400/70" : "text-red-700/70"}`}>Guide</span>
          <span className={`font-bold text-sm ${isDark ? "text-red-100" : "text-red-950"}`}>{guideName}</span>
        </div>

        <div>
          <span className={`block text-[11px] ${isDark ? "text-red-400/70" : "text-red-700/70"}`}>Trek</span>
          <span className={`font-bold text-sm ${isDark ? "text-red-100" : "text-red-950"}`}>{trekName}</span>
        </div>

        <div>
          <span className={`block text-[11px] ${isDark ? "text-red-400/70" : "text-red-700/70"}`}>GPS Coordinates</span>
          <span className={`font-mono font-bold ${isDark ? "text-red-200" : "text-red-900"}`}>{coordinates}</span>
        </div>

       
      </div>

      {/* Bottom Footer: Emergency Call & Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs items-center flex-wrap">
       <div>
          <span className={`block text-[11px] ${isDark ? "text-red-400/70" : "text-red-700/70"}`}>Triggered by</span>
          <span className={`font-semibold ${isDark ? "text-red-200" : "text-red-900"}`}>{triggeredBy}</span>
        </div>
        <div className="items-center gap-2 text-xs font-semibold">
          <p className={isDark ? "text-red-400/70 pb-2" : "text-red-700/70 pb-2"}>Emergency call</p>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded text-[11px]">
            <Check className="w-3 h-3" /> Nepal Police (100)
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-1 sm:flex-none">
          <button 
            onClick={onAcknowledge}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Acknowledge
          </button>
          
          <button 
            onClick={onCallGuide}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg border shadow-xs transition-colors ${
              isDark 
                ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" /> Call Guide
          </button>

          <button 
            onClick={onWhatsApp}
            className={`inline-flex w-full sm:w-auto items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg border shadow-xs transition-colors ${
              isDark 
                ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}