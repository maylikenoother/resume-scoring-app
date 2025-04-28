export async function fetchWithAuth(url: string, options: RequestInit = {}) {

  let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (!token) {
    console.error('No authentication token found');
    throw new Error('Not authenticated');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (response.status === 401) {
      console.error('Authentication failed (401), token may be expired');
      throw new Error('Authentication failed');
    }
    
    return response;
  } catch (error) {
    console.error(`Auth fetch error for ${url}:`, error);
    throw error;
  }
}