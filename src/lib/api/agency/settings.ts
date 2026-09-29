import { api } from '../client';

/* ── Notification preferences ─────────────────────────────────────────────── */
export type NotificationEvent = 'newInquiry' | 'paymentReceived' | 'bookingCancelled' | 'newReview' | 'sosTriggered' | 'lowSlots' | 'subscription' | 'weeklyDigest';
export interface ChannelPref { email: boolean; inApp: boolean }
export interface NotificationPrefs {
  preferences: Record<NotificationEvent, ChannelPref>;
  welcomeBackPopup: { enabled: boolean; message: string | null };
}
export interface NotificationOptions { events: (ChannelPref & { id: NotificationEvent; emailLocked: boolean })[] }
export interface NotificationPatch {
  preferences?: Partial<Record<NotificationEvent, Partial<ChannelPref>>>;
  welcomeBackPopupEnabled?: boolean;
  welcomeBackPopupMessage?: string | null;
}
export const getNotificationPrefs = async () => (await api.get<{ data: NotificationPrefs }>('/agencies/me/notification-preferences')).data;
export const getNotificationOptions = async () => (await api.get<{ data: NotificationOptions }>('/agencies/me/notification-preferences/options')).data;
export const saveNotificationPrefs = async (patch: NotificationPatch) => (await api.patch<{ data: NotificationPrefs }>('/agencies/me/notification-preferences', patch)).data;

/* ── Email settings ───────────────────────────────────────────────────────── */
export interface EmailValues { senderName: string | null; fromAddress: string | null; replyTo: string | null; footerText: string | null; includeUnsubscribe: boolean; bccBookingsTo: string | null }
export const getEmailSettings = async () => (await api.get<{ data: { values: EmailValues } }>('/agencies/me/email-settings')).data.values;
export const saveEmailSettings = async (patch: Partial<EmailValues>) => (await api.patch<{ data: { values: EmailValues } }>('/agencies/me/email-settings', patch)).data.values;

/* ── API keys ─────────────────────────────────────────────────────────────── */
export type ApiKeyScope = 'READ_ONLY' | 'READ_WRITE';
export interface ApiKeyRow { id: string; name: string; keyPrefix: string; scope: ApiKeyScope; lastUsedAt: string | null; revoked: boolean; createdAt: string }
export interface CreatedApiKey extends Omit<ApiKeyRow, 'lastUsedAt' | 'revoked'> { key: string }
export const listApiKeys = async () => (await api.get<{ data: ApiKeyRow[] }>('/agencies/me/api-keys')).data;
export const createApiKey = async (b: { name: string; scope: ApiKeyScope }) => (await api.post<{ data: CreatedApiKey }>('/agencies/me/api-keys', b)).data;
export const revokeApiKey = (id: string) => api.delete(`/agencies/me/api-keys/${id}`);

/* ── Agency profile ───────────────────────────────────────────────────────── */
export interface AgencyProfile {
  logo: string | null;
  description: string | null;
  address: string | null;
  phone: string[];
  email: string[];
  regions: string[];
  logoShowOnWebsite: boolean;
  descriptionShowOnWebsite: boolean;
  phoneShowOnWebsite: boolean;
  emailShowOnWebsite: boolean;
  regionsShowOnWebsite: boolean;
  addressShowOnWebsite: boolean;
}
export const getAgencyProfile = async () => (await api.get<{ data: AgencyProfile }>('/agencies/me/profile')).data;
export const saveAgencyProfile = async (patch: Partial<AgencyProfile>) => (await api.patch<{ data: AgencyProfile }>('/agencies/me/profile', patch)).data;

/* ── KYC ──────────────────────────────────────────────────────────────────── */
export type KycStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export interface KycState { status: KycStatus; rejectionReason: string | null }
export const KYC_DOCS = [
  { field: 'business_registration', label: 'Business registration' },
  { field: 'pan_certificate', label: 'PAN certificate' },
  { field: 'tourism_license', label: 'Tourism licence' },
  { field: 'bank_details', label: 'Bank details' },
] as const;
// GET → { status, data: { agency: { kyc: {status, rejectionReason} | null } } }
export const getKyc = async (): Promise<KycState | null> => (await api.get<{ data: { agency: { kyc: KycState | null } } }>('/agencies/me/kyc')).data.agency.kyc;
export const submitKyc = (files: Record<(typeof KYC_DOCS)[number]['field'], File>) => {
  const form = new FormData();
  for (const [k, f] of Object.entries(files)) form.append(k, f);
  return api.upload('/agencies/me/kyc', form, 'post');
};

