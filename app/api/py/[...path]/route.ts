import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";

async function handleApiRequest(
  request: NextRequest, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  params: { path: string[] }
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
    headers.set('Content-Type', 'application/json');
    
    let body = null;
    if (method !== 'GET') {
      try {
        body = await request.json();
      } catch (jsonError) {
        console.error('Error parsing request body:', jsonError);
      }
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    };

    const response = await fetch(url, fetchOptions);

    const contentType = response.headers.get('content-type') || '';
    
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      
      return NextResponse.json({ 
        error: 'Received non-JSON response from API',
        details: text.slice(0, 500)
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

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleApiRequest(request, 'GET', params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleApiRequest(request, 'POST', params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleApiRequest(request, 'PUT', params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleApiRequest(request, 'DELETE', params);
}