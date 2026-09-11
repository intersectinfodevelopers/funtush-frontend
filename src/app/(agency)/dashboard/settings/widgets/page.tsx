"use client";

import {
  Field,
  SaveBar,
  SettingsHeader,
  SettingsSection,
  TextInput,
  ToggleRow,
  useSettingsForm,
} from "@/components/agency/settings/settings-kit";

type Widgets = {
  whatsappEnabled: boolean;
  whatsappNumber: string;
  googleMapsEnabled: boolean;
  googleMapsApiKey: string;
  currencyConverterEnabled: boolean;
  weatherEnabled: boolean;
};

const DEFAULTS: Widgets = {
  whatsappEnabled: false,
  whatsappNumber: "",
  googleMapsEnabled: true,
  googleMapsApiKey: "",
  currencyConverterEnabled: false,
  weatherEnabled: false,
};

export default function WidgetsSettingsPage() {
  const { value, patch, dirty, save, reset } = useSettingsForm("widgetSettings", DEFAULTS);

  const mapsMissingKey = value.googleMapsEnabled && value.googleMapsApiKey.trim().length === 0;

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Widgets"
        description="Optional tools shown across your white-label site."
      />

      <SettingsSection
        title="Contact"
        description="The most direct, highest-converting way for a trekker to reach you."
      >
        <div className="space-y-4">
          <ToggleRow
            label="WhatsApp chat button"
            description="A floating button that opens a WhatsApp conversation."
            checked={value.whatsappEnabled}
            onChange={(v) => patch({ whatsappEnabled: v })}
          />
          <Field label="WhatsApp number" hint="Include the country code, e.g. +9779800000000.">
            <TextInput
              value={value.whatsappNumber}
              onChange={(e) => patch({ whatsappNumber: e.target.value })}
              disabled={!value.whatsappEnabled}
              placeholder="+977 98XXXXXXXX"
            />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection title="Utility">
        <div className="space-y-4">
          <ToggleRow
            label="Google Maps"
            description="Show an embedded map on contact and destination pages."
            checked={value.googleMapsEnabled}
            onChange={(v) => patch({ googleMapsEnabled: v })}
          />
          <Field
            label="Google Maps API key"
            hint="From the Google Cloud Console — restrict it to the Maps JavaScript API for your domain."
            required={value.googleMapsEnabled}
            error={mapsMissingKey ? "Required to show the map." : undefined}
          >
            <TextInput
              type="password"
              value={value.googleMapsApiKey}
              onChange={(e) => patch({ googleMapsApiKey: e.target.value })}
              disabled={!value.googleMapsEnabled}
              placeholder="AIzaSy…"
              className={mapsMissingKey ? "border-danger-300 focus:border-danger-400 focus:ring-danger-50" : ""}
            />
          </Field>
          <ToggleRow
            label="Currency converter"
            description="Let visitors see prices in their own currency."
            checked={value.currencyConverterEnabled}
            onChange={(v) => patch({ currencyConverterEnabled: v })}
          />
          <ToggleRow
            label="Weather"
            description="A live weather panel on trek and destination pages."
            checked={value.weatherEnabled}
            onChange={(v) => patch({ weatherEnabled: v })}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Coming soon"
        description="Live chat, Instagram feed and YouTube embeds are on the roadmap."
      >
        <p className="text-sm text-neutral-500">
          We&apos;re still working out the right third-party integrations for these — they&apos;ll
          appear here once ready.
        </p>
      </SettingsSection>

      <SaveBar dirty={dirty} onSave={save} onReset={reset} />
    </div>
  );
}
