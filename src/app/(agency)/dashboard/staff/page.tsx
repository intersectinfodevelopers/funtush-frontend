'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useStaff } from '@/hooks/useStaff';
import AddStaffModal from '@/components/agency/staff/AddStaffModal';
import rolesData from '../../../../../data/roles.json';

// Helper to format time
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Get role label
const getRoleLabel = (roleValue: string) => {
  const role = rolesData.find((r) => r.value === roleValue);
  return role ? role.label : roleValue;
};

export default function StaffPage() {
  const { staff, toggleActive, addStaff } = useStaff();
  const [isModalOpen, setIsModalOpen] = useState(false);

  type AddStaffData = Parameters<typeof addStaff>[0];

  const handleAddStaff = (data: AddStaffData) => {
    addStaff(data);
  }

  return (
    <div className="p-4 text-black">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Staff</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          + Add Staff
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                Staff
              </th>
              <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                Email
              </th>
              <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                Role
              </th>
              <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                Last Active
              </th>
              <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {staff.map((member) => (
              <tr key={member.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <a
                    href={`/dashboard/staff/${member.id}`}
                    className="flex items-center gap-3 hover:text-blue-600"
                  >
                    <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden shrink-0">
                      {member.avatar && (
                        <Image src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <span className="font-medium">{member.name}</span>
                  </a>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">{member.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {getRoleLabel(member.role)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-500">
                  {formatTime(member.lastActive)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(member.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      member.active ? 'bg-green-600' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        member.active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddStaff}
      />
    </div>
  );
}

