'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel';
import { EMAIL_RE, passwordProblem } from '@/components/auth/PasswordRules';
import { api, type ApiError } from '@/lib/api/client';
import { loginAgency } from '@/lib/api/auth';

const input = 'w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50';
const PHONE_RE = /^(98|97)\d{8}$/;

interface RegisterResponse { otpRequired?: boolean; data?: { sessionToken?: string } }

export default function RegisterAgencyPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [session, setSession] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function finish() {
    // Registration doesn't return a session; sign in with what they just chose.
    await loginAgency(email.trim(), password);
    router.replace('/dashboard');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const n = name.trim();
    if (n.length < 2 || n.length > 100) return setError('Enter your agency name (2–100 characters).');
    if (/[<>]/.test(n)) return setError("The name can't contain < or >.");
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.');
    if (!PHONE_RE.test(phone.trim())) return setError('Enter a 10-digit Nepali mobile number starting with 98 or 97.');
    const p = passwordProblem(password);
    if (p) return setError(p);
    if (password !== confirm) return setError("The passwords don't match.");
    if (!terms) return setError('Please accept the terms to continue.');
    setBusy(true);
    try {
      const res = await api.post<RegisterResponse>('/register/agency', { name: n, email: email.trim(), phone: phone.trim(), password });
      if (res.otpRequired && res.data?.sessionToken) { setSession(res.data.sessionToken); return; }
      await finish();
    } catch (err) {
      setError((err as ApiError).message || "We couldn't create your account. Please try again.");
    } finally { setBusy(false); }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(otp.trim())) return setError('Enter the 6-digit code we texted you.');
    setBusy(true);
    try {
      await api.post('/register/agency/verify-otp', { sessionToken: session, otp: otp.trim() });
      await finish();
    } catch (err) {
      setError((err as ApiError).message || "That code didn't work.");
    } finally { setBusy(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">
        <AuthLeftPanel />
        <div className="flex items-center justify-center bg-white px-8 py-10 sm:px-12">
          <div className="w-full max-w-sm">
            <Link href="/register" className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"><ChevronLeft className="h-4 w-4" /> Back</Link>
            <h1 className="text-2xl font-bold text-neutral-900">Register your agency</h1>
            <p className="mt-1 text-sm text-neutral-500">Free for 30 days. No card needed.</p>
            {session ? (
              <form onSubmit={verify} noValidate className="mt-5 space-y-4">
                <p className="text-sm text-neutral-600">We sent a 6-digit code to your phone. It expires in 15 minutes.</p>
                <label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">Verification code</span><input id="ra-otp" inputMode="numeric" maxLength={6} className={input} value={otp} onChange={(e) => setOtp(e.target.value)} /></label>
                {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
                <button type="submit" disabled={busy} className="w-full rounded-xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{busy ? 'Verifying…' : 'Verify and create account'}</button>
              </form>
            ) : (
              <form onSubmit={submit} noValidate className="mt-5 space-y-3.5">
                <label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">Agency name</span><input id="ra-name" className={input} value={name} maxLength={100} onChange={(e) => setName(e.target.value)} /></label>
                <label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">Email</span><input id="ra-email" type="email" autoComplete="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
                <label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">Mobile number</span><input id="ra-phone" inputMode="numeric" maxLength={10} placeholder="98XXXXXXXX" className={input} value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
                <label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">Password</span><input id="ra-pass" type="password" autoComplete="new-password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
                <label className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">Confirm password</span><input id="ra-conf" type="password" autoComplete="new-password" className={input} value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label>
                <p className="text-xs text-neutral-500">At least 8 characters with an uppercase letter, a lowercase letter and a number.</p>
                <label className="flex items-start gap-2 text-sm text-neutral-600"><input id="ra-terms" type="checkbox" className="mt-0.5" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> I agree to the terms of service and privacy policy.</label>
                {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
                <button type="submit" disabled={busy} className="w-full rounded-xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{busy ? 'Creating your account…' : 'Create agency account'}</button>
              </form>
            )}
            <p className="mt-5 text-center text-sm text-neutral-500">Already registered? <Link href="/login" className="font-semibold text-primary-700 hover:underline">Log in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
