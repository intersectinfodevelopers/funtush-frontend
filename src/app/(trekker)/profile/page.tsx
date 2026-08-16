'use client';

/**
 * Profile Page 
 */

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import {
  Lock,
  LogOut,
  Save,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '@/hooks/useAuth';
import {
  updateSession,
  saveEmergencyContact,
  getEmergencyContact,
} from '@/lib/auth';
import type { EmergencyContact } from '@/types/user';

// ─── Helpers ───────────────────────────────

function formatMemberSince(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getCountryFlag(country: string): string {
  // Map country names to flag emojis (simple)
  const flags: Record<string, string> = {
    Nepal: '🇳🇵',
    France: '🇫🇷',
    USA: '🇺🇸',
    UK: '🇬🇧',
    India: '🇮🇳',
    Germany: '🇩🇪',
    Japan: '🇯🇵',
    China: '🇨🇳',
  };
  return flags[country] ?? '🌍';
}

// ─── Component ───────────────────────────────

export default function ProfilePage() {
  const { user, logout } = useAuth();

  // ── Personal Info State ──
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // ── Emergency Contact State ──
  const [emName, setEmName] = useState('');
  const [emPhone, setEmPhone] = useState('');
  const [emRelationship, setEmRelationship] = useState('');
  const [emSaving, setEmSaving] = useState(false);

  // Load user data on mount
  // Hydrate local state asynchronously from `user` and local storage to avoid
  // synchronous setState calls inside effect.
  useEffect(() => {
    const t = setTimeout(() => {
      if (user) {
        setFullName(user.name);
        setEmail(user.email);
        setPhone(user.phone || '');
        setCountry(user.country || '');
      }

      const existing = getEmergencyContact();
      if (existing) {
        setEmName(existing.name);
        setEmPhone(existing.phone);
        setEmRelationship(existing.relationship);
      }
    }, 0);
    return () => clearTimeout(t);
  }, [user]);

  // ── Save Personal Info ──
  function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    setProfileSaving(true);
    updateSession({
      name: fullName.trim(),
      phone: phone.trim(),
      country: country.trim(),
    });

    setTimeout(() => {
      setProfileSaving(false);
      toast.success('Profile updated successfully');
    }, 400);
  }

  // ── Save Emergency Contact ──
  function handleEmergencySubmit(e: FormEvent) {
    e.preventDefault();

    if (!emName.trim() || !emPhone.trim() || !emRelationship.trim()) {
      toast.error('All emergency contact fields are required');
      return;
    }

    const contact: EmergencyContact = {
      name: emName.trim(),
      phone: emPhone.trim(),
      relationship: emRelationship.trim(),
    };

    setEmSaving(true);
    saveEmergencyContact(contact);

    setTimeout(() => {
      setEmSaving(false);
      toast.success('Emergency contact saved');
    }, 400);
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="text-center text-sm text-neutral-500">Loading...</div>
      </div>
    );
  }

  const initials = getInitials(user.name);
  const flag = getCountryFlag(user.country);
  const memberSince = formatMemberSince(user.member_since);

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      {/* ═══════════════════════════════════════════ */}
      {/* HEADER — Purple Gradient Banner + Avatar   */}
      {/* ═══════════════════════════════════════════ */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">

        {/* Gradient Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-500" />

        {/* Avatar + Info */}
        <div className="px-6 pb-6">
          <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-pink-400 to-purple-500 text-2xl font-bold text-white shadow-md">
            {initials}
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-neutral-900">
              {user.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <span>{flag}</span>
                <span>{user.country || 'Unknown'}</span>
              </span>
              <span>·</span>
              <span>Member since {memberSince}</span>
              <span>·</span>
              <span>5 treks completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* PERSONAL INFO                              */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-neutral-900">
          Personal Information
        </h2>

        <form onSubmit={handleProfileSubmit} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full Name">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
              />
            </FormField>

            <FormField label="Email">
              <input
                type="email"
                value={email}
                disabled
                className="form-input bg-neutral-50 text-neutral-500 cursor-not-allowed"
              />
            </FormField>

            <FormField label="Phone">
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d\s+\-()]/g, '');
                  setPhone(value);
                }}
                className="form-input"
              />
            </FormField>

            <FormField label="Country">
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="form-input"
              />
            </FormField>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {profileSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* EMERGENCY CONTACT                          */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-neutral-900">
          Emergency Contact
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Shared with your assigned guide during active treks
        </p>

        <form onSubmit={handleEmergencySubmit} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Contact Name">
              <input
                type="text"
                value={emName}
                onChange={(e) => setEmName(e.target.value)}
                placeholder="Marc Laurent"
                className="form-input"
              />
            </FormField>

            <FormField label="Relationship">
              <input
                type="text"
                value={emRelationship}
                onChange={(e) => setEmRelationship(e.target.value)}
                placeholder="Spouse"
                className="form-input"
              />
            </FormField>
          </div>

          <FormField label="Phone Number">
            <input
              type="tel"
              value={emPhone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d\s+\-()]/g, '');
                setEmPhone(value);
              }}
              placeholder="+33 6 98 76 54 32"
              className="form-input"
            />
          </FormField>

          <div className="pt-2">
            <button
              type="submit"
              disabled={emSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {emSaving ? 'Saving...' : 'Save Emergency Contact'}
            </button>
          </div>
        </form>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* ACCOUNT SECTION                            */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <h2 className="border-b border-neutral-100 px-6 py-4 text-lg font-bold text-neutral-900">
          Account
        </h2>

        <div className="divide-y divide-neutral-100">

          {/* Change Password */}
          <Link
            href="/forgot-password"
            className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-neutral-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
              <Lock className="h-5 w-5 text-neutral-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-900">
                Change Password
              </p>
              <p className="text-xs text-neutral-500">
                Update your login password
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </Link>

          {/* Log Out */}
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-danger-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-100">
              <LogOut className="h-5 w-5 text-danger-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-danger-600">
                Log Out
              </p>
              <p className="text-xs text-neutral-500">
                Sign out of your Funtush account
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </button>

        </div>
      </div>

      {/* Inline form-input styling */}
      <style jsx>{`
        .form-input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(212, 212, 216);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(23, 23, 23);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .form-input:focus {
          border-color: rgb(26, 95, 168);
          box-shadow: 0 0 0 3px rgba(26, 95, 168, 0.1);
        }
      `}</style>
    </div>
  );
}

// ─── Form Field Wrapper ────────────────────

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-neutral-700">
        {label}
      </label>
      {children}
    </div>
  );
}