'use client';

import { discountedPerPerson } from '@/lib/pricing';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';

import { Loading, Note } from '@/components/site/PageFrame';
import { API_BASE_URL } from '@/lib/api/client';
import { siteApi } from '@/lib/site/api';
import { useSite } from '@/lib/site/SiteContext';

const field = 'w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-4 focus:ring-neutral-100';
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const PHONE_RE = /^[+()\d][\d\s()+.-]{6,24}$/;
const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// A tiny public POST helper: the site is cookie-less and unauthenticated, so no API-client auth/refresh.
async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = (await res.json().catch(() => ({}))) as { data?: T; message?: string };
  if (!res.ok) throw new Error(j.message || 'Something went wrong. Please try again.');
  return j.data as T;
}

export default function BookPage() {
  const { packageId } = useParams<{ packageId: string }>();
  const { slug, href, money } = useSite();
  const { data: p, isLoading, isError } = useQuery({ queryKey: ['site', slug, 'package', packageId], queryFn: () => siteApi.package(slug, packageId), staleTime: 30_000, retry: false });

  const [departure, setDeparture] = useState('');
  const [group, setGroup] = useState(1);
  const [addOns, setAddOns] = useState<Record<string, number>>({});
  const [f, setF] = useState({ name: '', email: '', phone: '', country: '', notes: '', coupon: '' });
  const [session, setSession] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((c) => ({ ...c, [k]: e.target.value }));

  const chosen = p?.departures.find((d) => d.id === departure);
  const estimate = useMemo(() => {
    if (!p) return 0;
    const extras = p.addOns.reduce((s, a) => { const q = addOns[a.id] ?? 0; return s + (q > 0 ? a.price * (a.perPerson ? group * q : q) : 0); }, 0);
    return discountedPerPerson(p.pricePerPerson, p.volumeDiscounts, group) * group + extras;
  }, [p, addOns, group]);

  if (isLoading) return <div className="mx-auto max-w-3xl px-4 py-10"><Loading /></div>;
  if (isError || !p) return <div className="mx-auto max-w-3xl px-4 py-10"><Note>We couldn&apos;t find that trek. <Link href={href('/packages')} className="font-semibold underline">See all treks</Link></Note></div>;

  if (done) return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-green-600" /><h1 className="mt-4 text-2xl font-extrabold text-neutral-900">Inquiry sent!</h1><p className="mt-2 text-neutral-600">Thanks {f.name.split(' ')[0]} — we&apos;ve received your request for <strong>{p.title}</strong>. The agency will review it and reply to <strong>{f.email}</strong>.</p><Link href={href('/packages')} className="mt-6 inline-block font-semibold underline">Back to treks</Link></div>
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!p) return;
    if (!departure) return setError('Choose a departure date.');
    if (!Number.isInteger(group) || group < 1 || (chosen && group > chosen.seatsLeft)) return setError(chosen ? `Group size must be between 1 and ${chosen.seatsLeft}.` : 'Choose a group size.');
    if (f.name.trim().length < 2) return setError('Enter your name.');
    if (!EMAIL_RE.test(f.email.trim())) return setError('Enter a valid email address.');
    if (!PHONE_RE.test(f.phone.trim())) return setError('Enter a valid phone number.');
    setBusy(true);
    try {
      const res = await post<{ sessionToken: string }>('/bookings/inquiry', {
        packageId: p.id, departureDateId: departure, groupSize: group,
        addOns: Object.entries(addOns).filter(([, q]) => q > 0).map(([addOnId, quantity]) => ({ addOnId, quantity })),
        trekkerName: f.name.trim(), trekkerEmail: f.email.trim(), trekkerPhone: f.phone.trim(),
        ...(f.country.trim() ? { trekkerCountry: f.country.trim() } : {}), ...(f.notes.trim() ? { specialRequests: f.notes.trim() } : {}), ...(f.coupon.trim() ? { couponCode: f.coupon.trim() } : {}),
      });
      setSession(res.sessionToken);
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(otp.trim())) return setError('Enter the 6-digit code we emailed you.');
    setBusy(true);
    try {
      await post('/bookings/inquiry/verify-otp', { sessionToken: session, otp: otp.trim() });
      setDone(true);
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href={href(`/packages/${p.slug}`)} className="text-sm text-neutral-500 hover:text-neutral-900">← {p.title}</Link>
      <h1 className="mt-2 text-3xl font-extrabold text-neutral-900">Book {p.title}</h1>
      {session ? (
        <form onSubmit={verify} noValidate className="mt-6 space-y-4 rounded-2xl border border-neutral-200 p-6">
          <p className="text-neutral-700">We emailed a 6-digit code to <strong>{f.email}</strong> to confirm it&apos;s you. It expires in 15 minutes.</p>
          <label className="block text-sm"><span className="mb-1 block font-semibold">Verification code</span><input id="bk-otp" inputMode="numeric" maxLength={6} className={field} value={otp} onChange={(e) => setOtp(e.target.value)} /></label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="rounded-xl px-5 py-2.5 font-semibold disabled:opacity-50" style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)' }}>{busy ? 'Confirming…' : 'Confirm inquiry'}</button>
        </form>
      ) : (
        <form onSubmit={submit} noValidate className="mt-6 space-y-5">
          <fieldset className="space-y-3 rounded-2xl border border-neutral-200 p-5">
            <legend className="px-1 text-sm font-bold">Your trek</legend>
            <label className="block text-sm"><span className="mb-1 block font-semibold">Departure</span><select id="bk-dep" className={field} value={departure} onChange={(e) => { setDeparture(e.target.value); setGroup(1); }}><option value="">Choose a date…</option>{p.departures.map((d) => <option key={d.id} value={d.id}>{fmt(d.startDate)} · {d.seatsLeft} seat{d.seatsLeft === 1 ? '' : 's'} left</option>)}</select></label>
            <label className="block text-sm"><span className="mb-1 block font-semibold">Group size</span><input id="bk-group" type="number" min={1} max={chosen?.seatsLeft ?? p.maxGroupSize} className={field} value={group} onChange={(e) => setGroup(Number(e.target.value))} /></label>
            {p.addOns.length > 0 && <div className="space-y-2"><p className="text-sm font-semibold">Extras</p>{p.addOns.map((a) => <label key={a.id} className="flex items-center justify-between gap-3 text-sm"><span>{a.name} <span className="text-neutral-500">— {money(a.price, p.currency)}{a.perPerson ? ' / person' : ''}</span></span><input aria-label={`${a.name} quantity`} type="number" min={0} max={20} className="w-20 rounded-lg border border-neutral-300 px-2 py-1" value={addOns[a.id] ?? 0} onChange={(e) => setAddOns((c) => ({ ...c, [a.id]: Math.max(0, Math.min(20, Number(e.target.value) || 0)) }))} /></label>)}</div>}
          </fieldset>
          <fieldset className="space-y-3 rounded-2xl border border-neutral-200 p-5">
            <legend className="px-1 text-sm font-bold">About you</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm"><span className="mb-1 block font-semibold">Full name</span><input id="bk-name" className={field} value={f.name} maxLength={100} onChange={set('name')} /></label>
              <label className="block text-sm"><span className="mb-1 block font-semibold">Email</span><input id="bk-email" type="email" className={field} value={f.email} onChange={set('email')} /></label>
              <label className="block text-sm"><span className="mb-1 block font-semibold">Phone / WhatsApp</span><input id="bk-phone" className={field} value={f.phone} onChange={set('phone')} /></label>
              <label className="block text-sm"><span className="mb-1 block font-semibold">Country (optional)</span><input id="bk-country" className={field} value={f.country} maxLength={60} onChange={set('country')} /></label>
            </div>
            <label className="block text-sm"><span className="mb-1 block font-semibold">Anything we should know? (optional)</span><textarea id="bk-notes" rows={3} className={field} value={f.notes} maxLength={1000} onChange={set('notes')} /></label>
            <label className="block text-sm sm:w-1/2"><span className="mb-1 block font-semibold">Coupon code (optional)</span><input id="bk-coupon" className={field} value={f.coupon} maxLength={40} onChange={set('coupon')} /></label>
          </fieldset>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-neutral-50 p-4"><p className="text-sm text-neutral-600">Estimated total <strong className="ml-1 text-xl text-neutral-900">{money(estimate, p.currency)}</strong><span className="ml-2 text-xs">(final price confirmed by the agency{f.coupon.trim() ? '; coupon applied on submit' : ''})</span></p></div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-xl px-5 py-3 font-semibold disabled:opacity-50" style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)' }}>{busy ? 'Sending…' : 'Send inquiry'}</button>
        </form>
      )}
    </div>
  );
}
