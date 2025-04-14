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
    });
    
    const data = await response.json();
    return NextResponse.json(data);
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
  const contentType = headers.get('content-type');
  let body;
  
  if (contentType && contentType.includes('multipart/form-data')) {
    body = await request.formData();
  } else {
    body = await request.json();
  }
  
  try {
    const response = await fetch(url, {
      headers,
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
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
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json({ error: 'Failed to update data in API' }, { status: 500 });
  }
}