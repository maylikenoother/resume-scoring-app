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

const isPublicRoute = createRouteMatcher(publicPaths);

export default clerkMiddleware((auth, req: NextRequest) => {

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const { userId } = auth;
  
  if (!userId) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|_next/|api/auth).*)',
  ],
};