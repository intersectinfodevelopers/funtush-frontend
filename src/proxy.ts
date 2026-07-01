import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'funtush_session';

const PROTECTED_ROUTES = ['/dashboard', '/my-treks', '/profile', '/notifications'];

const AUTH_ROUTES = ['/login', '/forgot-password'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
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
  matcher: [
    '/',
    '/login',
    '/forgot-password',
    '/dashboard/:path*',
    '/my-treks/:path*',
    '/profile/:path*',
    '/notifications/:path*',
  ],
};