/* ── Payment gateways ─────────────────────────────────────────────────────── */
export const GATEWAYS = [
  { id: 'ESEWA', name: 'eSewa', fields: [['merchantId', 'Merchant ID'], ['secretKey', 'Secret key']] },
  { id: 'KHALTI', name: 'Khalti', fields: [['publicKey', 'Public key'], ['secretKey', 'Secret key']] },
  { id: 'FONEPAY', name: 'Fonepay', fields: [['merchantCode', 'Merchant code'], ['terminalId', 'Terminal ID']] },
  { id: 'STRIPE', name: 'Stripe', fields: [['publishableKey', 'Publishable key'], ['secretKey', 'Secret key']] },
] as const;
export type GatewayId = (typeof GATEWAYS)[number]['id'];
export interface PaymentMethodRow { id: string; provider: string; isActive: boolean; createdAt: string; updatedAt: string }
// GET → bare array (never includes credentials); POST → { id, provider, isActive, createdAt }; toggle → { id, provider, isActive }
export const listPaymentMethods = () => api.get<PaymentMethodRow[]>('/agencies/me/payment-methods');
export const savePaymentMethod = (provider: GatewayId, credentials: Record<string, string>) => api.post<PaymentMethodRow>('/agencies/me/payment-methods', { provider, ...credentials });
export const togglePaymentMethod = (id: string) => api.patch<PaymentMethodRow>(`/agencies/me/payment-methods/${id}/toggle`);

/* ── Subscription plans (public catalogue) ────────────────────────────────── */
export interface Tier {
  id: string;
  name: string;
  monthlyPrice: string | number;
  monthlyPriceNpr?: number;
  annualPrice: string | number | null;
  maxStaff: number;
  maxGuides: number;
  maxPackages: number;
  maxBookingsPerMonth: number | null;
  trialDays: number;
  blogEnabled: boolean;
  adsEnabled: boolean;
  analyticsEnabled: boolean;
  customDomainEnabled: boolean;
  whiteLabelComplete: boolean;
  apiAccessEnabled: boolean;
  prioritySupportEnabled: boolean;
}
// GET /subscription-tiers → { status, data: { tiers } }
export const listTiers = async () => (await api.get<{ data: { tiers: Tier[] } }>('/subscription-tiers')).data.tiers;

/* ── Security ─────────────────────────────────────────────────────────────── */
export const changePassword = (currentPassword: string, newPassword: string) => api.post<{ success: boolean; message: string }>('/auth/change-password', { currentPassword, newPassword });

/* ── Support: bug reports ─────────────────────────────────────────────────── */
export type BugStatus = 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED';
export interface BugReport {
  id: string;
  title: string;
  description: string;
  stepsToReproduce: string | null;
  screenshotUrl: string | null;
  status: BugStatus;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW' | null;
  resolutionNote: string | null;
  createdAt: string;
}
// GET → { success, data: { items, total, page, limit } }; POST → { success, data: BugReport }
export const listBugReports = async (page = 1) => (await api.get<{ data: { items: BugReport[]; total: number; page: number; limit: number } }>('/agencies/me/bugs', { params: { page, limit: 20 } })).data;
export const submitBugReport = async (b: { title: string; description: string; stepsToReproduce?: string; screenshotUrl?: string }) => (await api.post<{ data: BugReport }>('/agencies/me/bugs', b)).data;

/* ── Plan checkout (eSewa / Khalti) ───────────────────────────────────────── */
export interface EsewaStart { transactionId: string; amount: number; currency: string; form: { action: string; fields: Record<string, string> } }
export interface KhaltiStart { transactionId: string; amount: number; currency: string; redirectUrl: string }
export const startEsewa = (subscriptionTierId: string) => api.post<EsewaStart>('/billing/subscribe/esewa/initiate', { subscriptionTierId });
export const startKhalti = (subscriptionTierId: string) => api.post<KhaltiStart>('/billing/subscribe/khalti/initiate', { subscriptionTierId });
export const confirmPayment = (body: { provider: 'esewa'; refId: string; transactionId: string } | { provider: 'khalti'; token: string; transactionId: string }) => api.post<{ success: boolean }>('/billing/subscribe/verify', body);
