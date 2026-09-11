'use client';

import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { SettingsHeader } from '@/components/agency/settings/settings-kit';
import { ComplianceSection } from '@/components/agency/settings/ComplianceSection';
import { KycVerificationSection } from '@/components/agency/settings/KycVerificationSection';

type ContactField = {
  value: string;
  showOnWebsite: boolean;
};

const BUSINESS_CATEGORIES = [
  'Trekking & Mountaineering',
  'Adventure Tourism',
  'Expedition Operator',
  'Travel & Tours',
  'Cultural Tourism',
  'Wildlife & Nature Tours',
];

type AgencySettings = {
  companyName: string;
  description: string;
  businessCategory: string;
  phones: ContactField[];
  emails: ContactField[];
  address: string;
};

// Default settings
const defaultSettings: AgencySettings = {
  companyName: '',
  description: '',
  businessCategory: BUSINESS_CATEGORIES[0],
  phones: [{ value: '', showOnWebsite: true }],
  emails: [{ value: '', showOnWebsite: true }],
  address: '',
};

export default function AgencyInfoSettingsPage() {
  const [settings, setSettings] = useState<AgencySettings>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('agencyInfoSettings');
      return stored ? JSON.parse(stored) : defaultSettings;
    }
    return defaultSettings;
  });
  const [showToast, setShowToast] = useState(false);


  const handleSave = () => {
    localStorage.setItem('agencyInfoSettings', JSON.stringify(settings));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Phone handlers
  const addPhone = () => {
    setSettings({
      ...settings,
      phones: [...settings.phones, { value: '', showOnWebsite: true }],
    });
  };

  const removePhone = (index: number) => {
    if (settings.phones.length <= 1) return;
    setSettings({
      ...settings,
      phones: settings.phones.filter((_, i) => i !== index),
    });
  };

  const updatePhone = (index: number, value: string) => {
    const updated = [...settings.phones];
    updated[index].value = value;
    setSettings({ ...settings, phones: updated });
  };

  const togglePhoneShow = (index: number) => {
    const updated = [...settings.phones];
    updated[index].showOnWebsite = !updated[index].showOnWebsite;
    setSettings({ ...settings, phones: updated });
  };

  // Email handlers
  const addEmail = () => {
    setSettings({
      ...settings,
      emails: [...settings.emails, { value: '', showOnWebsite: true }],
    });
  };

  const removeEmail = (index: number) => {
    if (settings.emails.length <= 1) return;
    setSettings({
      ...settings,
      emails: settings.emails.filter((_, i) => i !== index),
    });
  };

  const updateEmail = (index: number, value: string) => {
    const updated = [...settings.emails];
    updated[index].value = value;
    setSettings({ ...settings, emails: updated });
  };

  const toggleEmailShow = (index: number) => {
    const updated = [...settings.emails];
    updated[index].showOnWebsite = !updated[index].showOnWebsite;
    setSettings({ ...settings, emails: updated });
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Agency Info"
        description="Manage your agency information"
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
        {/* Company Name + Business Category */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
              placeholder="Enter company name"
            />
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Business Category *
            </label>
            <select
              value={settings.businessCategory}
              onChange={(e) => setSettings({ ...settings, businessCategory: e.target.value })}
              className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm text-neutral-900"
            >
              {BUSINESS_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Description
          </label>
          <textarea
            value={settings.description}
            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            rows={3}
            className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
            placeholder="Tell us about your agency"
          />
        </div>

        {/* Phones */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-neutral-700">Phone Numbers</label>
            <button
              onClick={addPhone}
              className="flex items-center gap-1 text-sm text-primary-700 hover:text-primary-700"
            >
              <Plus size={16} /> Add Phone
            </button>
          </div>
          <div className="space-y-2">
            {settings.phones.map((phone, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={phone.value}
                  onChange={(e) => updatePhone(index, e.target.value)}
                  className="flex-1 border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
                  placeholder="+977 98XXXXXXXX"
                />
                <label className="flex items-center gap-2 text-sm text-neutral-600 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={phone.showOnWebsite}
                    onChange={() => togglePhoneShow(index)}
                    className="rounded"
                  />
                  Show on website
                </label>
                <button
                  onClick={() => removePhone(index)}
                  className="text-danger-600 hover:text-danger-700 disabled:opacity-50"
                  disabled={settings.phones.length <= 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Emails */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-neutral-700">Email Addresses</label>
            <button
              onClick={addEmail}
              className="flex items-center gap-1 text-sm text-primary-700 hover:text-primary-700"
            >
              <Plus size={16} /> Add Email
            </button>
          </div>
          <div className="space-y-2">
            {settings.emails.map((email, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="email"
                  value={email.value}
                  onChange={(e) => updateEmail(index, e.target.value)}
                  className="flex-1 border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
                  placeholder="info@greenagency.com"
                />
                <label className="flex items-center gap-2 text-sm text-neutral-600 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={email.showOnWebsite}
                    onChange={() => toggleEmailShow(index)}
                    className="rounded"
                  />
                  Show on website
                </label>
                <button
                  onClick={() => removeEmail(index)}
                  className="text-danger-600 hover:text-danger-700 disabled:opacity-50"
                  disabled={settings.emails.length <= 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Address
          </label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
            placeholder="Enter full address"
          />
        </div>
      </div>

      <ComplianceSection />
      <KycVerificationSection />
    </div>
  );
}