"use client";

import {
  Field,
  SaveBar,
  SettingsHeader,
  SettingsSection,
  TextArea,
  TextInput,
  ToggleRow,
  useSettingsForm,
} from "@/components/agency/settings/settings-kit";

type EmailSettings = {
  senderName: string;
  fromAddress: string;
  replyTo: string;
  footerText: string;
  includeUnsubscribe: boolean;
  bccBookingsTo: string;
};

const DEFAULTS: EmailSettings = {
  senderName: "",
  fromAddress: "",
  replyTo: "",
  footerText: "Sent by your trekking agency via Funtush.",
  includeUnsubscribe: true,
  bccBookingsTo: "",
};

const emailOk = (v: string) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function EmailSettingsPage() {
  const { value, patch, dirty, save, reset } = useSettingsForm("emailSettings", DEFAULTS);

  const fromInvalid = !emailOk(value.fromAddress);
  const replyInvalid = !emailOk(value.replyTo);
  const bccInvalid = !emailOk(value.bccBookingsTo);

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Email"
        description="How transactional emails to trekkers appear — confirmations, payment links, reminders and reviews."
      />

      <SettingsSection title="Sender identity">
        <div className="space-y-4">
          <Field label="Sender name" hint="Shown as the 'from' name in inboxes." required>
            <TextInput
              value={value.senderName}
              onChange={(e) => patch({ senderName: e.target.value })}
              placeholder="Everest Trails Adventures"
            />
          </Field>
          <Field
            label="From address"
            hint="Needs domain verification before Funtush can send as this address."
            required
          >
            <TextInput
              type="email"
              value={value.fromAddress}
              onChange={(e) => patch({ fromAddress: e.target.value })}
              placeholder="bookings@everesttrails.com"
              className={fromInvalid ? "border-danger-300 focus:border-danger-400 focus:ring-danger-50" : ""}
            />
            {fromInvalid && (
              <p className="mt-1 text-xs font-medium text-danger-600">Enter a valid email address.</p>
            )}
          </Field>
          <Field label="Reply-to (optional)" hint="Replies from trekkers go here instead.">
            <TextInput
              type="email"
              value={value.replyTo}
              onChange={(e) => patch({ replyTo: e.target.value })}
              placeholder="support@everesttrails.com"
              className={replyInvalid ? "border-danger-300 focus:border-danger-400 focus:ring-danger-50" : ""}
            />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection title="Content">
        <div className="space-y-4">
          <Field label="Footer text" hint="Appears at the bottom of every email.">
            <TextArea
              rows={3}
              value={value.footerText}
              onChange={(e) => patch({ footerText: e.target.value })}
            />
          </Field>
          <ToggleRow
            label="Include an unsubscribe link"
            description="Required for marketing emails in most regions. Transactional emails are exempt."
            checked={value.includeUnsubscribe}
            onChange={(v) => patch({ includeUnsubscribe: v })}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Internal copies">
        <Field
          label="BCC booking emails to (optional)"
          hint="Get a silent copy of every booking confirmation and payment link."
        >
          <TextInput
            type="email"
            value={value.bccBookingsTo}
            onChange={(e) => patch({ bccBookingsTo: e.target.value })}
            placeholder="ops@everesttrails.com"
            className={bccInvalid ? "border-danger-300 focus:border-danger-400 focus:ring-danger-50" : ""}
          />
        </Field>
      </SettingsSection>

      <SaveBar
        dirty={dirty && !fromInvalid && !replyInvalid && !bccInvalid}
        onSave={save}
        onReset={reset}
      />
    </div>
  );
}
