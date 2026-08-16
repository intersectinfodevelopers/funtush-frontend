'use client';

import React, { useState, useEffect } from 'react';
import { ROLE_REDIRECT } from '@/lib/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  AlertTriangle,
  ShoppingBag,
  Check,
  Mountain,
  ChevronLeft,
} from 'lucide-react';
import type { UserRole } from '@/types/user';

export const dynamic = 'force-dynamic';

export default function DetailsPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('Sophia Laurent');
  const [phoneNumber, setPhoneNumber] = useState('+33 6 12 34 58 78');
  const [country, setCountry] = useState('');

  const [typeParam, setTypeParam] = useState<string>(() => {
    try {
      if (typeof window === 'undefined') return 'agency';
      const sp = new URLSearchParams(window.location.search);
      return sp.get('type') || 'agency';
    } catch {
      return 'agency';
    }
  });

  // Initializer already reads from window when available; remove redundant effect
  // that re-sets the same value on mount to satisfy lint.

  const role: UserRole = typeParam === 'trekker' ? 'trekker' : 'agency_admin';

  const [showSuccess, setShowSuccess] = useState(false);
  const [showTiers, setShowTiers] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const submitAndShowTiers = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      if (role === 'agency_admin') setShowTiers(true);
      else {
        // For trekkers, create account and redirect to trekker area
        toast.success('Account created — redirecting...');
        const dest = ROLE_REDIRECT[role] ?? '/';
        router.push(dest);
      }
    }, 900);
  };

  const finishTiers = () => {
    setShowTiers(false);
    toast.success(`Selected tier: ${selectedTier ?? 'Free'}`);
    const dest = ROLE_REDIRECT[role] ?? '/';
    router.push(dest);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-neutral-600 p-4 sm:p-6 select-none">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        
        {/* Left Branding Panel */}
        <div className="relative hidden w-[42%] flex-col justify-between bg-[#5B50FB] p-10 text-white md:flex">
          <div className="absolute top-0 left-0 h-20 w-20 rounded-br-full bg-white/10" />

          <div className="relative z-10 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#5B50FB]">
              <Mountain className="h-5 w-5 fill-current" />
            </div>
            <span className="text-2xl font-black tracking-wide uppercase">FUNTUSH</span>
          </div>

          <div className="relative z-10 my-auto space-y-4 py-8">
            <h1 className="text-xl font-bold leading-snug">
              Your treks, your guide contacts, your safety, all in one place.
            </h1>
            <p className="text-xs font-normal text-white/80 leading-relaxed">
              Log in to see your upcoming departures, chat with your guide, and access live SOS during your trek.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                  <MapPin className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-medium text-white">Real-time trek tracking</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                  <AlertTriangle className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-medium text-white">One-tap emergency SOS</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                  <ShoppingBag className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-medium text-white">Digital packing checklist</span>
              </div>
            </div>
          </div>

          <div />
        </div>

        {/* Right Form Panel */}
        <div className="flex w-full flex-col justify-center px-8 py-10 md:w-[58%] md:px-14">
          <div className="mx-auto w-full max-w-sm">
            
            {/* Step Bar (Step 2 Active) */}
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5B50FB] text-xs font-bold text-white">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <span className="text-xs font-semibold text-[#5B50FB]">Account</span>
              </div>

              <div className="h-[1px] w-24 bg-[#5B50FB]" />

              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-neutral-800 text-xs font-bold text-neutral-800">
                  2
                </div>
                <span className="text-xs font-bold text-neutral-800">Details</span>
              </div>
            </div>

            {/* Back Button */}
            <Link
              href="/signup"
              className="mb-4 flex items-center gap-1 text-xs font-semibold text-neutral-600 transition hover:text-neutral-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>

            {/* Form Title */}
            <div className="mb-6 text-left">
              <h2 className="text-2xl font-black text-neutral-900">
                Tell us about you
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                Just a few details and you're in
              </p>
            </div>

            {/* Form */}
            <form onSubmit={submitAndShowTiers} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Sophia Laurent"
                  className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-800 outline-none focus:border-[#5B50FB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+33 6 12 34 58 78"
                    className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-800 outline-none focus:border-[#5B50FB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-800 outline-none focus:border-[#5B50FB]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full cursor-pointer rounded-xl bg-[#5B50FB] py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#4a3fe4] active:scale-[0.99]"
              >
                Create account
              </button>

              <p className="pt-2 text-center text-[11px] text-neutral-500">
                You'll be redirected to <span className="font-bold text-neutral-800">My Treks</span> right away.
              </p>
            </form>

            {/* Success Modal */}
            {showSuccess && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 w-[420px] rounded-xl bg-white p-6 text-center shadow-xl">
                  <div className="mb-4 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-neutral-900">Account created</h3>
                  <p className="text-sm text-neutral-600">Your account has been created successfully.</p>
                </div>
              </div>
            )}

            {/* Tier Selector Modal */}
            {showTiers && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Choose a tier</h3>
                    <button onClick={() => { setShowTiers(false); router.push('/dashboard'); }} className="text-sm text-neutral-500">Skip</button>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {['Free','Basic','Premium','Enterprise'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTier(t)}
                        className={`rounded-lg border p-4 text-left transition ${selectedTier===t ? 'border-[#5B50FB] bg-[#F1F0FF]' : 'border-neutral-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className={`h-8 w-8 rounded-md ${selectedTier===t ? 'bg-[#5B50FB] text-white' : 'bg-neutral-100 text-neutral-600'}`} />
                          <div className={`h-5 w-5 rounded-full border ${selectedTier===t ? 'border-[#5B50FB] bg-[#5B50FB]' : 'border-neutral-300'}`} />
                        </div>
                        <p className="mt-3 text-sm font-semibold">{t}</p>
                        <p className="mt-1 text-xs text-neutral-500">{t === 'Free' ? 'Start free' : t === 'Basic' ? 'For small teams' : t === 'Premium' ? 'Most popular' : 'Enterprise features'}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button disabled={!selectedTier} onClick={finishTiers} className="rounded-lg bg-[#5B50FB] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Continue</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}