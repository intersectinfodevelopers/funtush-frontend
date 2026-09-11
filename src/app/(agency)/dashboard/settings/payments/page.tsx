'use client';

import { useState } from 'react';
import { Save, CreditCard, Building2, Smartphone, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { SettingsHeader } from '@/components/agency/settings/settings-kit';

/** Fields whose values should be masked like a password (secrets, keys). */
const SECRET_FIELDS = new Set(['secretKey', 'publishableKey', 'publicKey', 'terminalId']);

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
    credentials: { merchantId: '', secretKey: '' },
  },
  {
    id: 'khalti',
    name: 'Khalti',
    icon: <Smartphone size={18} />,
    enabled: false,
    credentials: { publicKey: '', secretKey: '' },
  },
  {
    id: 'fonepay',
    name: 'Fonepay',
    icon: <Smartphone size={18} />,
    enabled: false,
    credentials: { merchantCode: '', terminalId: '' },
  },
  {
    id: 'stripe',
    name: 'Stripe',
    icon: <CreditCard size={18} />,
    enabled: false,
    credentials: { publishableKey: '', secretKey: '' },
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: <Building2 size={18} />,
    enabled: false,
    credentials: { bankName: '', accountNumber: '', accountName: '' },
  },
];

function fieldLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, (c) => c.toUpperCase());
}

/** Every credential field on an enabled gateway must be non-empty to be valid. */
function gatewayIsValid(gateway: PaymentGateway): boolean {
  if (!gateway.enabled) return true;
  return Object.values(gateway.credentials).every((v) => v.trim().length > 0);
}

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
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const anyInvalid = gateways.some((g) => !gatewayIsValid(g));

  const handleSave = () => {
    if (anyInvalid) {
      setTouched(Object.fromEntries(gateways.map((g) => [g.id, true])));
      return;
    }
    localStorage.setItem('paymentSettings', JSON.stringify(gateways));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleGateway = (id: string) => {
    setGateways(gateways.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g)));
  };

  const updateCredential = (gatewayId: string, key: string, value: string) => {
    setGateways(
      gateways.map((g) =>
        g.id === gatewayId ? { ...g, credentials: { ...g.credentials, [key]: value } } : g,
      ),
    );
  };

  const toggleReveal = (id: string, key: string) => {
    const k = `${id}.${key}`;
    setRevealed((r) => ({ ...r, [k]: !r[k] }));
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Payments"
        description="Configure payment gateways. Only fields required for that gateway are shown."
        action={
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-800 disabled:opacity-50"
          >
            <Save size={18} />
            Save changes
          </button>
        }
      />

      {showToast && (
        <div className="fixed top-4 right-4 bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded-xl shadow-lg z-50">
          Payment settings saved successfully! 🎉
        </div>
      )}

      {anyInvalid && Object.values(touched).some(Boolean) && (
        <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800">
          <AlertCircle size={16} />
          Fill in every field for each enabled gateway before saving.
        </div>
      )}

      <div className="space-y-4">
        {gateways.map((gateway) => {
          const valid = gatewayIsValid(gateway);
          const showErrors = gateway.enabled && touched[gateway.id] && !valid;
          return (
            <div key={gateway.id} className="bg-white border border-neutral-200 rounded-xl p-4">
              {/* Gateway Toggle */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-neutral-600">{gateway.icon}</span>
                  <span className="font-medium text-neutral-900">{gateway.name}</span>
                  {gateway.enabled && (
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        valid
                          ? 'bg-success-50 text-success-700'
                          : 'bg-warning-50 text-warning-700'
                      }`}
                    >
                      {valid ? 'Ready' : 'Incomplete'}
                    </span>
                  )}
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

              {/* Credential Fields (shown when enabled) — only the fields that gateway needs */}
              {gateway.enabled && (
                <div className="space-y-2 mt-3 pt-3 border-t border-neutral-200">
                  {Object.entries(gateway.credentials).map(([key, value]) => {
                    const isSecret = SECRET_FIELDS.has(key);
                    const revealKey = `${gateway.id}.${key}`;
                    const empty = value.trim().length === 0;
                    return (
                      <div key={key}>
                        <label className="block text-xs font-medium text-neutral-600 mb-0.5">
                          {fieldLabel(key)} <span className="text-danger-600">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={isSecret && !revealed[revealKey] ? 'password' : 'text'}
                            value={value}
                            onChange={(e) => updateCredential(gateway.id, key, e.target.value)}
                            className={`w-full text-neutral-900 border rounded-lg px-3 py-1.5 text-sm ${
                              isSecret ? 'pr-9 font-mono' : ''
                            } ${
                              showErrors && empty
                                ? 'border-danger-300 focus:ring-1 focus:ring-danger-400'
                                : 'border-neutral-300'
                            }`}
                            placeholder={`Enter ${fieldLabel(key).toLowerCase()}`}
                          />
                          {isSecret && (
                            <button
                              type="button"
                              onClick={() => toggleReveal(gateway.id, key)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                              aria-label={revealed[revealKey] ? 'Hide value' : 'Show value'}
                            >
                              {revealed[revealKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          )}
                        </div>
                        {showErrors && empty && (
                          <p className="text-xs text-danger-600 mt-0.5">This field is required.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
