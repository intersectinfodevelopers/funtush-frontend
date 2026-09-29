'use client';

import Link from 'next/link';
import { Briefcase, User } from 'lucide-react';
import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel';

export default function RegisterChoosePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">
        <AuthLeftPanel />
        <div className="flex items-center justify-center bg-white px-8 py-10 sm:px-12">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold text-neutral-900">Create your account</h1>
            <p className="mt-1 text-sm text-neutral-500">How will you use Funtush?</p>
            <div className="mt-6 space-y-3">
              <Link href="/register/agency" className="flex items-start gap-3 rounded-2xl border border-neutral-200 p-4 hover:border-primary-400 hover:bg-primary-50">
                <span className="rounded-xl bg-primary-100 p-2 text-primary-700"><Briefcase className="h-5 w-5" /></span>
                <span><span className="block font-semibold text-neutral-900">I run a trekking agency</span><span className="text-sm text-neutral-500">Sell treks, manage bookings and your team, get your own website. 30-day trial.</span></span>
              </Link>
              <Link href="/register/trekker" className="flex items-start gap-3 rounded-2xl border border-neutral-200 p-4 hover:border-primary-400 hover:bg-primary-50">
                <span className="rounded-xl bg-success-50 p-2 text-success-700"><User className="h-5 w-5" /></span>
                <span><span className="block font-semibold text-neutral-900">I&apos;m a trekker</span><span className="text-sm text-neutral-500">Discover treks, book with trusted agencies, stay safe on the trail.</span></span>
              </Link>
            </div>
            <p className="mt-6 text-center text-sm text-neutral-500">Already have an account? <Link href="/login" className="font-semibold text-primary-700 hover:underline">Log in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
