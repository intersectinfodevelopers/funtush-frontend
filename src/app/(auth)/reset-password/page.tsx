'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel';
import { api, type ApiError } from '@/lib/api/client';
import { ROUTES } from '@/lib/constants/routes';

/** Same rules the API enforces (registration + reset). */
function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return 'Use at least 8 characters.';
  if (pw.length > 72) return 'Use at most 72 characters.';
  if (!/[A-Z]/.test(pw)) return 'Add an uppercase letter.';
  if (!/[a-z]/.test(pw)) return 'Add a lowercase letter.';
  if (!/[0-9]/.test(pw)) return 'Add a number.';
  return null;
}

const input = 'w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50';

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const badLink = !/^[a-f0-9]{64}$/.test(token);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const p = passwordProblem(password);
    if (p) return setError(p);
    if (password !== confirm) return setError("The passwords don't match.");
    setBusy(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      window.setTimeout(() => router.replace(ROUTES.AUTH.LOGIN), 2500);
    } catch (err) {
      setError((err as ApiError).message || "We couldn't reset your password. The link may have expired.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">
        <AuthLeftPanel />
        <div className="flex items-center justify-center bg-white px-8 py-10 sm:px-12">
          <div className="w-full max-w-sm">
            <Link href={ROUTES.AUTH.LOGIN} className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"><ChevronLeft className="h-4 w-4" /> Back to login</Link>
            <h1 className="text-2xl font-bold text-neutral-900">Choose a new password</h1>
            {badLink ? (
              <div className="mt-4 space-y-3"><p role="alert" className="text-sm text-danger-600">This reset link is invalid or incomplete.</p><Link href={ROUTES.AUTH.FORGOT_PASSWORD} className="inline-block rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800">Request a new link</Link></div>
            ) : done ? (
              <p role="status" className="mt-4 text-sm text-success-700">Password updated. Taking you to the login page…</p>
            ) : (
              <form onSubmit={submit} noValidate className="mt-4 space-y-4">
                <label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">New password</span><input id="rp-new" type="password" autoComplete="new-password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
                <label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">Confirm new password</span><input id="rp-confirm" type="password" autoComplete="new-password" className={input} value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label>
                <p className="text-xs text-neutral-500">At least 8 characters with an uppercase letter, a lowercase letter and a number.</p>
                {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
                <button type="submit" disabled={busy} className="w-full rounded-xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{busy ? 'Updating…' : 'Update password'}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetForm /></Suspense>;
}
