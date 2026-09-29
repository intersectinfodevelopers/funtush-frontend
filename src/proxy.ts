import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'funtush_session';

const PROTECTED_ROUTES = ['/dashboard', '/my-treks', '/profile', '/reviews', '/notifications'];

const AUTH_ROUTES = ['/login', '/forgot-password'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
}

// Reserved labels that mean "the main app", not an agency's site.
const RESERVED_SUBDOMAINS = new Set(['www', 'app']);

/**
 * Every agency's public site lives at `{subdomain}.funtush.com` — in dev
 * there's no real DNS for that, so `{subdomain}.localhost:port` stands in
 * (browsers resolve `*.localhost` to loopback on their own). Detect that
 * shape here and hand the request to `/site`, which renders whichever page
 * is marked "home" — completely bypassing the dashboard auth gate below,
 * since site visitors are never logged in.
 */
function tenantSubdomain(host: string | null): string | null {
  if (!host) return null;
  const hostname = host.split(':')[0].toLowerCase();
  const match = hostname.match(/^([a-z0-9-]+)\.(localhost|funtush\.com|funtush\.io)$/);
  if (!match) return null;
  const subdomain = match[1];
  return RESERVED_SUBDOMAINS.has(subdomain) ? null : subdomain;
}

function parseSession(cookieValue: string | undefined): { role: string } | null {
  if (!cookieValue) return null;

  try {
    return JSON.parse(decodeURIComponent(cookieValue));
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Every path under a tenant subdomain — not just the homepage — needs to
  // resolve to a real page (package/destination detail, booking, etc.), so
  // the whole subtree is rewritten into the /site route group. A visitor on
  // an agency's subdomain is never logged into the dashboard, so this must
  // run before (and instead of) the auth logic below.
  const subdomain = tenantSubdomain(request.headers.get('host'));
  if (subdomain) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? '/site' : `/site${pathname}`;
    const headers = new Headers(request.headers);
    headers.set('x-site-path', pathname); // lets the /site layout know which page it is rendering
    return NextResponse.rewrite(url, { request: { headers } });
  }

  const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;
  const session = parseSession(cookieValue);
  const isLoggedIn = session !== null;

  if (pathname === '/') {
    if (isLoggedIn) {
      const dashboard = session.role === 'trekker' ? '/my-treks' : '/dashboard';
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isProtectedRoute(pathname) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute(pathname) && isLoggedIn) {
    const dashboard = session.role === 'trekker' ? '/my-treks' : '/dashboard';
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Broad on purpose: a tenant subdomain needs every path rewritten (not just
  // the ones the dashboard cares about), and the branches above already scope
  // the auth logic to the specific routes that need it — everything else
  // just falls through to `NextResponse.next()`.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};