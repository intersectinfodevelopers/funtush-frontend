/**
 * Marketplace Header Component
 * Logo + Navigation for marketplace
 */

import Image from 'next/image';
import Link from 'next/link';

export function MarketplaceHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/funtush-logo.png"
              alt="Funtush"
              width={40}
              height={40}
              className="h-10 w-10"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/marketplace/packages"
              className="text-neutral-600 hover:text-primary-700 font-medium transition-colors"
            >
              Packages
            </Link>
            <Link
              href="/marketplace/agencies"
              className="text-neutral-600 hover:text-primary-700 font-medium transition-colors"
            >
              Agencies
            </Link>
            <Link
              href="/marketplace/destinations"
              className="text-neutral-600 hover:text-primary-700 font-medium transition-colors"
            >
              Destinations
            </Link>
          </nav>

          {/* Auth Links */}
          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg bg-primary-700 text-white font-medium hover:bg-primary-800 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
