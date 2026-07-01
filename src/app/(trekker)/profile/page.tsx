'use client';

/**
 * Profile Page
 * Shows user info: name, email, phone, country, member since
 */

import Link from 'next/link';
import { Mail, Phone, Globe, Calendar, User as UserIcon, Pencil, Shield } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { getEmergencyContact } from '@/lib/auth';



function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}


export default function ProfilePage() {
  const { user } = useAuth();
  const emergency = getEmergencyContact();

  if (!user) {
    return (
      <div className="text-center text-sm text-neutral-500">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Profile</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Your personal information and emergency contact
          </p>
        </div>

        <Link
          href="/profile/edit"
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
        >
          <Pencil className="h-4 w-4" />
          Edit Profile
        </Link>
      </div>

      
      <div className="rounded-xl border border-neutral-200 bg-white p-6">

        
        <div className="flex items-center gap-4 border-b border-neutral-100 pb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <UserIcon className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">{user.name}</h2>
            <p className="text-sm capitalize text-neutral-500">{user.role.replace('_', ' ')}</p>
          </div>
        </div>

       
        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
          <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={user.phone || 'Not provided'} />
          <InfoRow icon={<Globe className="h-4 w-4" />} label="Country" value={user.country || 'Not provided'} />
          <InfoRow icon={<Calendar className="h-4 w-4" />} label="Member since" value={formatDate(user.member_since)} />

        </div>
      </div>

      
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold text-neutral-900">Emergency Contact</h2>
        </div>

        {emergency ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <InfoRow icon={<UserIcon className="h-4 w-4" />} label="Name" value={emergency.name} />
            <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={emergency.phone} />
            <InfoRow icon={<UserIcon className="h-4 w-4" />} label="Relationship" value={emergency.relationship} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-neutral-500">
            No emergency contact added yet.{' '}
            <Link href="/profile/edit" className="text-primary-600 hover:underline">
              Add one now
            </Link>
          </p>
        )}
      </div>

    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}