'use client';

import { useState } from 'react';
import { Save, Link, Video, Phone } from 'lucide-react';
import { SettingsHeader } from '@/components/agency/settings/settings-kit';

// Default settings
const defaultSettings = {
  facebook: '',
  instagram: '',
  tiktok: '',
  whatsapp: '',
  youtube: '',
};

export default function SocialSettingsPage() {
  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('socialSettings');
      return stored ? JSON.parse(stored) : defaultSettings;
    }
    return defaultSettings;
  });
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    localStorage.setItem('socialSettings', JSON.stringify(settings));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleChange = (field: keyof typeof settings, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Social"
        description="Manage your social media profiles"
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
          Social settings saved successfully! 🎉
        </div>
      )}

      <div className="space-y-4">
        {/* Facebook */}
        <div className="bg-white border text-black border-neutral-200 rounded-xl p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1">
            <Link size={18} className="text-primary-700" />
            Facebook URL
          </label>
          <input
            type="url"
            value={settings.facebook}
            onChange={(e) => handleChange('facebook', e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
            placeholder="https://facebook.com/yourpage"
          />
        </div>

        {/* Instagram */}
        <div className="bg-white text-black border border-neutral-200 rounded-xl p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1">
            <span className="text-pink-600">📸</span>
            Instagram URL
          </label>
          <input
            type="url"
            value={settings.instagram}
            onChange={(e) => handleChange('instagram', e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
            placeholder="https://instagram.com/yourprofile"
          />
        </div>

        {/* TikTok */}
        <div className="bg-white text-black border border-neutral-200 rounded-xl p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1">
            <span className="text-black">🎵</span>
            TikTok URL
          </label>
          <input
            type="url"
            value={settings.tiktok}
            onChange={(e) => handleChange('tiktok', e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
            placeholder="https://tiktok.com/@yourprofile"
          />
        </div>

        {/* WhatsApp */}
        <div className="bg-white text-black border border-neutral-200 rounded-xl p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1">
            <Phone size={18} className="text-success-700" />
            WhatsApp Number
          </label>
          <input
            type="text"
            value={settings.whatsapp}
            onChange={(e) => handleChange('whatsapp', e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
            placeholder="+977 98XXXXXXXX"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Include country code (e.g., +977 for Nepal)
          </p>
        </div>

        {/* YouTube */}
        <div className="bg-white text-black border border-neutral-200 rounded-xl p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1">
            <Video size={18} className="text-danger-600" />
            YouTube Channel URL
          </label>
          <input
            type="url"
            value={settings.youtube}
            onChange={(e) => handleChange('youtube', e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
            placeholder="https://youtube.com/@yourchannel"
          />
        </div>
      </div>
    </div>
  );
}