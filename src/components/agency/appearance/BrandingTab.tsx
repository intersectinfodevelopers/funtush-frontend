"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import {
  Field,
  SaveBar,
  SettingsSection,
  TextInput,
  ToggleRow,
  useSettingsForm,
} from "@/components/agency/settings/settings-kit";

const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Poppins", label: "Poppins" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
];

const SWATCHES = [
  { id: "violet", name: "Violet", hex: "#6C72FF" },
  { id: "blue", name: "Blue", hex: "#1a5fa8" },
  { id: "teal", name: "Teal", hex: "#1d8ec8" },
  { id: "green", name: "Green", hex: "#16a34a" },
  { id: "amber", name: "Amber", hex: "#d97706" },
  { id: "rose", name: "Rose", hex: "#dc2626" },
];

const RATIOS = [
  { value: "1:1", label: "1:1 · Square" },
  { value: "4:3", label: "4:3 · Classic" },
  { value: "16:9", label: "16:9 · Widescreen" },
  { value: "3:4", label: "3:4 · Portrait" },
];

const CURRENCIES = ["$", "Rs", "€", "£", "₹"];

type Branding = {
  primaryColor: string;
  paletteId: string;
  font: string;
  brandName: string;
  logo: string;
  favicon: string;
  imageRatio: string;
  currencySymbol: string;
  receiptFooter: string;
  showFuntushBadge: boolean;
};

const DEFAULTS: Branding = {
  primaryColor: "#6C72FF",
  paletteId: "violet",
  font: "Inter",
  brandName: "",
  logo: "",
  favicon: "",
  imageRatio: "1:1",
  currencySymbol: "$",
  receiptFooter: "Thank you for trekking with us!",
  showFuntushBadge: true,
};

