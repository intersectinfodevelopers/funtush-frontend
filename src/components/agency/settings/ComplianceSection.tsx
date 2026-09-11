"use client";

import {
  Field,
  SaveBar,
  SettingsSection,
  TextInput,
  useSettingsForm,
} from "@/components/agency/settings/settings-kit";

type Compliance = {
  showOnWebsite: boolean;
  registeredBusinessName: string;
  email: string;
  panVatNumber: string;
  companyAddress: string;
  registrationNumber: string;
  contactNumber: string;
  /** Trekking-operator permit / license number — required in Nepal for
   * agencies leading treks in restricted or conservation areas. */
  licenseNumber: string;
  complaintOfficer: string;
};

const DEFAULTS: Compliance = {
  showOnWebsite: false,
  registeredBusinessName: "",
  email: "",
  panVatNumber: "",
  companyAddress: "",
  registrationNumber: "",
  contactNumber: "",
  licenseNumber: "",
  complaintOfficer: "",
};

export function ComplianceSection() {
  const { value, patch, dirty, save, reset } = useSettingsForm<Compliance>(
    "complianceSettings",
    DEFAULTS,
  );

  return (
    <SettingsSection
      title="Compliance Information"
      description="Legal and registration details. Shown on your public site's footer when enabled."
      action={
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          Show in website
          <button
            type="button"
            role="switch"
            aria-checked={value.showOnWebsite}
            onClick={() => patch({ showOnWebsite: !value.showOnWebsite })}
            className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition ${
              value.showOnWebsite ? "bg-primary-600" : "bg-neutral-300"
            }`}
          >
            <span
              className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                value.showOnWebsite ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </label>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Registered Business Name">
          <TextInput
            value={value.registeredBusinessName}
            onChange={(e) => patch({ registeredBusinessName: e.target.value })}
            placeholder="eg: Everest Trails Pvt. Ltd."
          />
        </Field>
        <Field label="Email">
          <TextInput
            type="email"
            value={value.email}
            onChange={(e) => patch({ email: e.target.value })}
            placeholder="eg: legal@everesttrails.com"
          />
        </Field>
        <Field label="PAN/VAT Number">
          <TextInput
            value={value.panVatNumber}
            onChange={(e) => patch({ panVatNumber: e.target.value })}
            placeholder="eg: 123456789"
          />
        </Field>
        <Field label="Company Address">
          <TextInput
            value={value.companyAddress}
            onChange={(e) => patch({ companyAddress: e.target.value })}
            placeholder="eg: Thamel - 26, Kathmandu"
          />
        </Field>
        <Field label="Registration Number">
          <TextInput
            value={value.registrationNumber}
            onChange={(e) => patch({ registrationNumber: e.target.value })}
            placeholder="eg: 987654"
          />
        </Field>
        <Field label="Contact Number">
          <TextInput
            value={value.contactNumber}
            onChange={(e) => patch({ contactNumber: e.target.value })}
            placeholder="eg: +9779800000000"
          />
        </Field>
        <Field label="Trekking Operator License No." hint="Issued by the Department of Tourism / NTB.">
          <TextInput
            value={value.licenseNumber}
            onChange={(e) => patch({ licenseNumber: e.target.value })}
            placeholder="eg: TAAN-1234"
          />
        </Field>
        <Field label="Complaint Officer">
          <TextInput
            value={value.complaintOfficer}
            onChange={(e) => patch({ complaintOfficer: e.target.value })}
            placeholder="eg: John Sherpa"
          />
        </Field>
      </div>

      <SaveBar dirty={dirty} onSave={save} onReset={reset} />
    </SettingsSection>
  );
}
