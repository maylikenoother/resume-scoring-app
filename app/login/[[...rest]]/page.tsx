import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const publicPaths = [
  '/',
  '/login',
  '/register',
  '/docs',
  '/debug',
  '/api/py/health', 
  '/verify',
  '/forgot-password',
  '/api/auth/token'
];

const publicApiPaths = [
  '/api/py/auth/token',
  '/api/py/health',
  '/api/auth/token'
];

// Create route matchers for public paths
const isPublicRoute = createRouteMatcher([...publicPaths, ...publicApiPaths]);

export default clerkMiddleware((auth, req: NextRequest) => {
  // Check if the route is explicitly public
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Check authentication status
  const { userId, protect } = auth();
  
  // If not authenticated, handle redirection
  if (!userId) {
    // Create a custom redirect URL that preserves the original path
    const signInUrl = new URL('/login', req.url);
    
    // Add redirect_url for non-API routes
    if (!req.nextUrl.pathname.startsWith('/api/')) {
      signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
    }

    // Redirect to login for web routes
    if (!req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.redirect(signInUrl);
    }

    // For API routes, return a 401 Unauthorized response
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }), 
      { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  // Protect the route for authenticated users
  protect();

  // Allow access for authenticated users
  return NextResponse.next();
}, {
  // Clerk configuration
  signInUrl: '/login'
});

export const config = {
  matcher: [
    // Protect all routes except specific exclusions
    '/((?!_next/static|_next/image|favicon.ico|public/|_next/|api/auth).*)',
  ],
};