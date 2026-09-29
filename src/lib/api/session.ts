/**
 * Where the API credentials live.
 *
 * Two kinds of session exist:
 *  - a NORMAL agency login — tokens in localStorage (survives reloads/tabs);
 *  - a SUPPORT session — a platform admin acting as this agency, started from
 *    funtush-admin. Tokens live in sessionStorage so they are scoped to that
 *    one browser tab: they never overwrite the agency's own login in another
 *    tab, and they vanish when the tab is closed.
 *
 * The API client asks `getTokens()` and never needs to know which kind it has.
 */

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface SupportSessionMeta {
  agencyId: string;
  agencyName: string;
  impersonatedEmail: string;
  /** ISO time the session's tokens stop working (server-enforced; shown in the banner). */
  expiresAt: string;
  /** Where "End session" sends the admin back to. */
  adminOrigin: string;
}

export interface SupportSession extends Tokens, SupportSessionMeta {}

const ACCESS_KEY = 'authToken';
const REFRESH_KEY = 'refreshToken';
const SUPPORT_KEY = 'funtush_support_session';

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback; // storage blocked / private mode / SSR
  }
}

export function getSupportSession(): SupportSession | null {
  if (typeof window === 'undefined') return null;
  return safe(() => {
    const raw = window.sessionStorage.getItem(SUPPORT_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as SupportSession;
    // The server enforces expiry; this just avoids showing a dead session as live.
    if (!s.accessToken || new Date(s.expiresAt).getTime() <= Date.now()) {
      window.sessionStorage.removeItem(SUPPORT_KEY);
      return null;
    }
    return s;
  }, null);
}

export function saveSupportSession(s: SupportSession): void {
  safe(() => window.sessionStorage.setItem(SUPPORT_KEY, JSON.stringify(s)), undefined);
}

export function clearSupportSession(): void {
  safe(() => window.sessionStorage.removeItem(SUPPORT_KEY), undefined);
}

export function isSupportSession(): boolean {
  return getSupportSession() !== null;
}

export function getTokens(): Tokens | null {
  if (typeof window === 'undefined') return null;
  const support = getSupportSession();
  if (support) return { accessToken: support.accessToken, refreshToken: support.refreshToken };
  return safe(() => {
    const accessToken = window.localStorage.getItem(ACCESS_KEY);
    const refreshToken = window.localStorage.getItem(REFRESH_KEY);
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  }, null);
}

export function saveTokens(t: Tokens): void {
  safe(() => {
    window.localStorage.setItem(ACCESS_KEY, t.accessToken);
    window.localStorage.setItem(REFRESH_KEY, t.refreshToken);
  }, undefined);
}

export function clearTokens(): void {
  safe(() => {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  }, undefined);
}
