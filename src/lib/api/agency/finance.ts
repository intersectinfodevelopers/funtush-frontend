import { api } from '../client';

export interface JournalLine {
  id: string;
  journalEntryId: string;
  date: string;
  description: string;
  currencyCode: string;
  bookingId: string | null;
  account: { code: string; name: string; type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' };
  debit: string;
  credit: string;
}
export interface TxPage { data: JournalLine[]; pagination: { page: number; limit: number; total: number; totalPages: number } }
export interface TxParams { page?: number; limit?: number; type?: string; from?: string; to?: string; accountCode?: string }
export const listTransactions = (params: TxParams = {}) => api.get<TxPage>('/agencies/me/finance/transactions', { params });

export const EXPENSE_CATEGORIES = [
  ['permits', 'Permit fees'], ['transport', 'Transportation'], ['accommodation', 'Accommodation & meals'],
  ['equipment', 'Equipment'], ['staff', 'Guide payroll'], ['marketing', 'Marketing & advertising'],
] as const;
export const recordIncome = (b: { amount: number; description?: string; entryDate?: string; depositAccountCode?: string; revenueAccountCode?: string }) => api.post('/agencies/me/finance/income', b);
export const recordExpense = (b: { amount: number; category: string; description?: string; entryDate?: string; paymentAccountCode?: string }) => api.post('/agencies/me/finance/expenses', b);

interface Lines { lines: { code: string; name: string; amount: number }[]; total: number }
export interface Pnl { period: string; revenue: Lines; expenses: Lines; netProfit: number; netProfitMargin: number }
export interface BalanceSheet { asOf: string; assets: Lines; liabilities: Lines; equity: Lines; totalLiabilitiesAndEquity: number; balanced: boolean }
export interface CashFlow { period: string; openingBalance: number; inflows: { total: number; byCategory: { code: string; name: string; amount: number }[] }; outflows: { total: number; byCategory: { code: string; name: string; amount: number }[] }; netCashFlow: number; closingBalance: number }
export interface TaxSummary { period: string; vatRate: number; revenueByCategory: { code: string; name: string; netRevenue: number; estimatedVat: number }[]; totals: { netRevenue: number; outputVat: number; deductibleExpenses: number; inputVat: number; netVatPayable: number }; taxesPayableBalance: number; assumptions: string[] }
const stmt = async <T>(path: string, period?: string) => (await api.get<{ data: T }>(`/agencies/me/finance/${path}`, { params: period ? { period } : {} })).data;
export const getPnl = (period?: string) => stmt<Pnl>('pnl', period);
export const getBalanceSheet = (period?: string) => stmt<BalanceSheet>('balance-sheet', period);
export const getCashFlow = (period?: string) => stmt<CashFlow>('cash-flow', period);
export const getTaxSummary = (period?: string) => stmt<TaxSummary>('tax-summary', period);

export interface PnlTrendPoint { period: string; revenue: number; expenses: number; netProfit: number }
export const getPnlTrend = async (months = 12) => (await api.get<{ data: PnlTrendPoint[] }>('/agencies/me/finance/pnl-trend', { params: { months } })).data;

/* ── Payroll ──────────────────────────────────────────────────────────────── */
export interface PayrollRecord {
  id: string;
  guideId: string | null;
  staffId: string | null;
  payeeName: string | null;
  periodStart: string;
  periodEnd: string;
  amount: string;
  currencyCode: string;
  status: 'DRAFT' | 'PAID';
  notes: string | null;
}
export interface PayrollPage { data: PayrollRecord[]; summary: { draftTotal: number; paidTotal: number }; pagination: { page: number; limit: number; total: number; totalPages: number } }
export const listPayroll = (params: { status?: string; page?: number; limit?: number } = {}) => api.get<PayrollPage>('/agencies/me/finance/payroll', { params });
export const createPayroll = (b: { guideId?: string; staffId?: string; periodStart: string; periodEnd: string; amount: number; notes?: string }) => api.post('/agencies/me/finance/payroll', b);
export const markPayrollPaid = (id: string, b: { paymentDate?: string; paymentAccountCode?: string }) => api.patch(`/agencies/me/finance/payroll/${id}/mark-paid`, b);

/* ── Invoices ─────────────────────────────────────────────────────────────── */
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Void';
export interface LineItem { description: string; quantity: number; unitPrice: number }
export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string | null;
  trekkerName: string;
  trekkerEmail: string | null;
  packageName: string | null;
  lineItems: LineItem[];
  subtotal: number;
  discount: number;
  total: number;
  currencyCode: string;
  status: InvoiceStatus;
  issueDate: string | null;
  dueDate: string | null;
  notes: string | null;
}
export interface InvoiceInput { bookingId?: string | null; trekkerName?: string; trekkerEmail?: string | null; packageName?: string | null; lineItems?: LineItem[]; discount?: number; currencyCode?: string; issueDate?: string | null; dueDate?: string | null; notes?: string | null }
// List → { success, invoices, total, page, limit }; single/write → { success, data }; delete → 204.
export const listInvoices = (params: { status?: string; search?: string; page?: number; limit?: number } = {}) => api.get<{ invoices: Invoice[]; total: number; page: number; limit: number }>('/agencies/me/finance/invoices', { params });
export const getInvoice = async (id: string) => (await api.get<{ data: Invoice }>(`/agencies/me/finance/invoices/${id}`)).data;
export const createInvoice = async (b: InvoiceInput) => (await api.post<{ data: Invoice }>('/agencies/me/finance/invoices', b)).data;
export const updateInvoice = async (id: string, b: InvoiceInput) => (await api.patch<{ data: Invoice }>(`/agencies/me/finance/invoices/${id}`, b)).data;
export const setInvoiceStatus = async (id: string, action: 'send' | 'mark-paid' | 'void') => (await api.patch<{ data: Invoice }>(`/agencies/me/finance/invoices/${id}/${action}`)).data;
export const deleteInvoice = (id: string) => api.delete(`/agencies/me/finance/invoices/${id}`);
