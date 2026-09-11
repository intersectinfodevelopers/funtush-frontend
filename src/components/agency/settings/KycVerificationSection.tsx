"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Clock, FileText, Upload, X, Download } from "lucide-react";
import {
  Field,
  SettingsSection,
  TextInput,
  useSettingsForm,
  useSettingsToast,
} from "@/components/agency/settings/settings-kit";

type KycStatus = "not_submitted" | "under_review" | "approved" | "rejected";

type KycDoc = { name: string; dataUrl: string };

type Kyc = {
  status: KycStatus;
  registeredBusinessName: string;
  registeredAddress: string;
  businessPhoneNumber: string;
  panNumber: string;
  bankName: string;
  accountNumber: string;
  bankAccountName: string;
  bankAccountBranch: string;
  documents: KycDoc[];
  agreementDocument: KycDoc | null;
};

const DEFAULTS: Kyc = {
  status: "not_submitted",
  registeredBusinessName: "",
  registeredAddress: "",
  businessPhoneNumber: "",
  panNumber: "",
  bankName: "",
  accountNumber: "",
  bankAccountName: "",
  bankAccountBranch: "",
  documents: [],
  agreementDocument: null,
};

const STATUS_COPY: Record<KycStatus, { label: string; hint: string; tone: string; icon: typeof ShieldCheck }> = {
  not_submitted: {
    label: "KYC Verification Request Not Submitted",
    hint: 'Verify your KYC status and enjoy uninterrupted payment services — fill in and submit the information below to get verified.',
    tone: "border-warning-200 bg-warning-50 text-warning-800",
    icon: ShieldAlert,
  },
  under_review: {
    label: "KYC Verification Under Review",
    hint: "Our team is reviewing your documents. This usually takes 1–2 business days.",
    tone: "border-primary-200 bg-primary-50 text-primary-800",
    icon: Clock,
  },
  approved: {
    label: "KYC Verified",
    hint: "Your agency is verified. Payments and payouts are fully enabled.",
    tone: "border-success-200 bg-success-50 text-success-800",
    icon: ShieldCheck,
  },
  rejected: {
    label: "KYC Verification Rejected",
    hint: "One or more documents couldn't be verified. Update the details below and resubmit.",
    tone: "border-danger-200 bg-danger-50 text-danger-800",
    icon: ShieldAlert,
  },
};

const MAX_FILE_BYTES = 3 * 1024 * 1024;

function readFile(file: File, onDone: (doc: KycDoc) => void, onError: (msg: string) => void) {
  if (file.size > MAX_FILE_BYTES) {
    onError("File is too large — please use one under 3 MB.");
    return;
  }
  const reader = new FileReader();
  reader.onerror = () => onError("Could not read that file. Please try again.");
  reader.onload = (e) => {
    const result = e.target?.result;
    if (typeof result === "string") onDone({ name: file.name, dataUrl: result });
  };
  reader.readAsDataURL(file);
}

