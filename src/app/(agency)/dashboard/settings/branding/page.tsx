'use client';

import { useEffect, useState } from 'react';
import { Save, Upload, Eye } from 'lucide-react';
import { SettingsHeader } from '@/components/agency/settings/settings-kit';

// Font options — value must match the Google Fonts family name exactly.
const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
];

// Default settings
const defaultSettings = {
  primaryColor: '#3B82F6',
  font: 'Inter',
  logo: '',
  favicon: '',
};

/** The Google Fonts stylesheet URL for a font family name. */
function googleFontHref(family: string): string {
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@400;500;600;700&display=swap`;
}

const GOOGLE_FONT_LINK_ID = 'branding-preview-font';

/**
 * Load a Google Font at runtime so the picker and the live preview actually
 * render in the selected face — `next/font` only handles fonts known at build
 * time, and this one is chosen by the agency. Inter is already loaded
 * app-wide, so it needs no network request.
 */
function useGoogleFont(family: string) {
  useEffect(() => {
    if (family === 'Inter') return;

    let link = document.getElementById(GOOGLE_FONT_LINK_ID) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = GOOGLE_FONT_LINK_ID;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = googleFontHref(family);
  }, [family]);
}

export default function BrandingSettingsPage() {
  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('brandingSettings');
      return stored ? JSON.parse(stored) : defaultSettings;
    }
    return defaultSettings;
  });
  const [showToast, setShowToast] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useGoogleFont(settings.font);

  // Save to localStorage
  const handleSave = () => {
    localStorage.setItem('brandingSettings', JSON.stringify(settings));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleColorChange = (color: string) => {
    setSettings({ ...settings, primaryColor: color });
  };

  const handleFontChange = (font: string) => {
    setSettings({ ...settings, font });
  };

  const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB — plenty for a logo/favicon, keeps localStorage happy

  function readImage(
    file: File,
    onDone: (dataUrl: string) => void,
  ) {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError('Image is too large — please use one under 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setUploadError('Could not read that file. Please try again.');
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') onDone(result);
    };
    reader.readAsDataURL(file);
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readImage(file, (logo) => setSettings((s: typeof defaultSettings) => ({ ...s, logo })));
    e.target.value = ''; // allow re-selecting the same file
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readImage(file, (favicon) => setSettings((s: typeof defaultSettings) => ({ ...s, favicon })));
    e.target.value = '';
  };

  // Preview styles
  const previewStyle = {
    fontFamily: settings.font,
    '--primary-color': settings.primaryColor,
  } as React.CSSProperties;

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Branding"
        description="Customize your agency brand appearance"
        action={
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
          >
            <Save size={18} />
            Save changes
          </button>
        }
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded-xl shadow-lg z-50">
          Settings saved successfully! 🎉
        </div>
      )}

      {uploadError && (
        <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800">
          {uploadError}
        </div>
      )}

      <div className="grid text-neutral-900 grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Settings */}
        <div className="space-y-6">
          {/* Primary Color */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border border-neutral-200"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1 border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          {/* Font Selector */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Font
            </label>
            <select
              value={settings.font}
              onChange={(e) => handleFontChange(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
              style={{ fontFamily: settings.font }}
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-neutral-400">
              Applied to your white-label site. The preview on the right updates live.
            </p>
          </div>

          {/* Logo Upload */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Logo
            </label>
            <div className="flex items-center gap-4">
              {settings.logo && (
                // A locally-uploaded data: URL preview — next/image needs explicit
                // dimensions it can't have here, so a plain <img> is the right tool.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logo}
                  alt="Logo"
                  className="h-16 w-auto object-contain border border-neutral-200 rounded"
                />
              )}
              <label className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl text-sm hover:bg-neutral-50 cursor-pointer transition-colors">
                <Upload size={16} />
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-1.5 text-xs text-neutral-400">PNG, JPG or SVG. Up to 2 MB.</p>
          </div>

          {/* Favicon Upload */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Favicon
            </label>
            <div className="flex items-center gap-4">
              {settings.favicon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.favicon}
                  alt="Favicon"
                  className="w-10 h-10 object-contain border border-neutral-200 rounded"
                />
              )}
              <label className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl text-sm hover:bg-neutral-50 cursor-pointer transition-colors">
                <Upload size={16} />
                Upload Favicon
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-1.5 text-xs text-neutral-400">
              Square image recommended, e.g. 512×512 PNG or ICO.
            </p>
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div>
          <div className="bg-white border border-neutral-200 rounded-xl p-4 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={18} className="text-neutral-400" />
              <h3 className="text-sm font-medium text-neutral-700">Live Preview</h3>
            </div>

            <div
              className="border border-neutral-200 rounded-xl p-6"
              style={previewStyle}
            >
              {/* Header Preview */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {settings.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={settings.logo} alt="Logo" className="h-8 w-auto" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-neutral-200"></div>
                  )}
                  <span className="text-lg font-bold" style={{ color: settings.primaryColor }}>
                    Your Agency
                  </span>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs text-white"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  Preview
                </div>
              </div>

              {/* Card Preview */}
              <div
                className="border rounded-xl p-4"
                style={{ borderColor: settings.primaryColor }}
              >
                <h4 className="font-semibold mb-1" style={{ fontFamily: settings.font }}>
                  Welcome to your agency
                </h4>
                <p className="text-sm text-neutral-600" style={{ fontFamily: settings.font }}>
                  This is how your brand will look with the selected settings.
                </p>
                <button
                  className="mt-3 px-4 py-1.5 rounded-lg text-sm text-white"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
