import { NextResponse } from 'next/server';
import { authMiddleware } from '@clerk/nextjs';

const publicPaths = [
  '/',
  '/login',
  '/register',
  '/api/py/health',
  '/verify',
  '/forgot-password',
  '/api/auth/token'
];

export default authMiddleware({
  publicRoutes: publicPaths,
  
  // Skip Clerk for API routes
  ignoredRoutes: ['/api/py/(.*)'],
  
  afterAuth(auth, req) {
    const { userId } = auth;
    const { pathname } = req.nextUrl;
    
    // If user is signed in and trying to access login/register
    if (userId && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    // If user is not signed in and trying to access a protected route
    if (!userId && !publicPaths.some(path => 
      pathname === path || pathname.startsWith(`${path}/`))
    ) {
      const url = new URL('/login', req.url);
      url.searchParams.set('redirect_url', encodeURI(req.url));
      return NextResponse.redirect(url);
    }
    
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};