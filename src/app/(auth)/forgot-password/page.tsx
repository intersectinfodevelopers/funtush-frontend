'use client';

/**
 * Forgot Password Page
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel';
import { ROUTES } from '@/lib/constants/routes';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function validateEmail(value: string) {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
    return '';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const emailErr = validateEmail(email.trim());
    if (emailErr) {
      toast.error(emailErr);
      setIsLoading(false);
      return;
    }

    // Mock: pretend we sent an email, then redirect
    setTimeout(() => {
      setIsLoading(false);
      router.push(`${ROUTES.AUTH.FORGOT_PASSWORD_CHECK}?email=${encodeURIComponent(email.trim())}`);
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-8">

      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">

        {/* LEFT — Purple Panel */}
        <AuthLeftPanel />

        {/* RIGHT — Forgot Password Form */}
        <div className="flex items-center justify-center bg-white px-8 py-10 sm:px-12">

          <div className="w-full max-w-sm">

            {/* Back to login */}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to login
            </Link>

            <h2 className="mt-6 text-2xl font-bold text-neutral-900">Forget Password?</h2>
            <p className="mt-1 text-sm text-neutral-500">
              No worries! Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-neutral-900">
                  Email
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    className="w-full rounded-lg border bg-white pl-9 pr-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:ring-2 border-neutral-300 focus:border-primary-500 focus:ring-primary-100"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {isLoading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            {/* Footer link */}
            <p className="mt-6 text-center text-sm text-neutral-700">
              Remember your password?{' '}
              <Link href={ROUTES.AUTH.LOGIN} className="font-semibold text-primary-600 hover:underline">
                Login
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}