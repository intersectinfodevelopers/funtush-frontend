'use client';

import { useState, useEffect } from 'react';
import staffsData from '../../data/staffs.json';

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  active: boolean;
  lastActive: string;
  activityLog: {
    action: string;
    description: string;
    timestamp: string;
    ip: string;
  }[];
}

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>(() => {
    if (typeof window === 'undefined') {
      return staffsData;
    }

    const stored = localStorage.getItem('staff');
    if (stored) {
      return JSON.parse(stored);
    }

    localStorage.setItem('staff', JSON.stringify(staffsData));
    return staffsData;
  });

  // Save to localStorage
  useEffect(() => {
    if (staff.length > 0) {
      localStorage.setItem('staff', JSON.stringify(staff));
    }
  }, [staff]);

  // CRUD operations
  const getStaff = (id: string) => staff.find((s) => s.id === id);

  const addStaff = (newStaff: Omit<Staff, 'id' | 'active' | 'lastActive' | 'activityLog'>) => {
    const id = `st-${Date.now()}`;
    const staffWithId: Staff = {
      ...newStaff,
      id,
      active: true,
      lastActive: new Date().toISOString(),
      activityLog: [
        {
          action: 'create',
          description: 'Staff account created',
          timestamp: new Date().toISOString(),
          ip: '127.0.0.1', // mock IP
        },
      ],
    };
    setStaff((prev) => [...prev, staffWithId]);
  };

  const updateStaff = (id: string, updated: Partial<Staff>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleActive = (id: string) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              active: !s.active,
              activityLog: [
                ...s.activityLog,
                {
                  action: s.active ? 'deactivate' : 'activate',
                  description: s.active ? 'Staff account deactivated' : 'Staff account activated',
                  timestamp: new Date().toISOString(),
                  ip: '127.0.0.1',
                },
              ],
            }
          : s
      )
    );
  };

  return { staff, getStaff, addStaff, updateStaff, deleteStaff, toggleActive };
}
