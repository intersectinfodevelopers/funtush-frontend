'use client';

import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadFile, validateUpload } from '@/lib/api/upload';
import type { ApiError } from '@/lib/api/client';

/** Uploads to the API and reports the resulting URL. Shows an image preview when the value looks like an image. */
export default function FileUploadField({
  value,
  onChange,
  label,
  pdf = false,
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  label: string;
  pdf?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    const problem = validateUpload(file, { pdf });
    if (problem) return setError(problem);
    setError(null);
    setBusy(true);
    try {
      onChange(await uploadFile(file));
    } catch (e) {
      setError((e as ApiError).message || 'Upload failed. Try again.');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  const isImage = value && /\.(jpe?g|png|webp)(\?|$)/i.test(value);
  return (
    <div>
      <p className="text-sm font-medium text-neutral-700">{label}</p>
      <div className="mt-1 flex items-center gap-3">
        {isImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value!} alt="" className="h-14 w-14 rounded-lg object-cover" />
        )}
        {value && !isImage && <a href={value} target="_blank" rel="noreferrer" className="max-w-[12rem] truncate text-sm text-primary-700 hover:underline">View file</a>}
        <input ref={input} type="file" accept={pdf ? 'image/jpeg,image/png,image/webp,image/gif,application/pdf' : 'image/jpeg,image/png,image/webp,image/gif'} className="sr-only" aria-label={label} onChange={(e) => void pick(e.target.files?.[0])} />
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-50">
          <Upload className="h-4 w-4" /> {busy ? 'Uploading…' : value ? 'Replace' : 'Upload'}
        </button>
        {value && !busy && <button type="button" aria-label={`Remove ${label}`} onClick={() => onChange(null)} className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100"><X className="h-4 w-4" /></button>}
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  );
}
