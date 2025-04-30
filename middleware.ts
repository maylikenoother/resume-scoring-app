import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from "jwt-decode";

const publicPaths = [
  '/', '/login', '/register', '/docs', '/debug',
  '/api/py/health', '/api/py/auth/login', '/api/py/auth/register'
];

const publicApiPaths = [
  '/api/py/health',
  '/api/py/auth/login',
  '/api/py/auth/register'
];

function isPublicPath(path: string): boolean {
  return publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith(`${publicPath}/`) ||
    path.startsWith('/_next/') ||
    path.startsWith('/favicon.ico')
  );
}

function isValidToken(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    
    return decoded.exp > currentTime;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  if (isPublicPath(path)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token')?.value;

  if (path.startsWith('/api/py/')) {

    if (publicApiPaths.some(apiPath => path.startsWith(apiPath))) {
      return NextResponse.next();
    }

    if (!token || !isValidToken(token)) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { 'content-type': 'application/json' }
        }
      );
    }
    
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('Authorization', `Bearer ${token}`);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  if (!token || !isValidToken(token)) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', path);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};