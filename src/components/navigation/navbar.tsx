import React, { useState } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Destinations', href: '/destinations' },
    { label: 'Agencies', href: '/agencies' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          
          {/* Logo and Main Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-black tracking-tight text-blue-600 flex items-center gap-2">
              <span>FUNTUSH</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.label} 
                  href={link.href} 
                  className="text-sm font-medium text-neutral-600 hover:text-blue-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* User Profile Desktop Menu */}
          <div className="hidden md:flex items-center gap-4 relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-neutral-100 transition-colors focus:outline-none"
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-sm shadow-sm">
                SC
              </div>
            </button>

            {/* Native Dropdown Panel Menu Layout */}
            {isUserDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsUserDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg z-20">
                  <div className="px-3 py-2 border-b border-neutral-100">
                    <p className="text-sm font-semibold text-neutral-800">Sandesh Chaudhary</p>
                    <p className="text-xs text-neutral-500 truncate">sandesh@example.com</p>
                  </div>
                  <button 
                    onClick={() => console.log('Profile')}
                    className="w-full text-left px-3 py-2 text-sm rounded-md text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <User className="h-4 w-4 text-neutral-400" /> Profile Settings
                  </button>
                  <div className="border-t border-neutral-100 my-1" />
                  <button 
                    onClick={() => console.log('Logout')}
                    className="w-full text-left px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Logout Account
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Hamburg Container Trigger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-neutral-500 hover:bg-neutral-100 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Links */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-inner">
          {navLinks.map((link) => (
            <Link 
              key={link.label} 
              href={link.href} 
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-neutral-100 pt-4 mt-4 flex items-center gap-3 px-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-sm shadow-sm">
              SC
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800">Sandesh Chaudhary</p>
              <button 
                onClick={() => console.log('Logout')}
                className="text-xs text-red-600 font-medium flex items-center gap-1 mt-0.5"
              >
                <LogOut className="h-3 w-3" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};