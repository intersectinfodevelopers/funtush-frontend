'use client';

import { useState } from 'react';
import rolesData from '../../../../data/roles.json';

interface StaffData {
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: StaffData) => void;
}

export default function AddStaffModal({ isOpen, onClose, onAdd }: AddStaffModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, email, phone, role });
    // Reset form
    setName('');
    setEmail('');
    setPhone('');
    setRole('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Staff</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="mt-1 block w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
            >
              <option value="">Select a role...</option>
              {rolesData.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 flex-1"
            >
              Add Staff
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border border-neutral-300 px-4 py-2 rounded text-sm hover:bg-neutral-50 flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}