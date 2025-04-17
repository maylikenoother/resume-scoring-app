import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkClient, getAuth } from '@clerk/nextjs/server';

export async function middleware(request: NextRequest) {
  const { userId } = getAuth(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/py/')) {
    return NextResponse.next();
  }

  const publicPaths = ['/login', '/register', '/', '/api/py/health'];
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
  
  if (!userId && !isPublicPath) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
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
};