'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  LifeBuoy,
  Mail,
  MessageCircle,
  BookOpen,
  Clock,
  Megaphone,
} from 'lucide-react';

interface BugReport {
  id: string;
  title: string;
  status: 'Submitted' | 'Under Review' | 'Fixed' | 'Closed';
  date: string;
  notes?: string;
}

const announcements = [
  'Scheduled API patch: core gateways undergo minor routing updates Saturday at 02:00 UTC.',
  'Pro tip: attach the full network response when reporting a mapping error — it gets triaged faster.',
];

const initialReports: BugReport[] = [
  {
    id: 'BUG-104',
    title: 'Map markers failing to render on mobile Safari',
    status: 'Under Review',
    date: '2026-06-24',
    notes: 'Engineering is looking into a WebKit rendering inconsistency.',
  },
  {
    id: 'BUG-089',
    title: 'Dashboard summary cards flash an empty layout while loading',
    status: 'Fixed',
    date: '2026-06-19',
    notes: 'Resolved with a fallback transition patch.',
  },
];

const STATUS_STYLE: Record<BugReport['status'], string> = {
  Fixed: 'bg-success-50 text-success-700 border border-success-200',
  'Under Review': 'bg-warning-50 text-warning-700 border border-warning-200',
  Closed: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
  Submitted: 'bg-primary-50 text-primary-700 border border-primary-200',
};

const fieldClass =
  'w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-50';

export default function SupportPage() {
  const [reports, setReports] = useState<BugReport[]>(initialReports);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [steps, setSteps] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [errors, setErrors] = useState({ title: '', desc: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { title: '', desc: '' };
    if (!title.trim()) newErrors.title = 'Give your issue a short title.';
    if (!desc.trim()) newErrors.desc = 'Describe what happened.';

    if (newErrors.title || newErrors.desc) {
      setErrors(newErrors);
      toast.error('Fix the highlighted fields before submitting.');
      return;
    }

    setErrors({ title: '', desc: '' });
    const newBug: BugReport = {
      id: `BUG-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      status: 'Submitted',
      date: new Date().toISOString().split('T')[0],
      notes: 'Awaiting triage.',
    };
    setReports([newBug, ...reports]);
    setTitle('');
    setDesc('');
    setSteps('');
    setScreenshot(null);
    toast.success('Report submitted — we’ll follow up here.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Support</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Get help, report a bug, or reach the Funtush team directly.
        </p>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            <Megaphone className="h-3.5 w-3.5" />
            Announcements
          </div>
          <ul className="space-y-1.5">
            {announcements.map((text) => (
              <li key={text} className="text-sm text-neutral-600">
                {text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contact & resources */}
      <div className="grid gap-4 sm:grid-cols-3">
        <ContactCard
          icon={<Mail className="h-5 w-5" />}
          title="Email support"
          description="support@funtush.com"
          href="mailto:support@funtush.com"
        />
        <ContactCard
          icon={<MessageCircle className="h-5 w-5" />}
          title="Live chat"
          description="Mon–Fri, 9am–6pm NPT"
          href="#"
        />
        <ContactCard
          icon={<BookOpen className="h-5 w-5" />}
          title="Help center & docs"
          description="Guides, FAQs, API reference"
          href="#"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bug report form */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="border-b border-neutral-100 pb-3 text-base font-bold text-neutral-900">
            Report a bug
          </h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                Issue title <span className="text-danger-600">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
                placeholder="e.g., Live tracking map not updating on mobile"
                className={`${fieldClass} ${errors.title ? 'border-danger-300 focus:border-danger-400 focus:ring-danger-50' : ''}`}
              />
              {errors.title && <p className="mt-1 text-xs font-medium text-danger-600">{errors.title}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                Detailed description <span className="text-danger-600">*</span>
              </label>
              <textarea
                rows={3}
                value={desc}
                onChange={(e) => {
                  setDesc(e.target.value);
                  if (errors.desc) setErrors((prev) => ({ ...prev, desc: '' }));
                }}
                placeholder="What happened, what you expected, and any relevant details."
                className={`${fieldClass} ${errors.desc ? 'border-danger-300 focus:border-danger-400 focus:ring-danger-50' : ''}`}
              />
              {errors.desc && <p className="mt-1 text-xs font-medium text-danger-600">{errors.desc}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                Steps to reproduce
              </label>
              <textarea
                rows={2}
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder={'1. Open the live tracking map\n2. Select an active trek\n3. Wait for a position update'}
                className={`${fieldClass} font-mono`}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                Attach a screenshot
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  className="block text-xs text-neutral-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-700 hover:file:bg-primary-100"
                />
                {screenshot && (
                  <span className="truncate text-xs font-mono text-neutral-400">{screenshot.name}</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              Submit report
            </button>
          </form>
        </div>

        {/* Ticket list */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-neutral-900">Your reports</h2>

          {reports.length === 0 ? (
            <div className="space-y-3 px-2 py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <LifeBuoy className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-neutral-700">No reports yet</p>
              <p className="text-xs leading-relaxed text-neutral-400">
                Use the form to log your first bug report.
              </p>
            </div>
          ) : (
            <div className="max-h-125 space-y-3 overflow-y-auto pr-1">
              {reports.map((report) => (
                <div key={report.id} className="space-y-2 rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold leading-tight text-neutral-800">{report.title}</h3>
                    <span
                      className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${STATUS_STYLE[report.status]}`}
                    >
                      {report.status}
                    </span>
                  </div>
                  {report.notes && (
                    <p className="rounded-lg border border-neutral-200 bg-white p-2 text-[11px] leading-relaxed text-neutral-500">
                      <span className="mb-0.5 block text-[10px] font-semibold uppercase text-neutral-400">
                        Funtush team note
                      </span>
                      {report.notes}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1 text-[10px] font-medium text-neutral-400">
                    <span>{report.id}</span>
                    <span>{report.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            Typical first response: under 4 business hours.
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
    >
      <span className="rounded-xl bg-primary-50 p-2.5 text-primary-700">{icon}</span>
      <span>
        <span className="block text-sm font-semibold text-neutral-900">{title}</span>
        <span className="mt-0.5 block text-xs text-neutral-500">{description}</span>
      </span>
    </a>
  );
}
