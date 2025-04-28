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
  } catch (e) {
    errorMessage = response.statusText || errorMessage;
  }
  
  if (errorData.detail) {
    errorMessage = errorData.detail;
  } else if (errorData.message) {
    errorMessage = errorData.message;
  }
  
  throw new ApiError(errorMessage, response.status);
};

export const apiClient = {
  async getToken(): Promise<string | null> {
    try {
      const response = await fetch('/api/auth/token');
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
  

  async get<T = any>(endpoint: string): Promise<T> {
    const token = await this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/py/${endpoint.replace(/^\//, '')}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return response.json();
  },
  
  async post<T = any>(endpoint: string, data: any): Promise<T> {
    const token = await this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/py/${endpoint.replace(/^\//, '')}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return response.json();
  },
  
  async put<T = any>(endpoint: string, data: any): Promise<T> {
    const token = await this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/py/${endpoint.replace(/^\//, '')}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return response.json();
  },
  
  async delete<T = any>(endpoint: string): Promise<T> {
    const token = await this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/py/${endpoint.replace(/^\//, '')}`, {
      method: 'DELETE',
      headers,
      cache: 'no-store',
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return response.json();
  },
  
  async upload<T = any>(endpoint: string, file: File, additionalData: Record<string, string> = {}): Promise<T> {
    const token = await this.getToken();
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Add any additional data to the form
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/py/${endpoint.replace(/^\//, '')}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return response.json();
  }
};