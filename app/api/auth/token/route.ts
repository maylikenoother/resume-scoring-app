import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  const { userId, sessionId } = getAuth(req);

  if (!userId || !sessionId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  return NextResponse.json({ 
    message: 'User is authenticated',
    userId,
    sessionId
  });
}
