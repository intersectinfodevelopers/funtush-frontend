'use client';

import { useState } from 'react';
import { Save, CreditCard, Building2, Smartphone } from 'lucide-react';
import { SettingsHeader } from '@/components/agency/settings/settings-kit';

// Payment gateway configurations
interface PaymentGateway {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  credentials: {
    [key: string]: string;
  };
}

const defaultGateways: PaymentGateway[] = [
  {
    id: 'esewa',
    name: 'eSewa',
    icon: <Smartphone size={18} />,
    enabled: false,
    credentials: {
      merchantId: '',
      secretKey: '',
    },
  },
  {
    id: 'khalti',
    name: 'Khalti',
    icon: <Smartphone size={18} />,
    enabled: false,
    credentials: {
      publicKey: '',
      secretKey: '',
    },
  },
  {
    id: 'fonepay',
    name: 'Fonepay',
    icon: <Smartphone size={18} />,
    enabled: false,
    credentials: {
      merchantCode: '',
      terminalId: '',
    },
  },
  {
    id: 'stripe',
    name: 'Stripe',
    icon: <CreditCard size={18} />,
    enabled: false,
    credentials: {
      publishableKey: '',
      secretKey: '',
    },
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: <Building2 size={18} />,
    enabled: false,
    credentials: {
      bankName: '',
      accountNumber: '',
      accountName: '',
    },
  },
];

export default function PaymentsSettingsPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>(() => {
    if (typeof window === 'undefined') return defaultGateways;
    try {
      const stored = localStorage.getItem('paymentSettings');
      return stored ? JSON.parse(stored) : defaultGateways;
    } catch (error) {
      console.error('Failed to parse payment settings:', error);
      return defaultGateways;
    }
  });
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    localStorage.setItem('paymentSettings', JSON.stringify(gateways));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleGateway = (id: string) => {
    setGateways(
      gateways.map((g) =>
        g.id === id ? { ...g, enabled: !g.enabled } : g
      )
    );
  };

  const updateCredential = (gatewayId: string, key: string, value: string) => {
    setGateways(
      gateways.map((g) =>
        g.id === gatewayId
          ? {
              ...g,
              credentials: {
                ...g.credentials,
                [key]: value,
              },
            }
          : g
      )
    );
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Payments"
        description="Configure payment gateways"
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
          Payment settings saved successfully! 🎉
        </div>
      )}

      <div className="space-y-4">
        {gateways.map((gateway) => (
          <div
            key={gateway.id}
            className="bg-white border border-neutral-200 rounded-xl p-4"
          >
            {/* Gateway Toggle */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-neutral-600">{gateway.icon}</span>
                <span className="font-medium text-neutral-900">{gateway.name}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={gateway.enabled}
                  onChange={() => toggleGateway(gateway.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-900"></div>
              </label>
            </div>

            {/* Credential Fields (shown when enabled) */}
            {gateway.enabled && (
              <div className="space-y-2 mt-3 pt-3 border-t border-neutral-200">
                {Object.entries(gateway.credentials).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-neutral-600 capitalize mb-0.5">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        updateCredential(gateway.id, key, e.target.value)
                      }
                      className="w-full text-black border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
                      placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}