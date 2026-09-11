"use client";

/**
 * Shared building blocks for every Trekker Hub page, so they all share one look:
 * token-based colours, rounded-2xl cards, one header rhythm, one status pill, one
 * mock-form helper. Frontend-only (mock JSON + localStorage), mirroring the
 * agency dashboard's `settings-kit.tsx`.
 */

import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/* ── Toast ──────────────────────────────────────────────────────────────── */

/** One entry point so every page fires the same toast style. */
export function hubToast(message: string, kind: "success" | "error" | "info" = "success") {
  if (kind === "error") return toast.error(message);
  return toast.success(message);
}

/* ── Persisted mock form state (localStorage) ───────────────────────────── */

function readStore<T extends object>(storageKey: string, defaults: T): T {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<T>) } : defaults;
  } catch {
    return defaults;
  }
}

export function useMockForm<T extends object>(storageKey: string, defaults: T) {
  const [value, setValue] = useState<T>(() => readStore(storageKey, defaults));
  const [saved, setSaved] = useState<T>(() => readStore(storageKey, defaults));

  const dirty = useMemo(() => JSON.stringify(value) !== JSON.stringify(saved), [value, saved]);
  const patch = useCallback((next: Partial<T>) => setValue((v) => ({ ...v, ...next })), []);

  const save = useCallback(
    (message = "Changes saved") => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } catch {
        /* ignore */
      }
      setSaved(value);
      hubToast(message);
    },
    [storageKey, value],
  );

  const reset = useCallback(() => setValue(saved), [saved]);

  return { value, patch, setValue, dirty, save, reset };
}

/* ── Page header ────────────────────────────────────────────────────────── */

export function HubHeader({
  title,
  description,
  back,
  action,
}: {
  title: string;
  description?: string;
  /** `true` for `router.back()`, or a href string. */
  back?: boolean | string;
  action?: ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {back != null && (
        <button
          type="button"
          onClick={() => (typeof back === "string" ? router.push(back) : router.back())}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      )}
      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-neutral-600">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

/* ── Card / section ─────────────────────────────────────────────────────── */

export function HubCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function HubSection({
  title,
  description,
  action,
  icon,
  children,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <HubCard>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            {icon && <span className="mt-0.5 text-neutral-400">{icon}</span>}
            <div>
              {title && <h2 className="text-base font-bold text-neutral-900">{title}</h2>}
              {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </HubCard>
  );
}

/* ── Stat card ──────────────────────────────────────────────────────────── */

type Tone = "primary" | "success" | "warning" | "danger" | "accent" | "neutral";

const TONE_CHIP: Record<Tone, string> = {
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  danger: "bg-danger-50 text-danger-700",
  accent: "bg-accent-50 text-accent-700",
  neutral: "bg-neutral-100 text-neutral-600",
};

export function StatCard({
  icon,
  label,
  value,
  tone = "neutral",
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  tone?: Tone;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", TONE_CHIP[tone])}>
          {icon}
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      </div>
      <p className="mt-2 text-lg font-bold text-neutral-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

/* ── Status pill — one source of truth for booking status colours ───────── */

export type BookingStatus =
  | "inquiry"
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled"
  | "refunded";

const STATUS_STYLE: Record<BookingStatus, { label: string; chip: string; dot: string }> = {
  inquiry: { label: "Inquiry", chip: "bg-accent-50 text-accent-700", dot: "bg-accent-500" },
  pending: { label: "Payment pending", chip: "bg-warning-50 text-warning-700", dot: "bg-warning-500" },
  confirmed: { label: "Confirmed", chip: "bg-success-50 text-success-700", dot: "bg-success-500" },
  active: { label: "On trek", chip: "bg-primary-50 text-primary-700", dot: "bg-primary-600" },
  completed: { label: "Completed", chip: "bg-neutral-100 text-neutral-600", dot: "bg-neutral-400" },
  cancelled: { label: "Cancelled", chip: "bg-danger-50 text-danger-700", dot: "bg-danger-500" },
  refunded: { label: "Refunded", chip: "bg-danger-50 text-danger-700", dot: "bg-danger-500" },
};

export function StatusPill({
  status,
  label,
  className,
}: {
  status: BookingStatus;
  label?: string;
  className?: string;
}) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.inquiry;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        s.chip,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {label ?? s.label}
    </span>
  );
}

/* ── Empty state ────────────────────────────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-white p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        {icon}
      </div>
      <p className="mt-4 text-base font-semibold text-neutral-700">{title}</p>
      {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ── Fields ─────────────────────────────────────────────────────────────── */

const fieldClass =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500";

export function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
        {label}
        {required && <span className="ml-1 text-danger-600">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-danger-600">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>
      )}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldClass, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(fieldClass, props.className)} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(fieldClass, props.className)} />;
}

/* ── Toggle row ─────────────────────────────────────────────────────────── */

export function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 p-3.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutral-800">{label}</p>
        {description && <p className="mt-0.5 text-xs text-neutral-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`Toggle ${label}`}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition disabled:opacity-40",
          checked ? "bg-primary-600" : "bg-neutral-300",
        )}
      >
        <span
          className={cn(
            "h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

/* ── Sticky save bar ────────────────────────────────────────────────────── */

export function SaveBar({
  dirty,
  onSave,
  onReset,
}: {
  dirty: boolean;
  onSave: () => void;
  onReset?: () => void;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur transition",
        dirty ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <span className="mr-auto text-xs font-medium text-neutral-500">You have unsaved changes</span>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Discard
        </button>
      )}
      <button
        type="button"
        onClick={onSave}
        className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
      >
        Save changes
      </button>
    </div>
  );
}

/* ── Small helpers ──────────────────────────────────────────────────────── */

export function LinkRow({
  href,
  onClick,
  icon,
  title,
  subtitle,
  tone = "neutral",
}: {
  href?: string;
  onClick?: () => void;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  tone?: "neutral" | "danger";
}) {
  const inner = (
    <>
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          tone === "danger" ? "bg-danger-50 text-danger-600" : "bg-neutral-100 text-neutral-600",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm font-semibold",
            tone === "danger" ? "text-danger-600" : "text-neutral-900",
          )}
        >
          {title}
        </span>
        {subtitle && <span className="block text-xs text-neutral-500">{subtitle}</span>}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" />
    </>
  );

  const cls = cn(
    "flex w-full items-center gap-3 px-1 py-3 text-left transition-colors",
    tone === "danger" ? "hover:bg-danger-50" : "hover:bg-neutral-50",
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}
