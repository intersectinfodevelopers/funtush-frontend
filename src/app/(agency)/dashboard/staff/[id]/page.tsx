'use client';

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useStaff } from "@/hooks/useStaff";
import rolesData from '../../../../../../data/roles.json';
import Link from "next/link";
import Image from "next/image";

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
};

const getRoleLabel = (roleValue:string) => {
  const role = rolesData.find((r) => r.value === roleValue);
  return role ? role.label: roleValue;
};

export default function StaffDetailPage() {
  const {id} = useParams<{id: string}>();
  const router = useRouter();
  const {getStaff, updateStaff, toggleActive } = useStaff();
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [newRole, setNewRole] = useState('');

  const staff = getStaff(id);
  if(!staff) return <div className="p-4">Staff Not Found</div>

  const handleChangeRole = () => {
    if(newRole && newRole !== staff.role) {
      updateStaff(id, {
        role: newRole,
        activityLog: [
          ...staff.activityLog,
          {
            action: 'change_role',
            description: `Role changed from ${getRoleLabel(staff.role)} to ${getRoleLabel(newRole)}`,
            timestamp: new Date().toISOString(),
            ip: '127.0.0.1',
          }
        ]
      });
      setNewRole('');
    }
  };

  const handleDeactivate = () => {
    toggleActive(id);
    setShowDeactivateModal(false);
    router.push('/dashboard/staff');
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Back link */}
      <Link href="/dashboard/staff" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Staff
      </Link>

      {/* Profile Card */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-neutral-200 overflow-hidden shrink-0">
            {staff.avatar && <Image src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-black">{staff.name}</h1>
            <p className="text-neutral-600">{staff.email}</p>
            <p className="text-neutral-600 text-sm">{staff.phone}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-block text-sm font-medium px-2.5 py-1 rounded-full ${
                staff.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {staff.active ? 'Active' : 'Deactivated'}
              </span>
              <span className="text-sm text-neutral-500">
                Last active: {formatTime(staff.lastActive)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeactivateModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
            >
              Deactivate
            </button>
          </div>
        </div>

        {/* Change Role */}
        <div className="border-t border-neutral-200 pt-4">
          <h3 className="text-sm font-semibold text-neutral-700 mb-2">Change Role</h3>
          <div className="flex gap-2">
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="border border-neutral-300 rounded px-3 py-1.5 text-sm text-black"
            >
              <option value="">Select new role...</option>
              {rolesData.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleChangeRole}
              disabled={!newRole}
              className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Update Role
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-1">Current role: {getRoleLabel(staff.role)}</p>
        </div>
      </div>

      {/* Activity Log */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden text-black">
          {staff.activityLog.length === 0 ? (
            <p className="p-4 text-neutral-500">No activity recorded.</p>
          ) : (
            <div className="divide-y divide-neutral-200">
              {staff.activityLog.slice().reverse().map((log, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{log.description}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Action: {log.action} • IP: {log.ip}
                      </p>
                    </div>
                    <span className="text-xs text-neutral-500 whitespace-nowrap ml-4">
                      {formatTime(log.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-red-600">Deactivate Staff</h3>
            <p className="mt-2 text-neutral-600">
              This will immediately revoke their access to the system.
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              Are you sure you want to deactivate <strong>{staff.name}</strong>?
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleDeactivate}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 flex-1"
              >
                Yes, Deactivate
              </button>
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="border border-neutral-300 px-4 py-2 rounded text-sm hover:bg-neutral-50 flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}