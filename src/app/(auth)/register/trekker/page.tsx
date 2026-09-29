'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel';
import { EMAIL_RE, passwordProblem } from '@/components/auth/PasswordRules';
import { api, type ApiError } from '@/lib/api/client';
import { loginTrekker } from '@/lib/api/auth';
import { ROUTES } from '@/lib/constants/routes';

const input = 'w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50';

export default function RegisterTrekkerPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.');
    const p = passwordProblem(password);
    if (p) return setError(p);
    if (password !== confirm) return setError("The passwords don't match.");
    setBusy(true);
    try {
      await api.post('/auth/register', { email: email.trim(), password, confirmPassword: confirm });
      await loginTrekker(email.trim(), password);
      router.replace(ROUTES.TREKKER.MY_TREKS);
    } catch (err) {
      const msg = (err as ApiError).message;
      // The API answers a taken address with a deliberately generic "Registration failed".
      setError(msg && msg !== 'Registration failed' ? msg : 'We couldn’t create that account. If you already have one, log in instead.');
    } finally { setBusy(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">
        <AuthLeftPanel />
        <div className="flex items-center justify-center bg-white px-8 py-10 sm:px-12">
          <div className="w-full max-w-sm">
            <Link href="/register" className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"><ChevronLeft className="h-4 w-4" /> Back</Link>
            <h1 className="text-2xl font-bold text-neutral-900">Create your trekker account</h1>
            <form onSubmit={submit} noValidate className="mt-5 space-y-3.5">
              <label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">Email</span><input id="rt-email" type="email" autoComplete="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
              <label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">Password</span><input id="rt-pass" type="password" autoComplete="new-password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
              <label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">Confirm password</span><input id="rt-conf" type="password" autoComplete="new-password" className={input} value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label>
              <p className="text-xs text-neutral-500">At least 8 characters with an uppercase letter, a lowercase letter and a number.</p>
              {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
              <button type="submit" disabled={busy} className="w-full rounded-xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{busy ? 'Creating…' : 'Create account'}</button>
            </form>
            <p className="mt-5 text-center text-sm text-neutral-500">Already have an account? <Link href="/login" className="font-semibold text-primary-700 hover:underline">Log in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
