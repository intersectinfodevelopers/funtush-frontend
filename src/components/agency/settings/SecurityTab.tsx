"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { Field, TextInput } from "@/components/agency/settings/settings-kit";
import { useAuth } from "@/hooks/useAuth";
import { changePassword } from "@/lib/api/agency/settings";
import type { ApiError } from "@/lib/api/client";

/** Same rules the API enforces at registration and reset. */
function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return "Use at least 8 characters.";
  if (pw.length > 72) return "Use at most 72 characters.";
  if (!/[A-Z]/.test(pw)) return "Add an uppercase letter.";
  if (!/[a-z]/.test(pw)) return "Add a lowercase letter.";
  if (!/[0-9]/.test(pw)) return "Add a number.";
  return null;
}

export function SecurityTab() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const support = Boolean(user?.support);
  const change = useMutation({
    mutationFn: () => changePassword(current, next),
    // The server ends every session (including this one) — sign in again with the new password.
    onSuccess: async () => { await logout(); router.replace("/login"); },
    onError: (e) => setError((e as unknown as ApiError).message || "Couldn't change your password."),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!current) return setError("Enter your current password.");
    const p = passwordProblem(next);
    if (p) return setError(p);
    if (next === current) return setError("Choose a new password that's different from the current one.");
    if (next !== confirm) return setError("The new passwords don't match.");
    change.mutate();
  }

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary-700" /><h2 className="text-lg font-bold text-neutral-900">Change password</h2></div>
        <p className="text-sm text-neutral-500">You&apos;ll be signed out everywhere and asked to sign in again with the new password.</p>
        {support && <p className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-2.5 text-sm text-warning-800">Passwords can&apos;t be changed during a support session.</p>}
        <form onSubmit={submit} noValidate className={`max-w-md space-y-4 ${support ? "pointer-events-none opacity-50" : ""}`}>
          <Field label="Current password" htmlFor="sec-cur"><TextInput id="sec-cur" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} /></Field>
          <Field label="New password" htmlFor="sec-new" hint="At least 8 characters with an uppercase letter, a lowercase letter and a number."><TextInput id="sec-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} /></Field>
          <Field label="Confirm new password" htmlFor="sec-conf"><TextInput id="sec-conf" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
          {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
          <button type="submit" disabled={change.isPending || support} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{change.isPending ? "Updating…" : "Update password"}</button>
        </form>
      </section>
    </div>
  );
}
