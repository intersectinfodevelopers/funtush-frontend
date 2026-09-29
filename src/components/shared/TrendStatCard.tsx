"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowDownRight, ArrowUpRight, Download } from "lucide-react";

export type TrendTone = "primary" | "success" | "warning" | "danger";

const TONE_HEX: Record<TrendTone, string> = {
  primary: "#0369A1",
  success: "#16A34A",
  warning: "#EA580C",
  danger: "#DC2626",
};

/** A stat tile with a real sparkline underneath it — Finance "Summarized Result" / Analytics overview cards. */
export function TrendStatCard({
  label,
  value,
  tone,
  change,
  series,
  note = "vs last month",
  onExport,
}: {
  label: string;
  value: string | number;
  tone: TrendTone;
  /** Real comparison only — omit rather than fabricate. */
  change?: string;
  /** Real time series for the sparkline; each point needs a `v` field. */
  series: { label: string; v: number }[];
  note?: string;
  onExport?: () => void;
}) {
  const hex = TONE_HEX[tone];
  const gradientId = `trend-${tone}-${label.replace(/\s+/g, "-").toLowerCase()}`;
  const up = change ? !change.startsWith("-") : undefined;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-neutral-700">{label}</p>
        {onExport ? (
          <button type="button" onClick={onExport} aria-label={`Export ${label}`} className="text-neutral-400 transition hover:text-neutral-700">
            <Download className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
      {change ? (
        <p className="mt-1 flex items-center gap-1 text-xs">
          <span className={`inline-flex items-center gap-0.5 font-semibold ${up ? "text-success-700" : "text-danger-600"}`}>
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {change}
          </span>
          <span className="text-neutral-500">{note}</span>
        </p>
      ) : null}
      {series.length > 1 && (
        <div className="mt-3 h-14 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={hex} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={hex} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                cursor={false}
                formatter={(v) => [String(v), label]}
                labelFormatter={(l) => String(l)}
                contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e5e5e5" }}
              />
              <Area type="monotone" dataKey="v" stroke={hex} strokeWidth={2} fill={`url(#${gradientId})`} dot={false} activeDot={{ r: 3 }} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
