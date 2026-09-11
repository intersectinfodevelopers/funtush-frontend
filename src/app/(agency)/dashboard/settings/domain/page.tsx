'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Save,
  Copy,
  CheckCircle,
  Globe,
  Lock,
  Loader2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { SettingsHeader } from '@/components/agency/settings/settings-kit';

/**
 * Every trekker who signs up gets a free `{subdomain}.funtush.com` site — that
 * part is automatic and never gated. A custom domain is a Large-plan feature:
 * connecting one needs a DNS record added at the agency's own registrar, which
 * is worth an agency paying for rather than something every trial account gets.
 */
const CUSTOM_DOMAIN_TIER = 'large';

type VerificationStatus = 'none' | 'pending' | 'verified' | 'failed';

type DomainSettings = {
  subdomain: string;
  customDomain: string;
  status: VerificationStatus;
  /** Per-domain token so the TXT record changes if the domain changes. */
  verificationToken: string;
};

function randomToken(): string {
  return Array.from({ length: 24 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
}

const defaultSettings: DomainSettings = {
  subdomain: 'youragency',
  customDomain: '',
  status: 'none',
  verificationToken: '',
};

const getInitialSettings = (): DomainSettings => {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const stored = localStorage.getItem('domainSettings');
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch (error) {
    console.error('Failed to parse domain settings:', error);
  }
  return defaultSettings;
};

const getCurrentTier = (): string => {
  if (typeof window === 'undefined') return 'free';
  try {
    return localStorage.getItem('subscriptionTier') || 'free';
  } catch {
    return 'free';
  }
};

function isValidDomain(value: string): boolean {
  // Bare registrable domain, no scheme/path — "example.com", "trek.example.co.uk".
  return /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z0-9-]{1,63})+$/i.test(value.trim());
}

