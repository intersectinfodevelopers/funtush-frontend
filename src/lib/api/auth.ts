import { api } from './client';
import { clearSupportSession, clearTokens, getTokens, saveTokens } from './session';
import { clearSessionEverywhere, saveSessionEverywhere } from '@/lib/auth';
import type { SessionUser, UserRole } from '@/types/user';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface MeResponse {
  success: boolean;
  user: { userId: string; role: string; roleType: string; agencyId: string | null; permissions: string[] };
}

interface AgencyDashboardResponse {
  success: boolean;
  data: { agency: { id: string; name: string; email: string; createdAt: string; profile?: { phone?: unknown } | null } };
}

/** The API's roles → the dashboard's three UI roles. */
export function toUiRole(role: string): UserRole {
  if (role === 'TREKKER') return 'trekker';
  if (role === 'AGENCY_ADMIN') return 'agency_admin';
  return 'moderator'; // AGENCY_MODERATOR, STAFF, GUIDE — limited by their permissions, not by page
}

/** AgencyProfile.phone is a JSON column (a string or a list of them). */
function firstString(v: unknown): string {
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return typeof v[0] === 'string' ? v[0] : '';
  return '';
}

async function buildAgencySession(email: string, tokens: TokenPair): Promise<SessionUser> {
  const { user } = await api.get<MeResponse>('/auth/me');
  const {
    data: { agency },
  } = await api.get<AgencyDashboardResponse>('/agencies/me/dashboard');
  // Invited staff only get what their role grants; the owner gets everything (permissions left undefined).
  const access = await api.get<{ data: { admin: boolean; permissions: string[] } }>('/agencies/me/access');
  return {
    id: user.userId,
    role: toUiRole(user.role),
    ...(access.data.admin ? {} : { permissions: access.data.permissions }),
    agency_id: user.agencyId,
    agency_name: agency.name,
    name: agency.name,
    email,
    phone: firstString(agency.profile?.phone),
    member_since: agency.createdAt,
    country: '',
    token: tokens.accessToken,
  };
}

/** Real agency login. Throws an ApiError ({message,status}) — e.g. 401 invalid credentials, 429 locked. */
export async function loginAgency(email: string, password: string): Promise<SessionUser> {
  const tokens = await api.post<TokenPair>('/auth/agency/login', { email, password });
  saveTokens(tokens);
  try {
    const session = await buildAgencySession(email, tokens);
    saveSessionEverywhere(session);
    return session;
  } catch (err) {
    clearTokens(); // never leave a half-signed-in state behind
    throw err;
  }
}

/** Trekker login (the shared login page serves both). */
export async function loginTrekker(email: string, password: string): Promise<SessionUser> {
  const tokens = await api.post<TokenPair>('/auth/trekker/login', { email, password });
  saveTokens(tokens);
  try {
    const { user } = await api.get<MeResponse>('/auth/me');
    const session: SessionUser = {
      id: user.userId,
      role: 'trekker',
      agency_id: null,
      name: email.split('@')[0],
      email,
      phone: '',
      member_since: '',
      country: '',
      token: tokens.accessToken,
    };
    saveSessionEverywhere(session);
    return session;
  } catch (err) {
    clearTokens();
    throw err;
  }
}

/** Ends the session server-side (revokes the refresh token) and locally. Never throws. */
export async function logoutEverywhere(): Promise<void> {
  const tokens = getTokens();
  try {
    if (tokens) await api.post('/auth/logout', { refreshToken: tokens.refreshToken });
  } catch {
    /* already invalid / offline — still sign out locally */
  }
  clearTokens();
  clearSupportSession();
  clearSessionEverywhere();
}
