'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { passwordProblem } from '@/components/auth/PasswordRules';
import { useAuth } from '@/hooks/useAuth';
import { useMyProfile } from '@/hooks/useTrekker';
import type { ApiError } from '@/lib/api/client';
import { changePassword } from '@/lib/api/agency/settings';
import { api } from '@/lib/api/client';
import { saveMyProfile, type TrekkerProfile } from '@/lib/api/trekker';

const input = 'mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 disabled:bg-neutral-50';
const PHONE_RE = /^[+()\d][\d\s()+.-]{6,24}$/;
const KEYS = ['fullName', 'phone', 'country', 'nationality', 'emergencyContactName', 'emergencyContactPhone'] as const;
type Key = (typeof KEYS)[number];
const LABEL: Record<Key, string> = { fullName: 'Full name', phone: 'Phone', country: 'Country', nationality: 'Nationality', emergencyContactName: 'Emergency contact name', emergencyContactPhone: 'Emergency contact phone' };

function ProfileForm({ profile }: { profile: TrekkerProfile }) {
  const qc = useQueryClient();
  const [v, setV] = useState<Record<Key, string>>(() => Object.fromEntries(KEYS.map((k) => [k, profile[k] ?? ''])) as Record<Key, string>);
  const [error, setError] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: () => saveMyProfile(Object.fromEntries(KEYS.map((k) => [k, v[k].trim() === '' ? null : v[k].trim()]))),
    onSuccess: () => { setError(null); toast.success('Profile saved'); void qc.invalidateQueries({ queryKey: ['trekker', 'profile'] }); },
    onError: (e) => setError((e as unknown as ApiError).message || "Couldn't save your profile."),
  });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (v.fullName.trim() && v.fullName.trim().length < 2) return setError('Enter your full name.');
    for (const k of ['phone', 'emergencyContactPhone'] as const) if (v[k].trim() && !PHONE_RE.test(v[k].trim())) return setError(`${LABEL[k]} doesn't look like a phone number.`);
    save.mutate();
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div><h2 className="font-bold text-neutral-900">Your details</h2><p className="text-sm text-neutral-500">Signed in as {profile.email}</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        {KEYS.map((k) => <label key={k} className="block text-sm"><span className="font-semibold text-neutral-700">{LABEL[k]}</span><input id={`tp-${k}`} className={input} value={v[k]} maxLength={100} onChange={(e) => setV((c) => ({ ...c, [k]: e.target.value }))} /></label>)}
      </div>
      <p className="text-xs text-neutral-500">Your emergency contact is shared with your guide and agency during a trek.</p>
      {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
      <button type="submit" disabled={save.isPending} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{save.isPending ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}

function VerifyEmail({ profile }: { profile: TrekkerProfile }) {
  const qc = useQueryClient();
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const send = useMutation({ mutationFn: () => api.post('/auth/trekker/resend-otp', { email: profile.email }), onSuccess: () => { setSent(true); setError(null); toast.success('Code sent — check your email'); }, onError: (e) => setError((e as unknown as ApiError).message || "Couldn't send the code.") });
  const verify = useMutation({ mutationFn: () => api.post('/auth/verify-otp', { userId: profile.id, otp: otp.trim() }), onSuccess: () => { toast.success('Email verified'); void qc.invalidateQueries({ queryKey: ['trekker', 'profile'] }); }, onError: () => setError('That code is incorrect or has expired.') });
  if (profile.isEmailVerified) return <p className="rounded-2xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-800">Your email address is verified.</p>;
  return (
    <section aria-label="Verify email" className="space-y-3 rounded-2xl border border-warning-200 bg-warning-50 p-5">
      <h2 className="font-bold text-neutral-900">Verify your email</h2>
      <p className="text-sm text-neutral-600">We&apos;ll send a 6-digit code to {profile.email}.</p>
      <div className="flex flex-wrap items-end gap-3">
        <button type="button" disabled={send.isPending} onClick={() => send.mutate()} className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-neutral-50 disabled:opacity-50">{sent ? 'Send code again' : 'Send code'}</button>
        {sent && (<><label className="block text-sm"><span className="font-semibold text-neutral-700">Code</span><input id="tp-otp" inputMode="numeric" maxLength={6} className={input} value={otp} onChange={(e) => setOtp(e.target.value)} /></label>
          <button type="button" disabled={verify.isPending} onClick={() => { setError(null); if (!/^\d{6}$/.test(otp.trim())) return setError('Enter the 6-digit code.'); verify.mutate(); }} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">Verify</button></>)}
      </div>
      {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
    </section>
  );
}

function PasswordForm() {
  const router = useRouter();
  const { logout } = useAuth();
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [conf, setConf] = useState('');
  const [error, setError] = useState<string | null>(null);
  const change = useMutation({ mutationFn: () => changePassword(cur, next), onSuccess: () => { logout(); router.replace('/login'); }, onError: (e) => setError((e as unknown as ApiError).message || "Couldn't change your password.") });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!cur) return setError('Enter your current password.');
    const p = passwordProblem(next);
    if (p) return setError(p);
    if (next !== conf) return setError("The new passwords don't match.");
    change.mutate();
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div><h2 className="font-bold text-neutral-900">Change password</h2><p className="text-sm text-neutral-500">You&apos;ll be signed out everywhere and asked to sign in again.</p></div>
      <div className="grid max-w-md gap-3">
        <label className="block text-sm"><span className="font-semibold text-neutral-700">Current password</span><input id="tp-cur" type="password" autoComplete="current-password" className={input} value={cur} onChange={(e) => setCur(e.target.value)} /></label>
        <label className="block text-sm"><span className="font-semibold text-neutral-700">New password</span><input id="tp-new" type="password" autoComplete="new-password" className={input} value={next} onChange={(e) => setNext(e.target.value)} /></label>
        <label className="block text-sm"><span className="font-semibold text-neutral-700">Confirm new password</span><input id="tp-conf" type="password" autoComplete="new-password" className={input} value={conf} onChange={(e) => setConf(e.target.value)} /></label>
      </div>
      {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
      <button type="submit" disabled={change.isPending} className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50 disabled:opacity-50">{change.isPending ? 'Updating…' : 'Update password'}</button>
    </form>
  );
}

export default function TrekkerProfilePage() {
  const { data, isLoading, isError } = useMyProfile();
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
      {isLoading ? <div className="h-48 animate-pulse rounded-2xl bg-white" /> : isError || !data ? <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load your profile.</p> : <><VerifyEmail profile={data} /><ProfileForm profile={data} /></>}
      <PasswordForm />
    </div>
  );
}
