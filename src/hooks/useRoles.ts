'use client';

import { useEffect, useState } from 'react';
import defaultRoles from '../../data/roles.json';

export const PERMISSION_SECTIONS = [
  'Packages', 'Bookings', 'Customers', 'Guides', 'Staff',
  'Finance', 'Analytics', 'Blog', 'Reviews', 'Settings',
] as const;

export type Permission = (typeof PERMISSION_SECTIONS)[number];

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

const STORAGE_KEY = 'agency-roles';

export function roleLabel(roleId: string, roles: Role[]) {
  return roles.find((role) => role.id === roleId)?.name ?? roleId.replace(/[_-]/g, ' ');
}

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>(() => {
    if (typeof window === 'undefined') return defaultRoles;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultRoles;
    } catch {
      return defaultRoles;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
  }, [roles]);

  const saveRole = (role: Role) => {
    setRoles((current) => {
      const exists = current.some((item) => item.id === role.id);
      return exists ? current.map((item) => item.id === role.id ? role : item) : [...current, role];
    });
  };

  return { roles, saveRole, getRole: (id: string) => roles.find((role) => role.id === id) };
}
