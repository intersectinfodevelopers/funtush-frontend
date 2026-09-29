import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { clearTokens, getTokens, isSupportSession, saveTokens } from './session';

/**
 * Axios client for the real Funtush API (apps/api).
 *
 * Auth: the API has two credential shapes and different routes use different
 * ones — `Authorization: Bearer <access>` (bookings, staff, …) and
 * `x-refresh-token: <refresh>` (packages, finance, branding, …). Sending both on
 * every request means every route just works.
 *
 * Refresh: POST /auth/refresh rotates BOTH tokens (the old refresh token is
 * revoked server-side), so the new pair is persisted, and concurrent 401s share
 * one refresh call. A support session (admin acting as the agency) cannot
 * refresh by design — it simply ends when its token expires or is revoked.
 */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const tokens = getTokens();
  if (tokens) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    config.headers['x-refresh-token'] = tokens.refreshToken;
  }
  return config;
});

let refreshing: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const tokens = getTokens();
  if (!tokens) return false;
  try {
    const res = await axios.post<{ accessToken: string; refreshToken: string }>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken: tokens.refreshToken },
    );
    saveTokens({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken });
    return true;
  } catch {
    return false;
  }
}

/** Fired when the session is definitively over, so the UI can react (redirect / show the ended screen). */
export const SESSION_ENDED_EVENT = 'funtush:session-ended';

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const isAuthCall = original?.url?.startsWith('/auth/');

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;

      // A support session has no refresh path; any 401 means it ended or was revoked.
      if (!isSupportSession()) {
        refreshing ??= refreshSession().finally(() => {
          refreshing = null;
        });
        if (await refreshing) {
          const t = getTokens();
          if (t) {
            original.headers.Authorization = `Bearer ${t.accessToken}`;
            original.headers['x-refresh-token'] = t.refreshToken;
            return apiClient(original);
          }
        }
        clearTokens();
      }
      if (typeof window !== 'undefined') window.dispatchEvent(new Event(SESSION_ENDED_EVENT));
    }

    return Promise.reject(formatError(error));
  },
);

/** The API answers errors as { message } or { error } depending on the route. */
interface ApiErrorBody {
  message?: string;
  error?: string;
  /** zod `validate()` middleware: { message: "Validation error", errors: { fieldErrors: { field: [msg] } } } */
  errors?: { formErrors?: string[]; fieldErrors?: Record<string, string[] | undefined> } | Record<string, string>;
}

export interface ApiError {
  message: string;
  status: number;
  /** Per-field messages, when the API says which input is wrong (`errors: { field: message }`). */
  fields?: Record<string, string>;
}

/** The first concrete validation message, which beats the generic "Validation error". */
function validationDetail(body: ApiErrorBody | undefined): string | undefined {
  const errs = body?.errors as { formErrors?: string[]; fieldErrors?: Record<string, string[] | undefined> } | undefined;
  if (!errs || typeof errs !== 'object') return undefined;
  return errs.formErrors?.[0] ?? Object.values(errs.fieldErrors ?? {}).find((m) => m && m.length)?.[0];
}

function fieldMessages(body: ApiErrorBody | undefined): Record<string, string> | undefined {
  const errs = body?.errors as Record<string, unknown> | undefined;
  if (!errs || typeof errs !== 'object') return undefined;
  const out: Record<string, string> = {};
  const src = (errs.fieldErrors && typeof errs.fieldErrors === 'object' ? errs.fieldErrors : errs) as Record<string, unknown>;
  for (const [k, v] of Object.entries(src)) {
    const msg = typeof v === 'string' ? v : Array.isArray(v) && typeof v[0] === 'string' ? v[0] : undefined;
    if (msg) out[k] = msg;
  }
  return Object.keys(out).length ? out : undefined;
}

function formatError(error: AxiosError<ApiErrorBody>): ApiError {
  const body = error.response?.data;
  return {
    fields: typeof body === 'object' ? fieldMessages(body) : undefined,
    message: (typeof body === 'object' && (validationDetail(body) || body?.message || body?.error)) || error.message || 'An unexpected error occurred',
    status: error.response?.status ?? 0,
  };
}

/** Typed helpers that return the response BODY (the API has no shared envelope). */
export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) => apiClient.get<T>(url, config).then((r) => r.data),
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiClient.post<T>(url, data, config).then((r) => r.data),
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiClient.put<T>(url, data, config).then((r) => r.data),
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiClient.patch<T>(url, data, config).then((r) => r.data),
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) => apiClient.delete<T>(url, config).then((r) => r.data),
  /** multipart/form-data (the browser sets the boundary). */
  upload: <T = unknown>(url: string, form: FormData, method: 'post' | 'patch' = 'post') =>
    apiClient.request<T>({ url, method, data: form, headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
};

export default apiClient;
