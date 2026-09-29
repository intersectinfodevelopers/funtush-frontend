'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Star } from 'lucide-react';
import { submitReview } from '@/lib/api/trekker';

const input = 'w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-4 focus:ring-neutral-100';

/** Public page behind the emailed review link — the invitation token is the only credential. */
function ReviewForm() {
  const token = useSearchParams().get('token') ?? '';
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) return <Shell><h1 className="text-2xl font-bold text-neutral-900">This review link is incomplete</h1><p className="mt-2 text-neutral-600">Open the link from your review invitation email.</p></Shell>;
  if (done) return <Shell><CheckCircle2 className="mx-auto h-12 w-12 text-green-600" /><h1 className="mt-3 text-2xl font-bold text-neutral-900">Thank you for your review!</h1><p className="mt-2 text-neutral-600">It helps other trekkers choose — and the agency learns what to keep doing.</p><Link href="/discovery" className="mt-4 inline-block font-semibold text-neutral-900 underline">Discover more treks</Link></Shell>;

  function addPhotos(list: FileList | null) {
    if (!list) return;
    const ok = Array.from(list).filter((f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) && f.size <= 10 * 1024 * 1024);
    if (ok.length < list.length) setError('Photos must be JPG, PNG or WebP under 10 MB.');
    setPhotos((c) => [...c, ...ok].slice(0, 5));
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating < 1) return setError('Choose a star rating.');
    if (text.trim().length < 3) return setError('Tell us a little about your trek.');
    setBusy(true);
    try { await submitReview({ token, rating, text: text.trim(), title: title.trim() || undefined, photos }); setDone(true); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold text-neutral-900">How was your trek?</h1>
      <form onSubmit={submit} noValidate className="mt-5 space-y-4 text-left">
        <div role="radiogroup" aria-label="Rating" className="flex justify-center gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n === 1 ? '' : 's'}`} onClick={() => setRating(n)} className="p-1"><Star className={`h-8 w-8 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} /></button>)}</div>
        <label className="block text-sm"><span className="mb-1 block font-semibold">Headline (optional)</span><input id="rv-title" className={input} value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="block text-sm"><span className="mb-1 block font-semibold">Your review</span><textarea id="rv-text" rows={5} className={input} value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} /></label>
        <label className="block text-sm"><span className="mb-1 block font-semibold">Photos (optional, up to 5)</span><input id="rv-photos" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }} className="text-sm" />{photos.length > 0 && <span className="text-xs text-neutral-500">{photos.length} selected</span>}</label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-xl bg-neutral-900 px-4 py-2.5 font-semibold text-white hover:bg-neutral-800 disabled:opacity-50">{busy ? 'Submitting…' : 'Submit review'}</button>
      </form>
    </Shell>
  );
}
const Shell = ({ children }: { children: React.ReactNode }) => <main className="grid min-h-screen place-items-center bg-neutral-50 p-4"><div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">{children}</div></main>;

export default function ReviewPage() {
  return <Suspense fallback={null}><ReviewForm /></Suspense>;
}
