'use client';

import { useState } from 'react';
import { Save, Upload } from 'lucide-react';

const defaultSettings = {
  pageTitleFormat: '{page} | {agency}',
  metaDescription: '',
  ogImage: '',
};

export default function SeoSettingsPage() {
  const [settings, setSettings] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultSettings;
    }

    const stored = localStorage.getItem('seoSettings');
    if (!stored) {
      return defaultSettings;
    }

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse SEO settings:', error);
      return defaultSettings;
    }
  });
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    localStorage.setItem('seoSettings', JSON.stringify(settings));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleOgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSettings({ ...settings, ogImage: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">SEO</h1>
          <p className="text-sm text-neutral-500">Optimize your site for search engines</p>
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
          SEO settings saved successfully! 🎉
        </div>
      )}

      <div className="space-y-6">
        {/* Page Title Format */}
        <div className="bg-white border text-black border-neutral-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Page Title Format
          </label>
          <input
            type="text"
            value={settings.pageTitleFormat}
            onChange={(e) => setSettings({ ...settings, pageTitleFormat: e.target.value })}
            className="w-full  border border-neutral-300 rounded px-3 py-1.5 text-sm font-mono"
            placeholder="{page} | {agency}"
          />
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="text-xs text-neutral-500">Available variables:</span>
            <code className="text-xs bg-neutral-100 px-2 py-0.5 rounded">{'{page}'}</code>
            <code className="text-xs bg-neutral-100 px-2 py-0.5 rounded">{'{agency}'}</code>
            <code className="text-xs bg-neutral-100 px-2 py-0.5 rounded">{'{tagline}'}</code>
          </div>
          <div className="mt-2 p-2 bg-neutral-50 border border-neutral-200 rounded">
            <span className="text-xs text-neutral-500">Preview: </span>
            <span className="text-sm text-neutral-700">
              {settings.pageTitleFormat
                .replace('{page}', 'Home')
                .replace('{agency}', 'Green Agency')
                .replace('{tagline}', 'Trekking in Nepal')}
            </span>
          </div>
        </div>

        {/* Meta Description */}
        <div className="bg-white border text-black border-neutral-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Meta Description
          </label>
          <textarea
            value={settings.metaDescription}
            onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
            rows={3}
            className="w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
            placeholder={"Your agency's meta description for search engines"}
          />
          <p className="text-xs text-neutral-500 mt-1">
            {settings.metaDescription.length}/160 characters
          </p>
        </div>

        {/* OG Image */}
        <div className="bg-white text-black border border-neutral-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Open Graph Image
          </label>
          <div className="flex items-center gap-4">
            {settings.ogImage && (
              <img
                src={settings.ogImage}
                alt="OG Image"
                className="h-24 w-auto object-contain border border-neutral-200 rounded"
              />
            )}
            <label className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 cursor-pointer transition-colors">
              <Upload size={16} />
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleOgImageUpload}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Recommended size: 1200 × 630 pixels. Used for social media previews.
          </p>
        </div>
      </div>
    </div>
  );
}