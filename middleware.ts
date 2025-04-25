import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

const publicPaths = [
  '/',
  '/login',
  '/register',
  '/api/py/health',
  '/verify',
  '/forgot-password',
  '/api/auth/token'
];

export function middleware(request: NextRequest) {
  // Skip Clerk authentication for FastAPI routes
  if (request.nextUrl.pathname.startsWith('/api/py/')) {
    return NextResponse.next();
  }

  const { userId } = getAuth(request);
  const { pathname } = request.nextUrl;

  const isPublicPath = publicPaths.some(path => 
    pathname === path || 
    pathname.startsWith(`${path}/`)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!userId) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect_url', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  if (userId && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}