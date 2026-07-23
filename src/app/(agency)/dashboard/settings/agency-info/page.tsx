'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, X } from 'lucide-react';

// Operating regions options
const regionOptions = [
  { value: 'nepal', label: 'Nepal' },
  { value: 'india', label: 'India' },
  { value: 'china', label: 'China' },
  { value: 'usa', label: 'USA' },
  { value: 'uk', label: 'UK' },
  { value: 'europe', label: 'Europe' },
  { value: 'australia', label: 'Australia' },
  { value: 'south-east-asia', label: 'South East Asia' },
];

type ContactField = {
  value: string;
  showOnWebsite: boolean;
};

type AgencySettings = {
  companyName: string;
  description: string;
  phones: ContactField[];
  emails: ContactField[];
  address: string;
  operatingRegions: string[];
};

// Default settings
const defaultSettings: AgencySettings = {
  companyName: '',
  description: '',
  phones: [{ value: '', showOnWebsite: true }],
  emails: [{ value: '', showOnWebsite: true }],
  address: '',
  operatingRegions: [],
};

export default function AgencyInfoSettingsPage() {
  const [settings, setSettings] = useState<AgencySettings>(defaultSettings);
  const [showToast, setShowToast] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('agencyInfoSettings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

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

  // Region handlers
  const toggleRegion = (regionValue: string) => {
    const current = settings.operatingRegions;
    if (current.includes(regionValue)) {
      setSettings({
        ...settings,
        operatingRegions: current.filter((r) => r !== regionValue),
      });
    } else {
      setSettings({
        ...settings,
        operatingRegions: [...current, regionValue],
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Agency Info</h1>
          <p className="text-sm text-neutral-500">Manage your agency's information</p>
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

      <div className="space-y-6">
        {/* Company Name */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Company Name *
          </label>
          <input
            type="text"
            value={settings.companyName}
            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
            className="w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
            placeholder="Enter company name"
          />
        </div>

        {/* Description */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Description
          </label>
          <textarea
            value={settings.description}
            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            rows={3}
            className="w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
            placeholder="Tell us about your agency"
          />
        </div>

        {/* Phones */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-neutral-700">Phone Numbers</label>
            <button
              onClick={addPhone}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
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
                  className="flex-1 border border-neutral-300 rounded px-3 py-1.5 text-sm"
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
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  disabled={settings.phones.length <= 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Emails */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-neutral-700">Email Addresses</label>
            <button
              onClick={addEmail}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
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
                  className="flex-1 border border-neutral-300 rounded px-3 py-1.5 text-sm"
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
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  disabled={settings.emails.length <= 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Address
          </label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className="w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
            placeholder="Enter full address"
          />
        </div>

        {/* Operating Regions */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Operating Regions
          </label>
          <div className="flex flex-wrap gap-2">
            {regionOptions.map((region) => {
              const isSelected = settings.operatingRegions.includes(region.value);
              return (
                <button
                  key={region.value}
                  onClick={() => toggleRegion(region.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    isSelected
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200'
                  }`}
                >
                  {region.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-neutral-500 mt-2">Click to select multiple regions</p>
        </div>
      </div>
    </div>
  );
}