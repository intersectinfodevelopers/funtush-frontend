'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useTrekPackage } from '@/hooks/useTrekker';

const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const STATUS: Record<string, string> = { INQUIRY: 'Awaiting the agency', ALTERNATIVE_PROPOSED: 'New date proposed', CONFIRMED: 'Confirmed', PAYMENT_PENDING: 'Payment due', PAID: 'Paid', ACTIVE: 'On the trail', COMPLETED: 'Completed' };

export default function TrekDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: t, isLoading, isError } = useTrekPackage(id);
  if (isLoading) return <div className="h-48 animate-pulse rounded-2xl bg-white" />;
  if (isError || !t) return <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm">We couldn&apos;t find that trek. <Link href="/my-treks" className="font-semibold text-primary-700 hover:underline">Back to my treks</Link></div>;
  const items = t.packingList.map((p) => p.name ?? p.item ?? p.label ?? '').filter(Boolean);
  const numbers = t.emergency.contacts.map((c) => ({ label: c.label ?? c.name ?? 'Emergency', number: c.number ?? c.phone ?? '' })).filter((c) => c.number);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/my-treks" className="text-sm text-neutral-500 hover:text-neutral-900">← My treks</Link>
      <header className="space-y-1"><h1 className="text-2xl font-bold text-neutral-900">{t.trek.title}</h1><p className="text-sm text-neutral-600">{fmt(t.trek.startDate)} – {fmt(t.trek.endDate)} · {t.trek.durationDays} days · {t.booking.groupSize} {t.booking.groupSize === 1 ? 'person' : 'people'}</p><span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{STATUS[t.status] ?? t.status}</span></header>

      <section aria-label="Agency" className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-5"><h2 className="font-bold text-neutral-900">{t.agency.name}</h2>
        {t.agency.address && <p className="flex items-center gap-2 text-sm text-neutral-600"><MapPin className="h-4 w-4 text-neutral-400" />{t.agency.address}</p>}
        {t.agency.phones.map((p) => <p key={p} className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-neutral-400" /><a href={`tel:${p.replace(/\s/g, '')}`} className="hover:underline">{p}</a></p>)}
        {t.agency.emails.map((e) => <p key={e} className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-neutral-400" /><a href={`mailto:${e}`} className="hover:underline">{e}</a></p>)}
        {t.agency.phones.length + t.agency.emails.length === 0 && !t.agency.address && <p className="text-sm text-neutral-500">The agency hasn&apos;t published contact details.</p>}
      </section>
      {t.guide?.name && <section aria-label="Guide" className="rounded-2xl border border-neutral-200 bg-white p-5"><h2 className="font-bold text-neutral-900">Your guide</h2><p className="text-sm text-neutral-700">{t.guide.name}{t.guide.phone ? ` · ${t.guide.phone}` : ''}</p></section>}
      {t.itinerary.length > 0 && <section aria-label="Itinerary" className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5"><h2 className="font-bold text-neutral-900">Itinerary</h2><ol className="space-y-3">{t.itinerary.map((d) => <li key={d.dayNumber} className="text-sm"><p className="font-semibold text-neutral-900">Day {d.dayNumber}{d.location ? ` — ${d.location}` : ''}{d.altitudeM ? <span className="ml-2 text-xs font-normal text-neutral-500">{d.altitudeM.toLocaleString()} m</span> : null}</p>{d.description && <p className="text-neutral-600">{d.description}</p>}</li>)}</ol></section>}
      {items.length > 0 && <section aria-label="Packing list" className="rounded-2xl border border-neutral-200 bg-white p-5"><h2 className="mb-2 font-bold text-neutral-900">Packing list</h2><ul className="grid list-disc gap-x-8 pl-5 text-sm text-neutral-700 sm:grid-cols-2">{items.map((i) => <li key={i}>{i}</li>)}</ul></section>}
      {numbers.length > 0 && <section aria-label="Emergency numbers" className="rounded-2xl border border-danger-200 bg-danger-50 p-5"><h2 className="mb-2 font-bold text-danger-800">Emergency numbers</h2><ul className="space-y-1 text-sm">{numbers.map((n) => <li key={n.label + n.number} className="flex justify-between"><span>{n.label}</span><a href={`tel:${n.number}`} className="font-semibold text-danger-700">{n.number}</a></li>)}</ul></section>}
      <p className="text-xs text-neutral-500">Live trek tracking and SOS are in the Funtush mobile app.</p>
    </div>
  );
}
