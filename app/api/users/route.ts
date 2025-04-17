import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Function to create or authenticate a user in your backend
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { name, email, sub, provider } = token;
    
    const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${apiBaseUrl}/api/py/auth/oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        provider,
        oauth_id: sub,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Failed to authenticate with backend: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in user API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}