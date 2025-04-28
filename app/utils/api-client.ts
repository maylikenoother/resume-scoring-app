import { getAuthToken } from './auth';

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  error?: string;
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
  let errorData: ApiErrorResponse = {};

  try {
    errorData = await response.json();
    
    if (errorData.detail) {
      errorMessage = errorData.detail;
    } else if (errorData.message) {
      errorMessage = errorData.message;
    } else if (errorData.error) {
      errorMessage = errorData.error;
    } else {
      errorMessage = response.statusText || `HTTP error! status: ${response.status}`;
    }
  } catch (parseError) {
    errorMessage = response.statusText || `HTTP error! status: ${response.status}`;
  }

  console.error('API Error:', {
    status: response.status,
    message: errorMessage,
    fullResponse: errorData
  });

  throw new ApiError(errorMessage, response.status);
};

export const apiClient = {
  async getToken(): Promise<string | null> {
    return getAuthToken() || null;
  },

  async request<T = any>(method: string, endpoint: string, body?: any, isUpload: boolean = false): Promise<T> {
    const token = getAuthToken();
    
    const headers: HeadersInit = {};
    if (!isUpload) {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      credentials: 'include',
      cache: 'no-store',
    };

    if (body) {
      fetchOptions.body = isUpload ? body : JSON.stringify(body);
    }

    const response = await fetch(`/api/py/${endpoint.replace(/^\//, '')}`, fetchOptions);

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
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
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch('/api/py/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
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