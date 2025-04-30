
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, context: any) {
  return handleApiRequest(request, 'GET', context.params);
}


export async function POST(request: NextRequest, context: any) {
  return handleApiRequest(request, 'POST', context.params);
}


export async function PUT(request: NextRequest, context: any) {
  return handleApiRequest(request, 'PUT', context.params);
}

export async function DELETE(request: NextRequest, context: any) {
  return handleApiRequest(request, 'DELETE', context.params);
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
    const headers = new Headers();

    console.log('Cookie debugging:');
    for (const cookie of request.cookies.getAll()) {
      const { name: key, value } = cookie;
      console.log(`Cookie ${key}: ${value ? 'exists' : 'not found'}`);
    }
    
    const cookieToken = request.cookies.get('access_token')?.value;
    const authHeader = request.headers.get('authorization');
    const customToken = request.headers.get('x-auth-token');
    
    let token = cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null) || customToken;
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      console.log('Using token from: ' + (cookieToken ? 'cookie' : (authHeader ? 'auth header' : 'custom header')));
    } else {
      console.log('No auth token found in request');
    }
    
    headers.set('Accept', 'application/json');
    
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
    
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
    
    if (responseData && responseData.access_token) {
      const nextResponse = NextResponse.json(responseData, { 
        status: response.status,
        statusText: response.statusText 
      });
      
      // Set the cookie with the token from the response
      nextResponse.cookies.set('access_token', responseData.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      
      return nextResponse;
    }
    
    const nextResponse = NextResponse.json(responseData, { 
      status: response.status,
      statusText: response.statusText 
    });
    
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
    
    // Copy any cookies from the FastAPI response
    const responseCookieHeader = response.headers.get('set-cookie');
    if (responseCookieHeader) {
      nextResponse.headers.set('set-cookie', responseCookieHeader);
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