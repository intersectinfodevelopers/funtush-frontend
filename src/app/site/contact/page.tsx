'use client';

import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { PageFrame } from '@/components/site/PageFrame';
import { useSite } from '@/lib/site/SiteContext';

export default function ContactPage() {
  const { about, social } = useSite();
  const any = about.address || about.phones.length || about.emails.length || social.whatsappLink;
  return (
    <PageFrame title="Contact us" subtitle="We usually reply within a day.">
      {!any ? <p className="text-neutral-500">Contact details are coming soon.</p> : (
        <ul className="max-w-md space-y-4">
          {about.address && <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 text-neutral-400" /> <span>{about.address}</span></li>}
          {about.phones.map((p) => <li key={p} className="flex items-center gap-3"><Phone className="h-5 w-5 text-neutral-400" /> <a href={`tel:${p.replace(/\s/g, '')}`} className="hover:underline">{p}</a></li>)}
          {about.emails.map((e) => <li key={e} className="flex items-center gap-3"><Mail className="h-5 w-5 text-neutral-400" /> <a href={`mailto:${e}`} className="hover:underline">{e}</a></li>)}
          {social.whatsappLink && <li className="flex items-center gap-3"><MessageCircle className="h-5 w-5 text-neutral-400" /> <a href={social.whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:underline">Message us on WhatsApp</a></li>}
        </ul>
      )}
    </PageFrame>
  );
}
