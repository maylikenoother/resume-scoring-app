import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:8000';
  const url = `${apiBaseUrl}/api/py/${path}${request.nextUrl.search}`;
  
  const headers = new Headers(request.headers);
  
  try {
    const response = await fetch(url, {
      headers,
      method: 'GET',
      cache: 'no-store',
    });
    
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch data from API' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:8000';
  const url = `${apiBaseUrl}/api/py/${path}`;
  
  const headers = new Headers(request.headers);
  const contentType = headers.get('content-type') || '';
  
  try {
    let response;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data (file uploads)
      const formData = await request.formData();
      response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: formData,
      });
    } else {
      // Handle JSON data
      let body;
      try {
        body = await request.json();
      } catch (e) {
        // If JSON parsing fails, try to get form data or text
        if (contentType.includes('application/x-www-form-urlencoded')) {
          body = await request.formData();
        } else {
          body = await request.text();
        }
      }
      
      if (body instanceof FormData) {
        response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: body,
        });
      } else if (typeof body === 'string') {
        response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: body,
        });
      } else {
        response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(body),
        });
      }
    }
    
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json({ error: 'Failed to send data to API' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:8000';
  const url = `${apiBaseUrl}/api/py/${path}`;
  
  const headers = new Headers(request.headers);
  
  try {
    const body = await request.json();
    const response = await fetch(url, {
      headers,
      method: 'PUT',
      body: JSON.stringify(body),
    });
    
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json({ error: 'Failed to update data in API' }, { status: 500 });
  }
}