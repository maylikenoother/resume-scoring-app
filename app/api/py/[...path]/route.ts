import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const url = `${apiBaseUrl}/api/py/${path}${request.nextUrl.search}`;

  try {
    const { getToken } = await auth();
    const token = await getToken({template: 'cv-review-app'});
    
    const headers = new Headers();
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    headers.set('Accept', 'application/json');
    
    const response = await fetch(url, {
      headers,
      method: 'GET',
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response:', await response.text());
      return NextResponse.json({ 
        error: 'Received non-JSON response from API',
        status: response.status 
      }, { status: 500 });
    }
    
    const data = await response.json().catch(err => {
      console.error('JSON parsing error:', err);
      return { 
        error: 'Failed to parse API response',
        status: response.status 
      };
    });
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch data from API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const url = `${apiBaseUrl}/api/py/${path}`;
 
  try {
    const { getToken } = await auth();
    const token = await getToken({template: 'cv-review-app'});
    
    const headers = new Headers();
    headers.set('Accept', 'application/json');
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
    
    let response;
    
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      response = await fetch(url, {
        method: 'POST',
        headers, 
        body: formData,
      });
    } else {
      const body = await request.json();
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    }
    
    const responseContentType = response.headers.get('content-type');
    
    if (!responseContentType || !responseContentType.includes('application/json')) {
      console.error('Non-JSON response:', await response.text());
      return NextResponse.json({ 
        error: 'Received non-JSON response from API',
        status: response.status 
      }, { status: 500 });
    }
    
    // Try to parse JSON
    const data = await response.json().catch(err => {
      console.error('JSON parsing error:', err);
      return { 
        error: 'Failed to parse API response',
        status: response.status 
      };
    });
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json({ 
      error: 'Failed to send data to API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}