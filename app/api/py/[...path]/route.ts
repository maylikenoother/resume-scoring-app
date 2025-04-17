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

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const url = `${apiBaseUrl}/api/py/${path}`;
 
  const headers = new Headers();
  
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }
  
  // Get token from NextAuth
  const token = await getToken({ req: request });
  
  if (token?.accessToken) {
    headers.set('Authorization', `Bearer ${token.accessToken}`);
    console.log(`Using NextAuth token for POST request to ${url}`);
  } else {
    console.warn(`No NextAuth token for POST request to ${url}`);
  }
  
  try {
    console.log(`Proxying POST request to: ${url}`);
    let response;
    
    if (contentType && contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      response = await fetch(url, {
        method: 'POST',
        headers, 
        body: formData,
      });
    } else {
      try {
        const body = await request.json();
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
      } catch (e) {
        if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData();
          const params = new URLSearchParams();
          formData.forEach((value, key) => {
            params.append(key, value.toString());
          });
          
          headers.set('Content-Type', 'application/x-www-form-urlencoded');
          response = await fetch(url, {
            method: 'POST',
            headers,
            body: params,
          });
        } else {
          const text = await request.text();
          response = await fetch(url, {
            method: 'POST',
            headers,
            body: text,
          });
        }
      }
    }
    
    if (!response.ok) {
      console.error(`API returned error status: ${response.status} ${response.statusText}`);
    }
    
    let data;
    const responseContentType = response.headers.get('content-type');
    if (responseContentType && responseContentType.includes('application/json')) {
      data = await response.json().catch(err => {
        console.error('Error parsing JSON response:', err);
        return { error: 'Invalid JSON response from API' };
      });
    } else {
      data = { message: await response.text() };
    }
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
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
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const url = `${apiBaseUrl}/api/py/${path}`;
  
  const headers = new Headers();
  
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  } else {
    headers.set('Content-Type', 'application/json');
  }
  
const token = await getToken({ req: request });

if (token?.accessToken) {
  headers.set('Authorization', `Bearer ${token.accessToken}`);
  console.log(`Using NextAuth token for PUT request to ${url}`);
} else {
  console.warn(`No NextAuth token for PUT request to ${url}`);
}
  
  try {
    console.log(`Proxying PUT request to: ${url}`);
    let body;
    try {
      body = await request.json();
    } catch (e) {
      body = await request.text();
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: typeof body === 'string' ? body : JSON.stringify(body),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error(`API returned error status: ${response.status} ${response.statusText}`);
    }
    
    let data;
    const responseContentType = response.headers.get('content-type');
    if (responseContentType && responseContentType.includes('application/json')) {
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
    return NextResponse.json({ error: 'Failed to update data in API' }, { status: 500 });
  }
}