export default function DomainSettingsPage() {
  const [settings, setSettings] = useState<DomainSettings>(getInitialSettings);
  const [tier] = useState<string>(getCurrentTier);
  const [showToast, setShowToast] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [domainInput, setDomainInput] = useState(settings.customDomain);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const canUseCustomDomain = tier === CUSTOM_DOMAIN_TIER;

  const persist = (next: DomainSettings) => {
    setSettings(next);
    localStorage.setItem('domainSettings', JSON.stringify(next));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const connectDomain = () => {
    const trimmed = domainInput.trim().toLowerCase();
    if (!isValidDomain(trimmed)) {
      setDomainError('Enter a domain like trekkingagency.com — no https:// or trailing slash.');
      return;
    }
    setDomainError(null);
    persist({
      ...settings,
      customDomain: trimmed,
      status: 'pending',
      verificationToken: randomToken(),
    });
  };

  const disconnectDomain = () => {
    setDomainInput('');
    setDomainError(null);
    persist({ ...settings, customDomain: '', status: 'none', verificationToken: '' });
  };

  // Mock DNS check — in production this queries the domain's real CNAME/TXT
  // records. Here it simulates the lookup and succeeds after a short delay so
  // the verification flow is demonstrable without live DNS.
  const verifyDomain = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      persist({ ...settings, status: 'verified' });
    }, 1800);
  };

  const platformEdge = `${settings.subdomain}.funtush.com`;

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Domain"
        description="Every agency gets a free subdomain. Connect your own domain on the Large plan."
      />

      {showToast && (
        <div className="fixed top-4 right-4 bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded-xl shadow-lg z-50">
          Domain settings saved! 🎉
        </div>
      )}

      <div className="space-y-6">
        {/* Free Subdomain — always on, every tier */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Your Funtush subdomain
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-sm text-neutral-700 font-mono">
              {platformEdge}
            </div>
            <button
              onClick={() => handleCopy('subdomain', platformEdge)}
              className="flex items-center gap-2 px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors"
            >
              {copiedKey === 'subdomain' ? (
                <CheckCircle size={16} className="text-success-700" />
              ) : (
                <Copy size={16} />
              )}
              {copiedKey === 'subdomain' ? 'Copied!' : 'Copy'}
            </button>
            <a
              href={`https://${platformEdge}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors whitespace-nowrap"
            >
              Visit site
            </a>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Live the moment you sign up — free on every plan, and it never goes away even if you
            also connect a custom domain below.
          </p>
        </div>

        {/* Custom Domain — Large plan only */}
        {!canUseCustomDomain ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
              <Lock size={22} />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-neutral-900">
              Custom domains are a Large-plan feature
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Point your own domain — like trekkingagency.com — at your Funtush site. Upgrade to
              unlock it.
            </p>
            <Link
              href="/dashboard/settings/subscription"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
            >
              View plans
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white border border-neutral-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-neutral-700">Custom Domain</label>
                <StatusPill status={settings.status} />
              </div>

              {settings.status === 'none' ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <input
                      type="text"
                      value={domainInput}
                      onChange={(e) => {
                        setDomainInput(e.target.value);
                        setDomainError(null);
                      }}
                      className="flex-1 text-neutral-900 border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
                      placeholder="trekkingagency.com"
                    />
                    <button
                      onClick={connectDomain}
                      className="flex items-center justify-center gap-2 bg-primary-900 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-primary-800 transition-colors whitespace-nowrap"
                    >
                      <Save size={16} />
                      Connect domain
                    </button>
                  </div>
                  {domainError && <p className="text-xs text-danger-600 mt-1.5">{domainError}</p>}
                  <p className="text-xs text-neutral-500 mt-1.5">
                    Enter the domain exactly as you own it — no https:// or www.
                  </p>
                </>
              ) : (
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="font-mono text-sm text-neutral-800">{settings.customDomain}</span>
                  <div className="flex gap-2">
                    {settings.status !== 'verified' && (
                      <button
                        onClick={verifyDomain}
                        disabled={verifying}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors disabled:opacity-60"
                      >
                        {verifying ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <RefreshCw size={14} />
                        )}
                        {verifying ? 'Checking DNS…' : 'Verify DNS'}
                      </button>
                    )}
                    <button
                      onClick={disconnectDomain}
                      className="px-3 py-1.5 border border-danger-200 bg-danger-50 text-danger-700 rounded-lg text-sm hover:bg-danger-100 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* DNS instructions — shown once a domain is connected and not yet verified */}
            {settings.customDomain && settings.status !== 'verified' && (
              <div className="bg-white border border-neutral-200 rounded-xl p-4">
                <h3 className="text-sm font-medium text-neutral-700 mb-1">Add these DNS records</h3>
                <p className="text-sm text-neutral-600 mb-3">
                  In your domain registrar&apos;s DNS settings (GoDaddy, Namecheap, Cloudflare, etc.), add
                  both records below, then come back and press{' '}
                  <span className="font-medium">Verify DNS</span>.
                </p>

                <DnsRecordRow
                  label="1. Point the domain at Funtush"
                  type="CNAME"
                  name="www"
                  value={platformEdge}
                  onCopy={() => handleCopy('cname', platformEdge)}
                  copied={copiedKey === 'cname'}
                />
                <DnsRecordRow
                  label="2. Prove you own it"
                  type="TXT"
                  name="_funtush-verify"
                  value={settings.verificationToken}
                  onCopy={() => handleCopy('txt', settings.verificationToken)}
                  copied={copiedKey === 'txt'}
                  mono
                />

                <p className="text-xs text-neutral-500 mt-3">
                  Using the bare domain (no www)? Most registrars call the root-domain equivalent of
                  a CNAME an &quot;ALIAS&quot; or &quot;ANAME&quot; record — point it at the same
                  value.
                </p>
              </div>
            )}

            {settings.status === 'verified' && (
              <div className="bg-success-50 border border-success-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle size={20} className="text-success-700 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-success-800">
                    {settings.customDomain} is live
                  </h4>
                  <p className="text-sm text-success-700 mt-1">
                    Visitors to your custom domain now see your Funtush site. Your free subdomain
                    keeps working too.
                  </p>
                </div>
              </div>
            )}

            {settings.status === 'pending' && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Globe size={20} className="text-primary-700 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-primary-800">DNS propagation</h4>
                    <p className="text-sm text-primary-700 mt-1">
                      DNS changes can take up to 48 hours to propagate. Press &quot;Verify DNS&quot;
                      any time — we&apos;ll keep checking until it&apos;s detected.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: VerificationStatus }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700">
        <CheckCircle size={12} /> Verified &amp; live
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2.5 py-1 text-xs font-semibold text-warning-700">
        <Loader2 size={12} /> Pending verification
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-danger-50 px-2.5 py-1 text-xs font-semibold text-danger-700">
        <XCircle size={12} /> Not detected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500">
      Not connected
    </span>
  );
}

function DnsRecordRow({
  label,
  type,
  name,
  value,
  onCopy,
  copied,
  mono,
}: {
  label: string;
  type: string;
  name: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  mono?: boolean;
}) {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 mb-2 last:mb-0">
      <p className="text-xs font-semibold text-neutral-500 mb-2">{label}</p>
      <div className="grid grid-cols-[3.5rem_1fr] sm:grid-cols-[3.5rem_6rem_1fr_auto] gap-2 items-center text-sm">
        <span className="text-neutral-500 sm:hidden">Type</span>
        <span className="font-mono font-medium">{type}</span>
        <span className="text-neutral-500 sm:hidden">Name</span>
        <span className="font-mono font-medium">{name}</span>
        <span className={`font-mono font-medium truncate ${mono ? 'text-xs' : ''}`}>{value}</span>
        <button onClick={onCopy} className="text-primary-700 hover:text-primary-800 justify-self-start">
          {copied ? <CheckCircle size={14} className="text-success-700" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}
