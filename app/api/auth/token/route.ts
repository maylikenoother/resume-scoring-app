import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const sessionToken = cookies().get('__session');

    if (!sessionToken || !sessionToken.value) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    return NextResponse.json({ token: sessionToken.value });
  } catch (error) {
    console.error('Error getting token:', error);
    return NextResponse.json({ 
      error: 'Failed to get authentication token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}