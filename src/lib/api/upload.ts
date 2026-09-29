import { api } from './client';

const MAX_BYTES = 10 * 1024 * 1024; // matches the API's multer limit
const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

/** Client-side pre-check so the user gets a clear message before a 10 MB upload; the API re-checks the real file bytes. */
export function validateUpload(file: File, { pdf = false, maxMb = 10 }: { pdf?: boolean; maxMb?: number } = {}): string | null {
  const allowed = pdf ? ALLOWED : ALLOWED.filter((t) => t !== 'application/pdf');
  if (!allowed.includes(file.type)) return pdf ? 'Choose a JPG, JPEG, PNG, WebP, GIF or PDF file.' : 'Choose a JPG, JPEG, PNG, WebP or GIF image.';
  if (file.size >= Math.min(MAX_BYTES, maxMb * 1024 * 1024)) return maxMb < 10 ? `Photos must be smaller than ${maxMb} MB.` : 'That file is larger than 10 MB.';
  return null;
}

/** POST /upload → the CDN URL. The API stores it under this user's own prefix. */
export async function uploadFile(file: File, { maxMb }: { maxMb?: number } = {}): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.upload<{ url: string }>(maxMb ? `/upload?maxMb=${maxMb}` : '/upload', form);
  return res.url;
}
