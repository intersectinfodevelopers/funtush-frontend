'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addCustomerNote,
  fetchCustomerAnalytics,
  fetchCustomerNotes,
  fetchCustomerProfile,
  listCustomers,
  type CustomerListParams,
} from '@/lib/api/agency/customers';

export const useCustomerList = (p: CustomerListParams) =>
  useQuery({ queryKey: ['agency', 'customers', 'list', p], queryFn: () => listCustomers(p), placeholderData: keepPreviousData });
export const useCustomerAnalytics = () => useQuery({ queryKey: ['agency', 'customers', 'analytics'], queryFn: fetchCustomerAnalytics });
export const useCustomerProfile = (id: string) => useQuery({ queryKey: ['agency', 'customer', id], queryFn: () => fetchCustomerProfile(id), enabled: Boolean(id) });
export const useCustomerNotes = (id: string) => useQuery({ queryKey: ['agency', 'customer', id, 'notes'], queryFn: () => fetchCustomerNotes(id), enabled: Boolean(id) && !id.startsWith('guest:') }); // guests have no account, so no notes

export function useAddCustomerNote(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => addCustomerNote(id, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agency', 'customer', id] }),
  });
}
