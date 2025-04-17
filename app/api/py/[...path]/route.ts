import { NextRequest, NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const url = `${apiBaseUrl}/api/py/${path}${request.nextUrl.search}`;

  const headers = new Headers();
  
  const token = await getToken({ req: request });
  
  if (token?.accessToken) {
    headers.set('Authorization', `Bearer ${token.accessToken}`);
    console.log(`Using NextAuth token for request to ${url}`);
  } else {
    console.warn(`No NextAuth token for request to ${url}`);
  }
  
  try {
    console.log(`Proxying GET request to: ${url}`);
    const response = await fetch(url, {
      headers,
      method: 'GET',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error(`API returned error status: ${response.status} ${response.statusText}`);
    }
    
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(err => {
        console.error('Error parsing JSON response:', err);
        return { error: 'Invalid JSON response from API' };
      });
    } else {
      data = { message: await response.text() };
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch data from API' }, { status: 500 });
  }
}