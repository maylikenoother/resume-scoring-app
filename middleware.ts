import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const publicPaths = [
  '/',
  '/login',
  '/register',
  '/api/py/health',
  '/verify',
  '/forgot-password',
  '/api/auth/token'
];

const publicApiPaths = [
  '/api/py/auth/token',
  '/api/py/health'
];

const isPublicRoute = createRouteMatcher([...publicPaths, ...publicApiPaths]);

export default clerkMiddleware((auth, req: NextRequest) => {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const { userId } = auth();

  if (!userId) {
    const signInUrl = new URL('/login', req.url);

    if (!req.nextUrl.pathname.startsWith('/api/')) {
      signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
    }

    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|_next/|api/auth).*)',
  ],
};
