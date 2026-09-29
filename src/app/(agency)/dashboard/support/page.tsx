'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';

import FileUploadField from '@/components/ui/FileUploadField';
import { Pagination } from '@/components/ui/pagination';
import { settingsKeys, useBugReports } from '@/hooks/useAgencySettings';
import { submitBugReport, type BugReport, type BugStatus } from '@/lib/api/agency/settings';
import type { ApiError } from '@/lib/api/client';

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@funtush.com';
const LABEL: Record<BugStatus, string> = { REPORTED: 'Submitted', IN_PROGRESS: 'In progress', RESOLVED: 'Resolved' };
const STYLE: Record<BugStatus, string> = {
  REPORTED: 'bg-primary-50 text-primary-700 border border-primary-200',
  IN_PROGRESS: 'bg-warning-50 text-warning-700 border border-warning-200',
  RESOLVED: 'bg-success-50 text-success-700 border border-success-200',
};
const field = 'w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-50';

export default function SupportPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const reports = useBugReports(page);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [steps, setSteps] = useState('');
  const [shot, setShot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: () => submitBugReport({ title: title.trim(), description: desc.trim(), stepsToReproduce: steps.trim() || undefined, screenshotUrl: shot ?? undefined }),
    onSuccess: () => { setTitle(''); setDesc(''); setSteps(''); setShot(null); setError(null); setPage(1); toast.success('Report submitted — we’ll follow up here.'); void qc.invalidateQueries({ queryKey: [...settingsKeys.all, 'bugs'] }); },
    onError: (e) => setError((e as unknown as ApiError).message || "Couldn't submit your report."),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError('Give your issue a short title.');
    if (title.trim().length > 150) return setError('Keep the title under 150 characters.');
    if (!desc.trim()) return setError('Describe what happened.');
    submit.mutate();
  }

  const items: BugReport[] = reports.data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((reports.data?.total ?? 0) / 20));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Support</h1>
        <p className="mt-1 text-sm text-neutral-600">Report a bug or reach the Funtush team directly.</p>
      </div>

      <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 hover:bg-neutral-50">
        <span className="rounded-xl bg-primary-50 p-2 text-primary-700"><Mail className="h-5 w-5" /></span>
        <span><span className="block text-sm font-bold text-neutral-900">Email support</span><span className="text-sm text-neutral-600">{SUPPORT_EMAIL}</span></span>
      </a>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="border-b border-neutral-100 pb-3 text-base font-bold text-neutral-900">Report a bug</h2>
          <label className="block text-sm"><span className="mb-1.5 block font-semibold text-neutral-700">Title</span><input aria-label="Title" className={field} value={title} maxLength={150} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Live tracking map not updating on mobile" /></label>
          <label className="block text-sm"><span className="mb-1.5 block font-semibold text-neutral-700">What happened?</span><textarea aria-label="Description" rows={4} className={field} value={desc} maxLength={5000} onChange={(e) => setDesc(e.target.value)} placeholder="What happened, what you expected, and any relevant details." /></label>
          <label className="block text-sm"><span className="mb-1.5 block font-semibold text-neutral-700">Steps to reproduce (optional)</span><textarea aria-label="Steps to reproduce" rows={3} className={field} value={steps} maxLength={5000} onChange={(e) => setSteps(e.target.value)} placeholder={'1. Open the live tracking map\n2. Select an active trek'} /></label>
          <FileUploadField label="Screenshot (optional)" value={shot} onChange={setShot} />
          {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
          <button type="submit" disabled={submit.isPending} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{submit.isPending ? 'Submitting…' : 'Submit report'}</button>
        </form>

        <section aria-label="Your reports" className="space-y-3">
          <h2 className="text-base font-bold text-neutral-900">Your reports</h2>
          {reports.isError && <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load your reports.</p>}
          {reports.isLoading && <div className="h-24 animate-pulse rounded-2xl border border-neutral-200 bg-white" />}
          {!reports.isLoading && items.length === 0 && <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-4 text-sm text-neutral-500">You haven&apos;t reported anything yet.</p>}
          {items.map((r) => (
            <article key={r.id} className="space-y-1.5 rounded-2xl border border-neutral-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2"><h3 className="text-sm font-bold leading-tight text-neutral-800">{r.title}</h3><span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${STYLE[r.status]}`}>{LABEL[r.status]}</span></div>
              <p className="text-xs text-neutral-500">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}{r.priority ? ` · ${r.priority.toLowerCase()} priority` : ''}</p>
              {r.resolutionNote && <p className="text-xs text-neutral-600">{r.resolutionNote}</p>}
            </article>
          ))}
          <Pagination currentPage={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} />
        </section>
      </div>
    </div>
  );
}
