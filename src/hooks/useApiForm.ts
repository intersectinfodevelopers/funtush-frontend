'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSettingsToast } from '@/components/agency/settings/settings-kit';
import type { ApiError } from '@/lib/api/client';

/**
 * Form state over server data. `value` is the server copy with the user's edits laid over it, `dirty` is true only
 * when an edit actually differs from the server, and `submit` sends just the changed keys.
 */
export function useApiForm<T extends object>(server: T | undefined, save: (changed: Partial<T>) => Promise<unknown>, onSaved?: () => void) {
  const toast = useSettingsToast();
  const [draft, setDraft] = useState<Partial<T>>({});
  const [error, setError] = useState<string | null>(null);

  const value = useMemo(() => (server ? { ...server, ...draft } : undefined), [server, draft]);
  const changed = useMemo(() => {
    if (!server) return {} as Partial<T>;
    const out: Partial<T> = {};
    for (const k of Object.keys(draft) as (keyof T)[]) if (draft[k] !== server[k]) out[k] = draft[k];
    return out;
  }, [server, draft]);
  const dirty = Object.keys(changed).length > 0;

  const patch = useCallback((next: Partial<T>) => { setError(null); setDraft((d) => ({ ...d, ...next })); }, []);
  const reset = useCallback(() => { setDraft({}); setError(null); }, []);
  const mutation = useMutation({
    mutationFn: () => save(changed),
    onSuccess: () => { setDraft({}); setError(null); toast(); onSaved?.(); },
    onError: (e) => setError((e as unknown as ApiError).message || "Couldn't save your changes."),
  });

  return { value, patch, reset, dirty, saving: mutation.isPending, error, setError, submit: () => mutation.mutate() };
}
