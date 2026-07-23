'use client';

import { useState, useEffect } from 'react';
import { Save, Upload, Eye } from 'lucide-react';

// Font options
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

export default function BrandingSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [showToast, setShowToast] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('brandingSettings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSettings({ ...settings, logo: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSettings({ ...settings, favicon: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Preview styles
  const previewStyle = {
    fontFamily: settings.font,
    '--primary-color': settings.primaryColor,
  } as React.CSSProperties;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Branding</h1>
          <p className="text-sm text-neutral-500">Customize your agency's brand appearance</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50">
          Settings saved successfully! 🎉
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Settings */}
        <div className="space-y-6">
          {/* Primary Color */}
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-12 rounded cursor-pointer border border-neutral-200"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1 border border-neutral-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          {/* Font Selector */}
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Font
            </label>
            <select
              value={settings.font}
              onChange={(e) => handleFontChange(e.target.value)}
              className="w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
              style={{ fontFamily: settings.font }}
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Logo Upload */}
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Logo
            </label>
            <div className="flex items-center gap-4">
              {settings.logo && (
                <img
                  src={settings.logo}
                  alt="Logo"
                  className="h-16 w-auto object-contain border border-neutral-200 rounded"
                />
              )}
              <label className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 cursor-pointer transition-colors">
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
          </div>

          {/* Favicon Upload */}
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Favicon
            </label>
            <div className="flex items-center gap-4">
              {settings.favicon && (
                <img
                  src={settings.favicon}
                  alt="Favicon"
                  className="w-10 h-10 object-contain border border-neutral-200 rounded"
                />
              )}
              <label className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 cursor-pointer transition-colors">
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
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div>
          <div className="bg-white border border-neutral-200 rounded-lg p-4 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={18} className="text-neutral-400" />
              <h3 className="text-sm font-medium text-neutral-700">Live Preview</h3>
            </div>

            <div
              className="border border-neutral-200 rounded-lg p-6"
              style={previewStyle}
            >
              {/* Header Preview */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {settings.logo ? (
                    <img src={settings.logo} alt="Logo" className="h-8 w-auto" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-neutral-200"></div>
                  )}
                  <span className="text-lg font-bold" style={{ color: settings.primaryColor }}>
                    Green Agency
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
                className="border rounded-lg p-4"
                style={{ borderColor: settings.primaryColor }}
              >
                <h4 className="font-semibold mb-1" style={{ fontFamily: settings.font }}>
                  Welcome to Green Agency
                </h4>
                <p className="text-sm text-neutral-600" style={{ fontFamily: settings.font }}>
                  This is how your brand will look with the selected settings.
                </p>
                <button
                  className="mt-3 px-4 py-1.5 rounded text-sm text-white"
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