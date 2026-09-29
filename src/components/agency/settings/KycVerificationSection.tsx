"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { settingsKeys, useKyc } from "@/hooks/useAgencySettings";
import { KYC_DOCS, submitKyc } from "@/lib/api/agency/settings";
import type { ApiError } from "@/lib/api/client";

const MAX_BYTES = 10 * 1024 * 1024;
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
type Field = (typeof KYC_DOCS)[number]["field"];

export function KycVerificationSection() {
  const qc = useQueryClient();
  const { data: kyc, isLoading, isError } = useKyc();
  const [files, setFiles] = useState<Partial<Record<Field, File>>>({});
  const [error, setError] = useState<string | null>(null);
  const submit = useMutation({
    mutationFn: () => submitKyc(files as Record<Field, File>),
    onSuccess: () => { setFiles({}); setError(null); void qc.invalidateQueries({ queryKey: [...settingsKeys.all, "kyc"] }); },
    onError: (e) => setError((e as unknown as ApiError).message || "Couldn't submit your documents."),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-2xl border border-neutral-200 bg-white" />;
  if (isError) return <p role="alert" className="text-sm text-danger-600">Couldn&apos;t load your verification status.</p>;
  const status = kyc?.status ?? null;
  const canSubmit = status === null || status === "REJECTED";

  function pick(field: Field, f: File | undefined) {
    if (!f) return;
    if (!OK_TYPES.includes(f.type)) return setError("Documents must be a JPG, PNG, WebP or PDF file.");
    if (f.size > MAX_BYTES) return setError("Each document must be under 10 MB.");
    setError(null);
    setFiles((c) => ({ ...c, [field]: f }));
  }
  function go() {
    const missing = KYC_DOCS.find((d) => !files[d.field]);
    if (missing) return setError(`Add your ${missing.label.toLowerCase()} document.`);
    setError(null);
    submit.mutate();
  }

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm" aria-label="Verification">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="text-lg font-bold text-neutral-900">Business verification (KYC)</h3><p className="text-sm text-neutral-500">Verified agencies can receive payouts and appear as trusted in the marketplace.</p></div>
        {status === "APPROVED" && <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-3 py-1 text-xs font-bold text-success-700"><CheckCircle2 className="h-4 w-4" /> Approved</span>}
        {(status === "SUBMITTED" || status === "UNDER_REVIEW") && <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-3 py-1 text-xs font-bold text-warning-700"><Clock className="h-4 w-4" /> {status === "SUBMITTED" ? "Submitted — awaiting review" : "Under review"}</span>}
        {status === "REJECTED" && <span className="inline-flex items-center gap-1 rounded-full bg-danger-50 px-3 py-1 text-xs font-bold text-danger-700"><ShieldAlert className="h-4 w-4" /> Rejected</span>}
      </div>
      {status === "REJECTED" && kyc?.rejectionReason && <p role="alert" className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">Reason: {kyc.rejectionReason}. Fix this and submit again.</p>}
      {canSubmit ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {KYC_DOCS.map((d) => (
              <label key={d.field} className="block text-sm"><span className="mb-1 block font-semibold text-neutral-700">{d.label}</span>
                <input type="file" aria-label={d.label} accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => { pick(d.field, e.target.files?.[0]); e.target.value = ""; }} className="text-sm" />
                {files[d.field] && <span className="text-xs text-success-700">{files[d.field]!.name}</span>}
              </label>
            ))}
          </div>
          {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
          <button type="button" onClick={go} disabled={submit.isPending} className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">{submit.isPending ? "Uploading…" : "Submit for verification"}</button>
        </div>
      ) : <p className="text-sm text-neutral-600">{status === "APPROVED" ? "Your documents are verified." : "We'll email you when the review is done."}</p>}
    </section>
  );
}
