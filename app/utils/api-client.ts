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
  let errorData: ApiErrorResponse = {};

  try {
    errorData = await response.json();
    if (errorData.detail) {
      errorMessage = errorData.detail;
    } else if (errorData.message) {
      errorMessage = errorData.message;
    }
  } catch (e) {
    errorMessage = response.statusText || errorMessage;
  }

  console.error('API Error:', response.status, errorMessage);
  throw new ApiError(errorMessage, response.status);
};

export const apiClient = {
  async getToken(): Promise<string | null> {
    try {
      const response = await fetch('/api/auth/token', { credentials: 'include' });
      if (!response.ok) {
        console.error(`Failed to fetch token: ${response.status}`);
        return null;
      }
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error fetching token:', error);
      return null;
    }
  },

  async request<T = any>(method: string, endpoint: string, body?: any, isUpload: boolean = false): Promise<T> {
    const token = await this.getToken();
    
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
};
