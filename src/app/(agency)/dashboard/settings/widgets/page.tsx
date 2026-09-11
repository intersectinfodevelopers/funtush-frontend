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
  liveChatEnabled: boolean;
  liveChatCode: string;
  googleMapsEnabled: boolean;
  currencyConverterEnabled: boolean;
  weatherEnabled: boolean;
  instagramFeedEnabled: boolean;
  youtubeEnabled: boolean;
  maxYoutubeVideos: number;
};

const DEFAULTS: Widgets = {
  whatsappEnabled: false,
  whatsappNumber: "",
  liveChatEnabled: false,
  liveChatCode: "",
  googleMapsEnabled: true,
  currencyConverterEnabled: false,
  weatherEnabled: false,
  instagramFeedEnabled: false,
  youtubeEnabled: false,
  maxYoutubeVideos: 6,
};

export default function WidgetsSettingsPage() {
  const { value, patch, dirty, save, reset } = useSettingsForm("widgetSettings", DEFAULTS);

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Widgets"
        description="Optional tools shown across your white-label site. Some require a paid tier."
      />

      <SettingsSection
        title="Contact"
        description="Ways for visitors to reach you directly from any page."
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
          <ToggleRow
            label="Live chat"
            description="Embed a third-party chat widget (Crisp, Tawk.to, Intercom…)."
            checked={value.liveChatEnabled}
            onChange={(v) => patch({ liveChatEnabled: v })}
          />
          <Field label="Live chat embed code" hint="Paste the <script> snippet from your provider.">
            <TextInput
              value={value.liveChatCode}
              onChange={(e) => patch({ liveChatCode: e.target.value })}
              disabled={!value.liveChatEnabled}
              placeholder="<script>…</script>"
            />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection title="Utility">
        <div className="space-y-3">
          <ToggleRow
            label="Google Maps"
            description="Show an embedded map on contact and destination pages."
            checked={value.googleMapsEnabled}
            onChange={(v) => patch({ googleMapsEnabled: v })}
          />
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

      <SettingsSection title="Media">
        <div className="space-y-4">
          <ToggleRow
            label="Instagram feed"
            description="Pull recent posts from your connected Instagram account."
            checked={value.instagramFeedEnabled}
            onChange={(v) => patch({ instagramFeedEnabled: v })}
          />
          <ToggleRow
            label="YouTube embeds"
            description="Show videos from Manage Video on your site."
            checked={value.youtubeEnabled}
            onChange={(v) => patch({ youtubeEnabled: v })}
          />
          <Field label="Max videos to show" hint="Between 1 and 12.">
            <TextInput
              type="number"
              min={1}
              max={12}
              value={value.maxYoutubeVideos}
              onChange={(e) =>
                patch({ maxYoutubeVideos: Math.max(1, Math.min(12, Number(e.target.value) || 1)) })
              }
              disabled={!value.youtubeEnabled}
              className="max-w-32"
            />
          </Field>
        </div>
      </SettingsSection>

      <SaveBar dirty={dirty} onSave={save} onReset={reset} />
    </div>
  );
}
