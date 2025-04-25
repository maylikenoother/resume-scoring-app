import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { getToken } = auth();
    const token = await getToken({template: 'cv-review-app'});

    if (!token) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error getting token:', error);
    return NextResponse.json({ 
      error: 'Failed to get authentication token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}