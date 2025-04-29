// app/api/py/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

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

async function handleApiRequest(
  request: NextRequest, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  params: { path: string[] }
) {
  const path = params.path.join('/');
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const url = `${apiBaseUrl}/api/py/${path}${request.nextUrl.search}`;

  try {
    // Forward headers from the original request
    const headers = new Headers();
    
    // Get auth token from cookies
    const cookies = request.cookies;
    const authToken = cookies.get('access_token')?.value;
    
    // Set Authorization header if token exists in cookies
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }
    // Also check for Authorization header in the request
    else {
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        headers.set('Authorization', authHeader);
      }
    }
    
    // Set content type and accept headers
    headers.set('Accept', 'application/json');
    
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
    
    // For non-GET requests, get the body
    let requestBody: BodyInit | undefined = undefined;
    
    if (method !== 'GET') {
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('multipart/form-data')) {
        try {
          const formData = await request.formData();
          requestBody = formData;
        } catch (e) {
          console.error('Failed to parse form data:', e);
        }
      } else if (contentType.includes('application/json')) {
        try {
          const json = await request.json();
          requestBody = JSON.stringify(json);
        } catch (e) {
          console.error('Failed to parse JSON:', e);
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        try {
          const text = await request.text();
          requestBody = text;
        } catch (e) {
          console.error('Failed to parse form data:', e);
        }
      } else {
        try {
          const text = await request.text();
          requestBody = text;
        } catch (e) {
          console.error('Failed to parse request body:', e);
        }
      }
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      body: requestBody,
      redirect: 'follow',
    };

    const response = await fetch(url, fetchOptions);
    
    // Get response data
    let responseData;
    let responseText;
    
    const responseType = response.headers.get('content-type') || '';
    
    if (responseType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch (e) {
        try {
          responseText = await response.text();
          responseData = { 
            error: 'Failed to parse JSON response',
            text: responseText
          };
        } catch (textError) {
          responseData = { 
            error: 'Failed to parse response from API',
            text: 'No content available'
          };
        }
      }
    } else {
      try {
        responseText = await response.text();
        responseData = { content: responseText };
      } catch (e) {
        responseData = { 
          error: 'Failed to read response from API',
          text: 'No content available'
        };
      }
    }
    
    // Create response with appropriate headers
    const nextResponse = NextResponse.json(responseData, { 
      status: response.status,
      statusText: response.statusText 
    });
    
    // Forward important headers from the backend response
    const headersToCopy = [
      'cache-control',
      'content-disposition',
      'content-type',
    ];
    
    for (const header of headersToCopy) {
      const value = response.headers.get(header);
      if (value) {
        nextResponse.headers.set(header, value);
      }
    }
    
    return nextResponse;

  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json({ 
      error: 'Failed to communicate with backend API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}