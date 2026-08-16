"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

export type AnalyticsTone = "primary" | "success" | "warning" | "accent" | "danger";

const toneStyles: Record<AnalyticsTone, { card: string; icon: string }> = {
  primary: { card: "border-primary-100 bg-primary-50", icon: "bg-primary-900 text-white" },
  success: { card: "border-success-100 bg-success-50", icon: "bg-success-600 text-white" },
  warning: { card: "border-warning-100 bg-warning-50", icon: "bg-warning-500 text-white" },
  accent: { card: "border-accent-100 bg-accent-50", icon: "bg-accent-600 text-white" },
  danger: { card: "border-danger-100 bg-danger-50", icon: "bg-danger-600 text-white" },
};

export function AnalyticsSummaryCard({
  label,
  value,
  tone,
  icon: Icon,
  change = "12.5%",
}: {
  label: string;
  value: number | string;
  tone: AnalyticsTone;
  icon?: React.ComponentType<any> | null;
  change?: string;
}) {
  const styles = toneStyles[tone] ?? toneStyles.primary;

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${styles.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles.icon}`}>
          {Icon ? <Icon className="h-4 w-4" /> : null}
        </div>
        <ArrowUpRight className="h-4 w-4 text-success-600" />
      </div>
      <p className="mt-3 text-sm font-semibold text-neutral-700">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
      <p className="mt-2 flex items-center gap-1 text-xs text-neutral-600">
        <span className="font-semibold text-success-700">{change}</span> from last month
      </p>
    </div>
  );
}
