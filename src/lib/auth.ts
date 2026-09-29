import { SessionUser, UserRole } from "@/types";
import {ROUTES} from '@/lib/constants/routes'
import { getSupportSession } from '@/lib/api/session';


export const SESSION_KEY = 'funtush_session';
export const SESSION_COOKIE = 'funtush_session';



export const ROLE_REDIRECT: Record<UserRole,string> ={
    agency_admin: ROUTES.AGENCY.DASHBOARD,
    moderator: ROUTES.AGENCY.DASHBOARD,
    trekker: ROUTES.TREKKER.MY_TREKS,
};


/** Fired (same tab) whenever the stored session changes — the `storage` event only fires in OTHER tabs. */
export const AUTH_CHANGED_EVENT = 'funtush:auth-changed';
const notifyAuthChanged = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

/** A cheap, stable fingerprint of what's stored, for useSyncExternalStore. */
export function getSessionSnapshot(): string {
  if (typeof window === 'undefined') return '';
  try {
    return `${window.sessionStorage.getItem('funtush_support_session') ?? ''}|${window.localStorage.getItem(SESSION_KEY) ?? ''}`;
  } catch {
    return '';
  }
}

export function saveSession(user: SessionUser): void {
    if (typeof window === 'undefined')return;
    localStorage.setItem(SESSION_KEY,JSON.stringify(user));
    notifyAuthChanged();
}

export function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null;

  // A support session (admin acting as this agency) is tab-scoped and wins over
  // any normal login stored in localStorage.
  const support = getSupportSession();
  if (support) {
    return {
      id: `support:${support.agencyId}`,
      role: 'agency_admin',
      agency_id: support.agencyId,
      agency_name: support.agencyName,
      name: support.agencyName,
      email: support.impersonatedEmail,
      phone: '',
      member_since: '',
      country: '',
      token: support.accessToken,
      support: true,
    };
  }

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearSession(): void {
    if (typeof window === 'undefined')  return ;
    localStorage.removeItem(SESSION_KEY);
    notifyAuthChanged();
}


export function saveSessionCookie(user: SessionUser): void {
    if (typeof window === 'undefined') return;

    // Only the role is needed by the route guard (src/proxy.ts) — the real
    // credentials are the API tokens, not this cookie. A support session gets a
    // session cookie (no max-age) so it goes away with the browser tab/window.
    const encoded = encodeURIComponent(JSON.stringify({ role: user.role, support: user.support ?? false }));
    const lifetime = user.support ? '' : '; max-age=86400';
    document.cookie = `${SESSION_COOKIE}=${encoded}; path=/${lifetime}; SameSite=Lax`;
}

export function clearSessionCookie(): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}



export function saveSessionEverywhere(user: SessionUser): void {
  saveSession(user);
  saveSessionCookie(user);
}


export function clearSessionEverywhere(): void {
  clearSession();
  clearSessionCookie();
}


export function isAuthenticated(): boolean {
    return getSession() !== null;
}

//Profile Updarte Helper 

export function updateSession(updates: Partial<SessionUser>): SessionUser | null {
  const current = getSession();
  if (!current) return null;

  const updated = {...current, ...updates};
  saveSession(updated);
  saveSessionCookie(updated);
  return updated;
}

const EMERGENCY_KEY = 'funtush_emergency_contact';
 export function saveEmergencyContact(contact: import('@/types/user').EmergencyContact): void {
  if (typeof window === 'undefined' )
    return;
   localStorage.setItem(EMERGENCY_KEY, JSON.stringify(contact));

 }


export function getEmergencyContact(): import('@/types/user').EmergencyContact | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(EMERGENCY_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}



//// Notifications 

const NOTIFICATION_KEY = 'funtush_noticication'


export function getReadNotificationIds(): string[] {
  if (typeof window === 'undefined') return [];
  try{
    const raw  = localStorage.getItem(NOTIFICATION_KEY);
    if (!raw ) return [];
    return JSON.parse(raw) as string[];
    
  }catch{
    return[];
  }
}




export function markNotificationAsRead(id: string ): void {
  if (typeof window === 'undefined') return;
  const ids = getReadNotificationIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(ids));
  }
}