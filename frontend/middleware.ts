import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/orgs', '/dashboard', '/reports', '/api-keys', '/sources', '/alerts', '/dashboards'];
const publicRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublic = publicRoutes.some(route => pathname.startsWith(route));
  const isRoot = pathname === '/';

  // Get auth token from cookies
  const token = request.cookies.get('auth')?.value;

  // If route is protected and no token, redirect to login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in and tries to access auth routes, redirect to dashboard
  if (token && isPublic) {
    return NextResponse.redirect(new URL('/orgs', request.url));
  }

  // If accessing root and logged in, redirect to dashboard
  if (isRoot && token) {
    return NextResponse.redirect(new URL('/orgs', request.url));
  }

  // If accessing root and not logged in, redirect to login
  if (isRoot && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'],
};
