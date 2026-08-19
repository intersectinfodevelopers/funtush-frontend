'use client';

/**
 * Forgot Password — Check Email
 
 */

import  { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';

import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel';
import { ROUTES } from '@/lib/constants/routes';

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? 'your email';

  const [isResending, setIsResending] = useState(false);

  const handleResend = () => {
    setIsResending(true);
    // Mock resend
    setTimeout(() => {
      toast.success('Reset link sent again. Check your inbox.');
      setIsResending(false);
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-8">

      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">

        {/* LEFT — Purple Panel */}
        <AuthLeftPanel />

        {/* RIGHT — Check Email Confirmation */}
        <div className="flex items-center justify-center bg-white px-8 py-10 sm:px-12">

          <div className="w-full max-w-sm text-center">

            {/* Envelope Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
              <Mail className="h-9 w-9 text-primary-600" strokeWidth={1.8} />
            </div>

            {/* Heading */}
            <h2 className="mt-6 text-2xl font-bold text-neutral-900">Check your email</h2>

            {/* Description */}
            <p className="mt-2 text-sm text-neutral-600">
              We&apos;ve sent a password reset link to
            </p>
            <p className="mt-1 text-sm font-medium text-primary-600 break-all">
              {email}
            </p>

            <p className="mt-6 text-sm text-neutral-600">
              Didn&apos;t receive that email? Check your spam folder or try again.
            </p>

            {/* Resend Button */}
            <button
              onClick={handleResend}
              disabled={isResending}
              className="mt-6 w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {isResending ? 'Sending...' : 'Resend email'}
            </button>

            {/* Back to login */}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="mt-10 inline-block text-sm font-semibold text-primary-600 hover:underline"
            >
              Back to login
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-100" />}>
      <CheckEmailContent />
    </Suspense>
  );
}