'use client';

import { useState } from 'react';
import { Save, Copy, CheckCircle, Globe } from 'lucide-react';
import { SettingsHeader } from '@/components/agency/settings/settings-kit';

const defaultSettings = {
  subdomain: 'greenagency',
  customDomain: '',
};

const getInitialSettings = () => {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  try {
    const stored = localStorage.getItem('domainSettings');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse domain settings:', error);
  }

  return defaultSettings;
};

export default function DomainSettingsPage() {
  const [settings, setSettings] = useState(getInitialSettings);
  const [showToast, setShowToast] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    localStorage.setItem('domainSettings', JSON.stringify(settings));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Domain"
        description="Manage your domain settings"
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

      <div className="space-y-6">
        {/* Current Subdomain */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Current Subdomain (read-only)
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-sm text-neutral-600">
              {settings.subdomain}.greenagency.com
            </div>
            <button
              onClick={() => handleCopy(`${settings.subdomain}.greenagency.com`)}
              className="flex items-center gap-2 px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors"
            >
              {copied ? <CheckCircle size={16} className="text-success-700" /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Your current subdomain is auto-generated and cannot be changed.
          </p>
        </div>

        {/* Custom Domain */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Custom Domain
          </label>
          <input
            type="text"
            value={settings.customDomain}
            onChange={(e) => setSettings({ ...settings, customDomain: e.target.value })}
            className="w-full text-black border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
            placeholder="example.com"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Enter your custom domain (e.g., trekkingagency.com)
          </p>
        </div>

        {/* CNAME Instructions */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-neutral-700 mb-3">CNAME Configuration</h3>
          <p className="text-sm text-neutral-600 mb-2">
            To connect your custom domain, add a CNAME record in your DNS settings:
          </p>
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-600">Type:</span>
              <span className="font-mono font-medium">CNAME</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-600">Name:</span>
              <span className="font-mono font-medium">@ or www</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-600">Value:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium">{settings.subdomain}.greenagency.com</span>
                <button
                  onClick={() => handleCopy(`${settings.subdomain}.greenagency.com`)}
                  className="text-primary-700 hover:text-primary-700"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-600">TTL:</span>
              <span className="font-mono font-medium">3600 (recommended)</span>
            </div>
          </div>
        </div>

        {/* DNS Propagation Note */}
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Globe size={20} className="text-primary-700 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-primary-800">DNS Propagation</h4>
              <p className="text-sm text-primary-700 mt-1">
                DNS changes can take up to 48 hours to propagate. Once propagated, your custom domain
                will automatically point to your agency dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}