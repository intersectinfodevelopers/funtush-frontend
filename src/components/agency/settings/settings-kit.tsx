"use client";

/**
 * Shared building blocks for every agency Settings page, so they all share one
 * look: token-based colours, rounded-2xl cards, the standard field/label/hint
 * rhythm, a toast, and a sticky save bar. Frontend-only (mock + localStorage).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";

/* ── Toast ──────────────────────────────────────────────────────────────── */

type ToastFn = (message?: string) => void;
const ToastCtx = createContext<ToastFn>(() => {});

export function SettingsToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message = "Changes saved") => {
    setMsg(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2600);
  }, []);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && (
        <div className="pointer-events-none fixed right-4 top-4 z-50 flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm font-semibold text-success-800 shadow-lg">
          <Check className="h-4 w-4" />
          {msg}
        </div>
      )}
    </ToastCtx.Provider>
  );
}

export const useSettingsToast = () => useContext(ToastCtx);

/* ── Persisted form state (mock: localStorage) ──────────────────────────── */

function readStore<T extends object>(storageKey: string, defaults: T): T {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<T>) } : defaults;
  } catch {
    return defaults;
  }
}

export function useSettingsForm<T extends object>(storageKey: string, defaults: T) {
  // Starting from `defaults` (not localStorage) keeps this render identical
  // on the server and on the client's first (hydrating) pass — a direct
  // hard load of a settings page is genuinely server-rendered, so reading
  // localStorage in the initial state here would disagree with the server's
  // markup and crash hydration. The real stored value loads right after, in
  // the mount effect below.
  const [value, setValue] = useState<T>(defaults);
  const [saved, setSaved] = useState<T>(defaults);
  const toast = useSettingsToast();

  useEffect(() => {
    const stored = readStore(storageKey, defaults);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(stored);
    setSaved(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const dirty = useMemo(() => JSON.stringify(value) !== JSON.stringify(saved), [value, saved]);

  const patch = useCallback((next: Partial<T>) => setValue((v) => ({ ...v, ...next })), []);

  const save = useCallback(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      /* ignore */
    }
    setSaved(value);
    toast();
  }, [storageKey, value, toast]);

  const reset = useCallback(() => setValue(saved), [saved]);

  return { value, patch, setValue, dirty, save, reset };
}

/* ── Page header ────────────────────────────────────────────────────────── */

export function SettingsHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Link href="/dashboard" className="hover:text-neutral-900">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/dashboard/settings" className="hover:text-neutral-900">
            Settings
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-primary-900">{title}</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-neutral-600">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ── Card / section ─────────────────────────────────────────────────────── */

export function SettingsSection({
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
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
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
    </section>
  );
}

/* ── Field ──────────────────────────────────────────────────────────────── */

const fieldClass =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-50";

export function Field({
  label,
  hint,
  required,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold text-neutral-700"
      >
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
  return <input {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
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
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition disabled:opacity-40 ${
          checked ? "bg-primary-600" : "bg-neutral-300"
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
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
  saving,
  error,
}: {
  dirty: boolean;
  onSave: () => void;
  onReset?: () => void;
  saving?: boolean;
  error?: string | null;
}) {
  return (
    <div
      className={`sticky bottom-0 -mx-3 flex items-center justify-end gap-3 border-t border-neutral-200 bg-white/90 px-3 py-3 backdrop-blur transition sm:-mx-4 sm:px-4 ${
        dirty ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {error ? (
        <span role="alert" className="mr-auto text-xs font-medium text-danger-600">{error}</span>
      ) : (
        <span className="mr-auto text-xs font-medium text-neutral-500">You have unsaved changes</span>
      )}
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
        disabled={saving}
        className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
