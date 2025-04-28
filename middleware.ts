import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const publicPaths = [
  '/', '/login', '/register', '/docs', '/debug',
  '/api/py/health', '/verify', '/forgot-password', '/api/auth/token'
];

const publicApiPaths = [
  '/api/py/auth/token', '/api/py/health', '/api/auth/token'
];

const isPublicRoute = createRouteMatcher([...publicPaths, ...publicApiPaths]);

export default clerkMiddleware((auth, req: NextRequest) => {
  const pathname = req.nextUrl?.pathname || "/"; 

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const { userId, protect } = auth();

  if (!userId) {
    const signInUrl = new URL('/login', req.url);

    if (!pathname.startsWith('/api/')) {
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }

    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  protect();

  return NextResponse.next();
}, {
  signInUrl: '/login'
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|_next).*)',
  ],
};