import Link from 'next/link';

/**
 * 404 Not Found page
 * Displayed when a page cannot be found
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* 404 Illustration */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="text-9xl font-bold text-neutral-200">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <svg
                  className="h-8 w-8 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 9.75H12m-4.5 0a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm0 0H4.5M12 9.75h3.75m-3.75 0a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm0 0H4.5m7.5 7.5H12m-4.5 0a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm0 0H4.5m7.5-3h3.75m-3.75 0a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm0 0H4.5"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-neutral-900">Page not found</h1>
          <p className="text-neutral-600">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            Go to home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-300"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
