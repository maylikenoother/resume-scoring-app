import { NextRequest, NextResponse } from 'next/server';



type RouteContext = { params: Promise<{ path?: string[] }> };



async function proxy(request: NextRequest, method: string, context: RouteContext) {
  
  const { path = [] } = await context.params;
  
  const apiBaseUrl = process.env.API_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  const url = `${apiBaseUrl}/api/py/${path.join('/')}${request.nextUrl.search}`;
  

  
  try {
    
    const headers = new Headers({ Accept: 'application/json' });
    
    const token = request.cookies.get('access_token')?.value;
    
    if (token) headers.set('Authorization', `Bearer ${token}`);
    

    
    const contentType = request.headers.get('content-type');
    
    if (contentType) headers.set('Content-Type', contentType);
    

    
    let body: BodyInit | undefined;
    
    if (method !== 'GET') {
      
      if (contentType?.includes('multipart/form-data')) body = await request.formData();
      
      else if (contentType?.includes('application/json')) body = JSON.stringify(await request.json());
      
      else body = await request.text();
      
    }
    

    
    const response = await fetch(url, { method, headers, body, redirect: 'follow' });
    
    const isJson = response.headers.get('content-type')?.includes('application/json');
    
    const data = isJson ? await response.json() : { content: await response.text() };
    
    const result = NextResponse.json(data, { status: response.status, statusText: response.statusText });
    

    
    for (const header of ['cache-control', 'content-disposition', 'content-type']) {
      
      const value = response.headers.get(header);
      
      if (value) result.headers.set(header, value);
      
    }
    
    const cookie = response.headers.get('set-cookie');
    
    if (cookie) result.headers.set('set-cookie', cookie);
    
    return result;
    
  } catch (error) {
    
    console.error('API proxy error:', error);
    
    return NextResponse.json(
      
      { error: 'Failed to communicate with backend API', details: error instanceof Error ? error.message : 'Unknown error' },
      
      { status: 500 }
      
    );
    
  }
  
}



export async function GET(request: NextRequest, context: RouteContext) {
  
  return proxy(request, 'GET', context);
  
}



export async function POST(request: NextRequest, context: RouteContext) {
  
  return proxy(request, 'POST', context);
  
}



export async function PUT(request: NextRequest, context: RouteContext) {
  
  return proxy(request, 'PUT', context);
  
}



export async function DELETE(request: NextRequest, context: RouteContext) {
  
  return proxy(request, 'DELETE', context);
  
}
















































