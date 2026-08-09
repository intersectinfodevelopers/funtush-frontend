'use client';

import { useEffect, useState } from 'react';

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerId: string;
}

const STORAGE_KEY = 'agency-branches';
const initialBranches: Branch[] = [
  { id: 'kathmandu-hq', name: 'Kathmandu HQ', address: 'Thamel, Kathmandu', phone: '+977 01 4700000', managerId: 'st-001' },
];

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>(() => {
    if (typeof window === 'undefined') return initialBranches;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialBranches;
    } catch { return initialBranches; }
  });
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(branches)); }, [branches]);
  const saveBranch = (branch: Branch) => setBranches((current) => {
    const exists = current.some((item) => item.id === branch.id);
    return exists ? current.map((item) => item.id === branch.id ? branch : item) : [...current, branch];
  });
  return { branches, saveBranch, getBranch: (id: string) => branches.find((branch) => branch.id === id) };
}
