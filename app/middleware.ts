import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {

  const authToken = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = ['/login', '/register', '/'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  if (!authToken && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (authToken && isPublicPath && pathname !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};