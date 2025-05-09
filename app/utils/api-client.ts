import { getAuthToken, removeAuthToken, setAuthToken, setUserData } from './auth';

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = 'An unexpected error occurred';
  
  try {
    const errorData = await response.json() as ApiErrorResponse;
    errorMessage = errorData.detail || errorData.message || errorMessage;
  } catch (e) {
    errorMessage = response.statusText || errorMessage;
  }
  
  throw new ApiError(errorMessage, response.status);
};

export const apiClient = {
  async request<T = any>(method: string, endpoint: string, body?: any, isUpload: boolean = false): Promise<T> {
    if (!endpoint.includes('?') && !endpoint.endsWith('/')) {
      endpoint = `${endpoint}/`;
    }
    
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ||  'https://cv-review-app-backend.onrender.com';;
    const url = new URL(`${apiBaseUrl}/api/py/${endpoint.replace(/^\//, '')}`);
    
    const headers: HeadersInit = {};
    
    const token = getAuthToken();
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Using token for API request');
    } else {
      console.log('Warning: No auth token available for API request');
    }
    
    headers['Accept'] = 'application/json';
    
    const contentType = isUpload ? undefined : 'application/json';
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    
    const fetchOptions: RequestInit = {
      method,
      headers,
      body: isUpload ? body : body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    };

    try {
      const response = await fetch(url.toString(), fetchOptions);

      if (!response.ok) {
        if (response.status === 401) {
          removeAuthToken();
        }
        await handleApiError(response);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Request failed: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  },

  get<T = any>(endpoint: string): Promise<T> {
    return this.request('GET', endpoint);
  },

  post<T = any>(endpoint: string, data: any): Promise<T> {
    return this.request('POST', endpoint, data);
  },

  put<T = any>(endpoint: string, data: any): Promise<T> {
    return this.request('PUT', endpoint, data);
  },

  delete<T = any>(endpoint: string): Promise<T> {
    return this.request('DELETE', endpoint);
  },

  upload<T = any>(endpoint: string, file: File, additionalData: Record<string, string> = {}): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return this.request('POST', endpoint, formData, true);
  },

  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
  
    try {
      const response = await fetch('/api/py/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
        credentials: 'include',
      });
    
      if (!response.ok) {
        await handleApiError(response);
      }
    
      const data = await response.json();
      
      if (!data.access_token) {
        throw new ApiError('Invalid response: Missing access token', 500);
      }
      
      setAuthToken(data.access_token);

      if (data.user_id) {
        setUserData({
          id: data.user_id,
          email: data.email || '',
          full_name: data.full_name || '',
        });
      }
      
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Login failed: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  },
  
  async register(email: string, password: string, fullName: string) {
    return this.post('auth/register', {
      email,
      password,
      full_name: fullName,
    });
  },
};