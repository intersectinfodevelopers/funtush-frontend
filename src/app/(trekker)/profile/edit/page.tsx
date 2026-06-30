'use client';

/**
 * Profile Edit Page
 * 
 * Two forms:
 * 1. Profile info (name, phone, country)
 * 2. Emergency contact (name, phone, relationship)
 * 
 * Saved to localStorage on submit
 */

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Shield, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '@/hooks/useAuth';
import {
  updateSession,
  saveEmergencyContact,
  getEmergencyContact,
} from '@/lib/auth';
import type { EmergencyContact } from '@/types/user';

export default function ProfileEditPage() {
  const { user } = useAuth();

  const [name, setName] = useState(() => user?.name ?? '');
  const [phone, setPhone] = useState(() => user?.phone || '');
  const [country, setCountry] = useState(() => user?.country || '');
  const [profileSaving, setProfileSaving] = useState(false);

  const existingEmergency = getEmergencyContact();
  const [emName, setEmName] = useState(() => existingEmergency?.name ?? '');
  const [emPhone, setEmPhone] = useState(() => existingEmergency?.phone ?? '');
  const [emRelationship, setEmRelationship] = useState(() => existingEmergency?.relationship ?? '');
  const [emSaving, setEmSaving] = useState(false);

  function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setProfileSaving(true);
    updateSession({ name: name.trim(), phone: phone.trim(), country: country.trim() });

    setTimeout(() => {
      setProfileSaving(false);
      toast.success('Profile updated');
    }, 300);
  }

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
    }, 300);
  }

  if (!user) {
    return <div className="text-center text-sm text-neutral-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">

      <Link
        href="/profile"
        className="flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to profile
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Edit Profile</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Update your personal info and emergency contact
        </p>
      </div>

      <form
        onSubmit={handleProfileSubmit}
        className="rounded-xl border border-neutral-200 bg-white p-6"
      >
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-4">
          <UserIcon className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-neutral-900">Personal Info</h2>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">

          <FormField label="Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="Your full name"
            />
          </FormField>

          <FormField label="Email (read-only)">
            <input
              type="email"
              value={user.email}
              disabled
              className="form-input bg-neutral-50 text-neutral-500"
            />
          </FormField>

          <FormField label="Phone">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input"
              placeholder="+977-9XXXXXXXXX"
            />
          </FormField>

          <FormField label="Country">
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="form-input"
              placeholder="e.g. Nepal"
            />
          </FormField>

        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={profileSaving}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {profileSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>

      <form
        onSubmit={handleEmergencySubmit}
        className="rounded-xl border border-neutral-200 bg-white p-6"
      >
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-4">
          <Shield className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold text-neutral-900">Emergency Contact</h2>
        </div>

        <p className="mt-2 text-xs text-neutral-500">
          This person will be contacted in case of emergency during your trek
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">

          <FormField label="Contact name">
            <input
              type="text"
              value={emName}
              onChange={(e) => setEmName(e.target.value)}
              className="form-input"
              placeholder="Full name"
            />
          </FormField>

          <FormField label="Phone">
            <input
              type="tel"
              value={emPhone}
              onChange={(e) => setEmPhone(e.target.value)}
              className="form-input"
              placeholder="+977-9XXXXXXXXX"
            />
          </FormField>

          <FormField label="Relationship">
            <input
              type="text"
              value={emRelationship}
              onChange={(e) => setEmRelationship(e.target.value)}
              className="form-input"
              placeholder="e.g. Spouse, Parent"
            />
          </FormField>

        </div>

        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={emSaving}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {emSaving ? 'Saving...' : 'Save Emergency Contact'}
          </button>
        </div>
      </form>

     
      <style jsx>{`
        .form-input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(212, 212, 216);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(23, 23, 23);
          outline: none;
        }
        .form-input:focus {
          border-color: rgb(59, 130, 246);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}


function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium uppercase tracking-wide text-neutral-600">
        {label}
      </label>
      {children}
    </div>
  );
}