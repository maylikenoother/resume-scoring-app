import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export async function GET(req: NextRequest) {
  // Get the token from either the Authorization header or cookie
  const authHeader = req.headers.get('authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  if (!token) {
    // Try to get token from cookie
    token = req.cookies.get('access_token')?.value || null;
  }

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // Decode the token to get user info
    const decoded = jwtDecode<{ sub: string, exp: number }>(token);
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      message: 'User is authenticated',
      userId: decoded.sub,
      tokenValid: true
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: 'Invalid authentication token' },
      { status: 401 }
    );
  }
}