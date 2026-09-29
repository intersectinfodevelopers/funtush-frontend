'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getBalanceSheet, getCashFlow, getPnl, getPnlTrend, getTaxSummary, listTransactions, type TxParams } from '@/lib/api/agency/finance';

export const financeKey = ['agency', 'finance'] as const;
export const useTransactions = (p: TxParams) => useQuery({ queryKey: [...financeKey, 'tx', p], queryFn: () => listTransactions(p), placeholderData: keepPreviousData });
export const usePnl = (period?: string) => useQuery({ queryKey: [...financeKey, 'pnl', period], queryFn: () => getPnl(period), placeholderData: keepPreviousData });
export const usePnlTrend = (months = 12) => useQuery({ queryKey: [...financeKey, 'pnl-trend', months], queryFn: () => getPnlTrend(months), placeholderData: keepPreviousData });
export const useBalanceSheet = (period?: string) => useQuery({ queryKey: [...financeKey, 'bs', period], queryFn: () => getBalanceSheet(period), placeholderData: keepPreviousData });
export const useCashFlow = (period?: string) => useQuery({ queryKey: [...financeKey, 'cf', period], queryFn: () => getCashFlow(period), placeholderData: keepPreviousData });
export const useTaxSummary = (period?: string) => useQuery({ queryKey: [...financeKey, 'tax', period], queryFn: () => getTaxSummary(period), placeholderData: keepPreviousData });

import { listPayroll } from '@/lib/api/agency/finance';
export const usePayroll = (p: { status?: string; page?: number; limit?: number }) => useQuery({ queryKey: [...financeKey, 'payroll', p], queryFn: () => listPayroll(p), placeholderData: keepPreviousData });

import { getInvoice, listInvoices } from '@/lib/api/agency/finance';
export const useInvoiceList = (p: { status?: string; search?: string; page?: number; limit?: number }) => useQuery({ queryKey: [...financeKey, 'invoices', 'list', p], queryFn: () => listInvoices(p), placeholderData: keepPreviousData });
export const useInvoice = (id: string) => useQuery({ queryKey: [...financeKey, 'invoices', 'one', id], queryFn: () => getInvoice(id), enabled: Boolean(id) });
