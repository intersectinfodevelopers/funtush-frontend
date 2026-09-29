'use client';

import { useQuery } from '@tanstack/react-query';
import { getBranchReport, listBranches } from '@/lib/api/agency/branches';

export const useBranchList = () => useQuery({ queryKey: ['agency', 'branches'], queryFn: listBranches });
export const useBranchReport = (id: string) => useQuery({ queryKey: ['agency', 'branches', id, 'report'], queryFn: () => getBranchReport(id), enabled: Boolean(id) });
