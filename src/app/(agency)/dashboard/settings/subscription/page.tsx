'use client';

import { useState, useEffect } from 'react';
import { Crown, Check, X } from 'lucide-react';

// Tier data
const tiers = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    features: {
      staff: '1 Staff Member',
      guides: '5 Guides',
      bookings: '50 Bookings/mo',
      blog: false,
      apiKeys: false,
      customDomain: false,
      analytics: false,
      prioritySupport: false,
    },
  },
  {
    id: 'small',
    name: 'Small',
    price: '$29/mo',
    features: {
      staff: '3 Staff Members',
      guides: '20 Guides',
      bookings: '200 Bookings/mo',
      blog: true,
      apiKeys: false,
      customDomain: false,
      analytics: false,
      prioritySupport: false,
    },
  },
  {
    id: 'medium',
    name: 'Medium',
    price: '$59/mo',
    features: {
      staff: '10 Staff Members',
      guides: '100 Guides',
      bookings: 'Unlimited',
      blog: true,
      apiKeys: true,
      customDomain: false,
      analytics: true,
      prioritySupport: false,
    },
  },
  {
    id: 'large',
    name: 'Large',
    price: '$99/mo',
    features: {
      staff: 'Unlimited',
      guides: 'Unlimited',
      bookings: 'Unlimited',
      blog: true,
      apiKeys: true,
      customDomain: true,
      analytics: true,
      prioritySupport: true,
    },
  },
];

// Feature labels for the table
const featureLabels = {
  staff: 'Staff Members',
  guides: 'Guides',
  bookings: 'Bookings',
  blog: 'Blog',
  apiKeys: 'API Keys',
  customDomain: 'Custom Domain',
  analytics: 'Analytics',
  prioritySupport: 'Priority Support',
};

export default function SubscriptionSettingsPage() {
  const [currentTier, setCurrentTier] = useState('free');
  const [showToast, setShowToast] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('subscriptionTier');
    if (stored) {
      setTimeout(() => {
        setCurrentTier(stored);
      }, 0);
    }
  }, []);

  const handleUpgrade = (tierId: string) => {
    setCurrentTier(tierId);
    localStorage.setItem('subscriptionTier', tierId);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const currentTierData = tiers.find((t) => t.id === currentTier);

  // Get all feature keys for the table
  const featureKeys = Object.keys(featureLabels) as (keyof typeof featureLabels)[];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Subscription</h1>
          <p className="text-sm text-neutral-500">Manage your subscription plan</p>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50">
          Subscription updated successfully! 🎉
        </div>
      )}

      {/* Current Tier Card */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown size={32} className="text-yellow-500" />
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                {currentTierData?.name} Plan
              </h2>
              <p className="text-sm text-neutral-500">{currentTierData?.price}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-neutral-200">
          {Object.entries(currentTierData?.features || {}).map(([key, value]) => (
            <div key={key} className="text-center">
              <p className="text-xs text-neutral-500">
                {featureLabels[key as keyof typeof featureLabels] || key}
              </p>
              <p className="text-sm font-medium text-neutral-900">
                {typeof value === 'boolean' ? (value ? '✅' : '❌') : value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tier Comparison Table */}
      <div className="bg-white text-black border border-neutral-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-neutral-200">
          <h3 className="text-sm font-medium text-neutral-900">Compare Plans</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                  Features
                </th>
                {tiers.map((tier) => (
                  <th key={tier.id} className="text-center text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                    {tier.name}
                    <p className="text-sm font-bold text-neutral-900">{tier.price}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {featureKeys.map((featureKey) => (
                <tr key={featureKey} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {featureLabels[featureKey]}
                  </td>
                  {tiers.map((tier) => {
                    const value = tier.features[featureKey];
                    const isCurrent = tier.id === currentTier;
                    return (
                      <td
                        key={tier.id}
                        className={`px-4 py-3 text-center text-sm ${
                          isCurrent ? 'bg-blue-50' : ''
                        }`}
                      >
                        {typeof value === 'boolean' ? (
                          value ? (
                            <Check size={18} className="text-green-600 mx-auto" />
                          ) : (
                            <X size={18} className="text-red-400 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm">{value}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td className="px-4 py-3"></td>
                {tiers.map((tier) => (
                  <td key={tier.id} className="px-4 py-3 text-center">
                    {tier.id !== currentTier && tier.id !== 'free' && (
                      <button
                        onClick={() => handleUpgrade(tier.id)}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        Upgrade
                      </button>
                    )}
                    {tier.id === currentTier && (
                      <span className="text-xs text-green-600 font-medium">Current</span>
                    )}
                    {tier.id === 'free' && tier.id !== currentTier && (
                      <span className="text-xs text-neutral-400">Free</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}