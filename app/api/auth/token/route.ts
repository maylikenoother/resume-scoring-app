import { NextResponse } from 'next/server';
import { getToken } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const token = await getToken({ template: 'cv-review-app' });

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error getting authentication token:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get authentication token',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
