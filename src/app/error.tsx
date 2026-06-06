'use client';

import Link from 'next/link';

/**
 * Global error boundary
 * Catches errors in the root layout and nested segments
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-danger-100">
            <svg
              className="h-8 w-8 text-danger-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-neutral-900">Oops! Something went wrong</h1>
          <p className="text-neutral-600">
            We encountered an unexpected error. Please try again or contact support if the problem persists.
          </p>
          {error.message && (
            <p className="rounded-lg bg-danger-50 px-4 py-2 text-sm text-danger-800">
              {error.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-300"
          >
            Go to home
          </Link>
        </div>
      </div>
    </div>
  );
}
