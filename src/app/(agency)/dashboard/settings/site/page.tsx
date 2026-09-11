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

type SiteStatus = {
  comingSoon: boolean;
  comingSoonHeadline: string;
  comingSoonMessage: string;
  announcementEnabled: boolean;
  announcementText: string;
  announcementLink: string;
  showFuntushBadge: boolean;
};

const DEFAULTS: SiteStatus = {
  comingSoon: false,
  comingSoonHeadline: "We're launching soon",
  comingSoonMessage: "Our new site is on the way. Reach us by email in the meantime.",
  announcementEnabled: false,
  announcementText: "Monsoon sale — 15% off all Annapurna treks booked this month.",
  announcementLink: "",
  showFuntushBadge: true,
};

export default function SiteStatusSettingsPage() {
  const { value, patch, dirty, save, reset } = useSettingsForm("siteStatusSettings", DEFAULTS);

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Site status"
        description="Control what visitors see when your public site isn't fully ready, plus the announcement bar and the Funtush badge."
      />

      <SettingsSection
        title="Coming-soon mode"
        description="When on, the public site shows a holding page instead of your content. Your dashboard is unaffected."
      >
        <div className="space-y-4">
          <ToggleRow
            label="Show a coming-soon page"
            description="Hide the live site from visitors."
            checked={value.comingSoon}
            onChange={(v) => patch({ comingSoon: v })}
          />
          <Field label="Headline">
            <TextInput
              value={value.comingSoonHeadline}
              onChange={(e) => patch({ comingSoonHeadline: e.target.value })}
              disabled={!value.comingSoon}
              placeholder="We're launching soon"
            />
          </Field>
          <Field label="Message">
            <TextArea
              rows={3}
              value={value.comingSoonMessage}
              onChange={(e) => patch({ comingSoonMessage: e.target.value })}
              disabled={!value.comingSoon}
            />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Announcement bar"
        description="A thin bar across the top of every page — good for sales or notices."
      >
        <div className="space-y-4">
          <ToggleRow
            label="Show the announcement bar"
            checked={value.announcementEnabled}
            onChange={(v) => patch({ announcementEnabled: v })}
          />
          <Field label="Text">
            <TextInput
              value={value.announcementText}
              onChange={(e) => patch({ announcementText: e.target.value })}
              disabled={!value.announcementEnabled}
              maxLength={140}
            />
          </Field>
          <Field label="Link (optional)" hint="Where the bar takes visitors when clicked.">
            <TextInput
              value={value.announcementLink}
              onChange={(e) => patch({ announcementLink: e.target.value })}
              disabled={!value.announcementEnabled}
              placeholder="/packages/annapurna-circuit"
            />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection title="Funtush badge">
        <ToggleRow
          label='Show "Powered by Funtush"'
          description="A small credit in your site footer. Removing it requires a higher tier."
          checked={value.showFuntushBadge}
          onChange={(v) => patch({ showFuntushBadge: v })}
        />
      </SettingsSection>

      <SaveBar dirty={dirty} onSave={save} onReset={reset} />
    </div>
  );
}
