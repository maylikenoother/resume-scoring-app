export const setAuthToken = (token: string) => {
    localStorage.setItem('token', token);
    
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 7 days
    
    document.cookie = `auth_token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
  };
  
  export const removeAuthToken = () => {
    localStorage.removeItem('token');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  };
  
  export const getAuthToken = () => {
    return localStorage.getItem('token');
  };
  
  export const isAuthenticated = () => {
    const token = getAuthToken();
    if (!token) return false;

    return true;
  };
  
  export const getAuthHeaders = () => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };
 
  export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
 
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(url, {
      ...options,
      headers
    });
  };