export function KycVerificationSection() {
  const { value, patch } = useSettingsForm<Kyc>("kycVerification", DEFAULTS);
  const [error, setError] = useState<string | null>(null);
  const toast = useSettingsToast();

  const status = STATUS_COPY[value.status];
  const StatusIcon = status.icon;

  const requiredFilled =
    value.registeredBusinessName.trim() &&
    value.registeredAddress.trim() &&
    value.businessPhoneNumber.trim() &&
    value.panNumber.trim() &&
    value.bankName.trim() &&
    value.accountNumber.trim() &&
    value.bankAccountName.trim() &&
    value.bankAccountBranch.trim();

  const canSubmit = Boolean(requiredFilled) && value.documents.length > 0 && value.agreementDocument !== null;

  const submit = () => {
    if (!canSubmit) {
      setError("Fill in every field and attach your documents before submitting.");
      return;
    }
    setError(null);
    // `save()` would close over this render's (pre-patch) `value` — write the
    // merged object directly instead of racing patch()+save() across renders.
    const next: Kyc = { ...value, status: "under_review" };
    patch({ status: "under_review" });
    try {
      localStorage.setItem("kycVerification", JSON.stringify(next));
    } catch {
      /* ignore */
    }
    toast("KYC verification submitted — we'll review it within 1–2 business days.");
  };

  return (
    <SettingsSection title="KYC Verification">
      <div className={`mb-5 flex items-start gap-3 rounded-xl border p-4 ${status.tone}`}>
        <StatusIcon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-bold">{status.label}</p>
          <p className="mt-0.5 text-sm">{status.hint}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <h3 className="mb-3 text-sm font-bold text-neutral-900">Business Registration Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Registered Business Name" required>
              <TextInput
                value={value.registeredBusinessName}
                onChange={(e) => patch({ registeredBusinessName: e.target.value })}
                placeholder="eg: Everest Trails Pvt. Ltd."
                disabled={value.status === "under_review"}
              />
            </Field>
            <Field label="Registered Address" required>
              <TextInput
                value={value.registeredAddress}
                onChange={(e) => patch({ registeredAddress: e.target.value })}
                placeholder="eg: Thamel - 26, Kathmandu"
                disabled={value.status === "under_review"}
              />
            </Field>
            <Field label="Business Phone Number" required>
              <TextInput
                value={value.businessPhoneNumber}
                onChange={(e) => patch({ businessPhoneNumber: e.target.value })}
                placeholder="eg: +9779800000000"
                disabled={value.status === "under_review"}
              />
            </Field>
            <Field label="PAN Number" required>
              <TextInput
                value={value.panNumber}
                onChange={(e) => patch({ panNumber: e.target.value })}
                placeholder="eg: 123456789"
                disabled={value.status === "under_review"}
              />
            </Field>
            <Field label="Bank Name (Business Account)" required>
              <TextInput
                value={value.bankName}
                onChange={(e) => patch({ bankName: e.target.value })}
                placeholder="eg: NIC ASIA BANK"
                disabled={value.status === "under_review"}
              />
            </Field>
            <Field label="Account Number (Business Account)" required>
              <TextInput
                value={value.accountNumber}
                onChange={(e) => patch({ accountNumber: e.target.value })}
                placeholder="eg: 123456789"
                disabled={value.status === "under_review"}
              />
            </Field>
            <Field label="Bank Account Name (Business Account)" required>
              <TextInput
                value={value.bankAccountName}
                onChange={(e) => patch({ bankAccountName: e.target.value })}
                placeholder="eg: Everest Trails Pvt. Ltd."
                disabled={value.status === "under_review"}
              />
            </Field>
            <Field label="Bank Account Branch" required>
              <TextInput
                value={value.bankAccountBranch}
                onChange={(e) => patch({ bankAccountBranch: e.target.value })}
                placeholder="eg: Thapathali, Kathmandu"
                disabled={value.status === "under_review"}
              />
            </Field>
          </div>
        </div>

        <div>
          <h3 className="mb-1 text-sm font-bold text-neutral-900">Registration Documents</h3>
          <p className="mb-3 text-xs text-neutral-500">Registration certificate & PAN photo are required.</p>

          {value.documents.length === 0 ? (
            <p className="text-sm text-neutral-400">No documents added</p>
          ) : (
            <ul className="mb-3 space-y-2">
              {value.documents.map((doc, i) => (
                <li
                  key={doc.name + i}
                  className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2"
                >
                  <span className="flex items-center gap-2 truncate text-sm text-neutral-700">
                    <FileText className="h-4 w-4 shrink-0 text-neutral-400" />
                    <span className="truncate">{doc.name}</span>
                  </span>
                  {value.status !== "under_review" && (
                    <button
                      type="button"
                      onClick={() => patch({ documents: value.documents.filter((_, x) => x !== i) })}
                      className="text-neutral-400 hover:text-danger-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {value.status !== "under_review" && (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              <Upload className="h-4 w-4" />
              Add document
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) readFile(file, (doc) => patch({ documents: [...value.documents, doc] }), setError);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>

        <div>
          <h3 className="mb-1 text-sm font-bold text-neutral-900">Agreement Document</h3>
          <p className="mb-3 flex items-center gap-1.5 text-xs text-neutral-500">
            Download the agreement, sign it, and upload it here.
            <button
              type="button"
              onClick={() => toast("Agreement template downloaded (mock)")}
              className="inline-flex items-center gap-1 font-medium text-primary-600 hover:underline"
            >
              <Download className="h-3 w-3" /> Download template
            </button>
          </p>

          {value.agreementDocument ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
              <span className="flex items-center gap-2 truncate text-sm text-neutral-700">
                <FileText className="h-4 w-4 shrink-0 text-neutral-400" />
                <span className="truncate">{value.agreementDocument.name}</span>
              </span>
              {value.status !== "under_review" && (
                <button
                  type="button"
                  onClick={() => patch({ agreementDocument: null })}
                  className="text-neutral-400 hover:text-danger-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : value.status === "under_review" ? (
            <p className="text-sm text-neutral-400">Agreement submitted</p>
          ) : (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              <Upload className="h-4 w-4" />
              Upload signed agreement
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) readFile(file, (doc) => patch({ agreementDocument: doc }), setError);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>

        {value.status !== "under_review" && value.status !== "approved" && (
          <div className="flex justify-end border-t border-neutral-200 pt-4">
            <button
              type="button"
              onClick={submit}
              className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
            >
              Submit for Verification
            </button>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