function googleFontHref(family: string): string {
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@400;500;600;700&display=swap`;
}
const GOOGLE_FONT_LINK_ID = "appearance-preview-font";

function useGoogleFont(family: string) {
  useEffect(() => {
    if (family === "Inter") return;
    let link = document.getElementById(GOOGLE_FONT_LINK_ID) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = GOOGLE_FONT_LINK_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = googleFontHref(family);
  }, [family]);
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** Just the construction fields — the rest of "siteStatusSettings" (top bar,
 * popup) is owned by the Components tab, but they share one storage key. */
type ConstructionSlice = {
  comingSoon: boolean;
  comingSoonHeadline: string;
  comingSoonMessage: string;
};
const CONSTRUCTION_DEFAULTS: ConstructionSlice = {
  comingSoon: false,
  comingSoonHeadline: "We're launching soon",
  comingSoonMessage: "Our new site is on the way. Reach us by email in the meantime.",
};

export function BrandingTab() {
  // Reuses the "brandingSettings" key the old /settings/branding page wrote,
  // extended with the fields below — an agency that already set a logo/color
  // keeps it here.
  const { value, patch, dirty, save, reset } = useSettingsForm<Branding>("brandingSettings", DEFAULTS);
  // Shares "siteStatusSettings" with the Components tab (top bar / popup) —
  // useSettingsForm only patches the keys it's given, so the two tabs don't
  // clobber each other's fields.
  const construction = useSettingsForm<ConstructionSlice>("siteStatusSettings", CONSTRUCTION_DEFAULTS);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useGoogleFont(value.font);

  function readImage(file: File, onDone: (dataUrl: string) => void) {
    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError("Image is too large — please use one under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setUploadError("Could not read that file. Please try again.");
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") onDone(result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      {uploadError && (
        <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800">
          {uploadError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <SettingsSection title="Primary Color">
            <div className="flex flex-wrap gap-3">
              {SWATCHES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => patch({ primaryColor: s.hex, paletteId: s.id })}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition ${
                    value.paletteId === s.id ? "border-primary-500 bg-primary-50" : "border-transparent hover:bg-neutral-50"
                  }`}
                >
                  <span
                    className="h-8 w-8 rounded-full border border-neutral-200 shadow-sm"
                    style={{ backgroundColor: s.hex }}
                  />
                  <span className="text-xs font-medium text-neutral-600">{s.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input
                type="color"
                value={value.primaryColor}
                onChange={(e) => patch({ primaryColor: e.target.value, paletteId: "custom" })}
                className="h-10 w-12 cursor-pointer rounded-lg border border-neutral-200"
              />
              <TextInput
                value={value.primaryColor}
                onChange={(e) => patch({ primaryColor: e.target.value, paletteId: "custom" })}
                className="flex-1 font-mono"
              />
            </div>
          </SettingsSection>

          <SettingsSection title="Font Family">
            <select
              value={value.font}
              onChange={(e) => patch({ font: e.target.value })}
              style={{ fontFamily: value.font }}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50"
            >
              {fontOptions.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.label}
                </option>
              ))}
            </select>
          </SettingsSection>

          <SettingsSection title="Brand Name">
            <TextInput
              value={value.brandName}
              onChange={(e) => patch({ brandName: e.target.value })}
              placeholder="e.g., Everest Trails Adventures"
            />
          </SettingsSection>

          <SettingsSection title="Brand Logo" description="Best fit: 725 × 145">
            <div className="flex items-center gap-4">
              {value.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value.logo} alt="Logo" className="h-14 w-auto rounded border border-neutral-200 object-contain" />
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-50">
                <Upload size={16} />
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) readImage(file, (logo) => patch({ logo }));
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </SettingsSection>

          <SettingsSection title="Brand Favicon" description="Best fit: 96 × 96">
            <div className="flex items-center gap-4">
              {value.favicon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value.favicon} alt="Favicon" className="h-10 w-10 rounded border border-neutral-200 object-contain" />
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-50">
                <Upload size={16} />
                Upload Favicon
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) readImage(file, (favicon) => patch({ favicon }));
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </SettingsSection>
        </div>

        <div className="space-y-6">
          <SettingsSection title="Image Ratio" description="Applied to package and gallery photos site-wide.">
            <div className="grid grid-cols-2 gap-2">
              {RATIOS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => patch({ imageRatio: r.value })}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    value.imageRatio === r.value
                      ? "border-primary-400 bg-primary-50 font-semibold text-primary-900"
                      : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-neutral-400">Selected {value.imageRatio}</p>
          </SettingsSection>

          <SettingsSection title="Currency Indicator">
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => patch({ currencySymbol: c })}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-mono transition ${
                    value.currencySymbol === c
                      ? "border-primary-400 bg-primary-50 text-primary-900"
                      : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {c}
                </button>
              ))}
              <TextInput
                value={value.currencySymbol}
                onChange={(e) => patch({ currencySymbol: e.target.value })}
                className="w-24 font-mono"
                maxLength={4}
              />
            </div>
            <p className="mt-2 text-xs text-neutral-400">Current value: {value.currencySymbol}</p>
          </SettingsSection>

          <SettingsSection title="Booking Receipt Footer" description="Printed at the bottom of every invoice and receipt.">
            <TextInput
              value={value.receiptFooter}
              onChange={(e) => patch({ receiptFooter: e.target.value })}
              placeholder="Thank you for trekking with us!"
            />
          </SettingsSection>

          <SettingsSection title="Funtush badge">
            <ToggleRow
              label='Show "Powered by Funtush"'
              description="A small credit in your site footer. Removing it requires a paid plan."
              checked={value.showFuntushBadge}
              onChange={(v) => patch({ showFuntushBadge: v })}
            />
          </SettingsSection>

          <SettingsSection
            title="Site Under Construction"
            description="Visitors see a holding page instead of your content. Your dashboard keeps working."
          >
            <div className="space-y-4">
              <ToggleRow
                label="Show a coming-soon page"
                checked={construction.value.comingSoon}
                onChange={(v) => construction.patch({ comingSoon: v })}
              />
              <Field label="Headline">
                <TextInput
                  value={construction.value.comingSoonHeadline}
                  onChange={(e) => construction.patch({ comingSoonHeadline: e.target.value })}
                  disabled={!construction.value.comingSoon}
                />
              </Field>
            </div>
          </SettingsSection>
        </div>
      </div>

      <SaveBar
        dirty={dirty || construction.dirty}
        onSave={() => {
          save();
          construction.save();
        }}
        onReset={() => {
          reset();
          construction.reset();
        }}
      />
    </div>
  );
}
