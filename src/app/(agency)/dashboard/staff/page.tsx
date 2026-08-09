'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, Eye, KeyRound, Pencil, Plus, Trash2 } from 'lucide-react';
import { useStaff } from '@/hooks/useStaff';
import AddStaffModal from '@/components/agency/staff/AddStaffModal';
import { PERMISSION_SECTIONS, roleLabel, useRoles } from '@/hooks/useRoles';

const initials = (name: string) => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

export default function StaffPage() {
  const { staff, toggleActive, addStaff, deleteStaff } = useStaff();
  const { roles } = useRoles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0];

  type AddStaffData = Parameters<typeof addStaff>[0];
  const removeStaff = (id: string) => {
    if (window.confirm('Remove this staff member?')) deleteStaff(id);
  };

  return <div className="mx-auto max-w-362.5 space-y-6">
    <header className="flex flex-col gap-4 border-b border-neutral-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Staff &amp; Roles</h1>
        <div className="mt-3 flex items-center gap-2 text-sm"><span className="text-neutral-500">Staff</span><ChevronRight size={16} className="text-neutral-400" /><span className="font-semibold text-primary-600">All Staff</span></div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/roles/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-neutral-100 hover:bg-neutral-50"><Plus size={25} strokeWidth={2.5} /> Create Role</Link>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"><Plus size={22} /> Create Staff</button>
      </div>
    </header>

    <div className="grid gap-5 xl:grid-cols-[.82fr_1.18fr]">
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
        <div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-2xl font-bold text-neutral-950">Custom Roles</h2><span className="text-sm font-medium text-neutral-400">Stored locally</span></div>
        <div className="space-y-2">{roles.map((role, index) => {
          const active = role.id === selectedRole?.id;
          const memberCount = staff.filter((member) => member.role === role.id).length;
          return <div key={role.id} className={`flex items-center gap-3 rounded-xl p-3 transition ${active ? 'bg-primary-50 ring-1 ring-primary-100' : 'hover:bg-neutral-50'}`}>
            <button onClick={() => setSelectedRoleId(role.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${index % 2 ? 'bg-success-500' : 'bg-primary-600'} text-white`}><KeyRound size={18} /></span>
              <span className="min-w-0 flex-1"><strong className="block truncate text-base text-neutral-900">{role.name}</strong><small className="mt-1 block truncate text-xs text-neutral-400">{role.permissions.length === 10 ? 'Full agency access' : `${role.permissions.map((item) => item[0].toUpperCase() + item.slice(1)).join(' · ')}`} · {memberCount} staff</small></span>
            </button>
            <Link href={`/dashboard/roles/${role.id}`} className="rounded-md bg-warning-100 p-2 text-warning-600 hover:bg-warning-200" aria-label={`Edit ${role.name}`}><Pencil size={18} /></Link>
          </div>;
        })}</div>
        <Link href="/dashboard/roles" className="mt-5 inline-flex text-sm font-semibold text-primary-600 hover:underline">Manage all roles</Link>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-100 sm:p-5">
        <h2 className="text-2xl font-bold text-neutral-950">Permissions - {selectedRole?.name ?? 'Role'}</h2>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">{PERMISSION_SECTIONS.map((section) => {
          const allowed = Boolean(selectedRole?.permissions.includes(section.toLowerCase()));
          return <div key={section} className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-3"><span className="text-sm font-semibold text-neutral-800">{section}: Access</span><span className={`flex h-8 w-14 items-center rounded-full p-1 ${allowed ? 'justify-end bg-primary-600' : 'justify-start bg-neutral-300'}`}><span className="h-6 w-6 rounded-full bg-white shadow-sm" /></span></div>;
        })}</div>
        <p className="mt-3 text-sm font-medium text-neutral-400">Changes apply after you save the role.</p>
      </section>
    </div>

    <section className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-neutral-100">
      <table className="min-w-362.5 w-full text-left">
        <thead className="bg-warning-50/70"><tr className="text-xs font-bold uppercase tracking-wide text-neutral-900"><th className="px-5 py-4">S.N</th><th className="px-5 py-4">Staff Member</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Phone Number</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Actions</th></tr></thead>
        <tbody className="divide-y divide-neutral-100">{staff.map((member, index) => <tr key={member.id} className="hover:bg-neutral-50/80"><td className="px-5 py-5"><span className="grid h-11 w-11 place-items-center rounded-full bg-primary-50 font-bold text-neutral-900">{index + 1}</span></td><td className="px-5 py-5"><Link href={`/dashboard/staff/${member.id}`} className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-success-500 font-semibold text-white">{initials(member.name)}</span><span><strong className="block text-sm text-neutral-950">{member.name}</strong><small className="mt-1 block text-xs text-neutral-500">{member.email}</small></span></Link></td><td className="px-5 py-5 text-sm font-semibold text-neutral-800">{roleLabel(member.role, roles)}</td><td className="px-5 py-5 text-sm font-semibold text-neutral-800">{member.phone || '—'}</td><td className="px-5 py-5 text-sm font-medium text-warning-600">{member.email}</td><td className="px-5 py-5"><button onClick={() => toggleActive(member.id)} className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${member.active ? 'bg-success-100 text-success-600' : 'bg-neutral-100 text-neutral-500'}`}><Check size={14} className={`rounded-full p-0.5 ${member.active ? 'bg-success-400 text-white' : 'bg-neutral-400 text-white'}`} />{member.active ? 'Active' : 'Inactive'}</button></td><td className="px-5 py-5"><div className="flex gap-2"><Link href={`/dashboard/staff/${member.id}`} className="rounded-md bg-warning-100 p-2 text-warning-600 hover:bg-warning-200" aria-label={`Edit ${member.name}`}><Pencil size={18} /></Link><Link href={`/dashboard/staff/${member.id}`} className="rounded-md bg-primary-100 p-2 text-primary-600 hover:bg-primary-200" aria-label={`View ${member.name}`}><Eye size={18} /></Link><button onClick={() => removeStaff(member.id)} className="rounded-md bg-danger-100 p-2 text-danger-500 hover:bg-danger-200" aria-label={`Remove ${member.name}`}><Trash2 size={18} /></button></div></td></tr>)}</tbody>
      </table>
    </section>

    <AddStaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={(data: AddStaffData) => addStaff(data)} />
  </div>;
}
