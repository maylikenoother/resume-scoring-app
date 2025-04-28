export const apiClient = {
  async getToken() {
    try {
      if (typeof window !== 'undefined') {

        const cookies = document.cookie.split(';')
          .map(cookie => cookie.trim())
          .reduce((acc, cookie) => {
            const [name, value] = cookie.split('=');
            acc[name] = value;
            return acc;
          }, {} as Record<string, string>);
          
        const sessionToken = cookies['__session'] || cookies['__clerk_session'];
        
        if (sessionToken) {
          return sessionToken;
        }

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
      }
      return null;
    } catch (error) {
      console.error('Error in getToken:', error);
      return null;
    }
  },
  
  async get(endpoint: string) {
    try {
      const token = await this.getToken();
  
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
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
        if (response.status === 401 || response.status === 403) {
          console.error(`Authentication error when fetching ${endpoint}`);
          throw new Error("Please sign in to access this content");
        }
  
        let errorMessage = `Error fetching ${endpoint}`;
  
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData === 'object' && 'detail' in errorData) {
            errorMessage = errorData.detail;
          }
        } catch (err) {
          console.warn(`Could not parse error JSON for ${endpoint}`);
        }
  
        throw new Error(errorMessage);
      }
  
      return response.json();
    } catch (error) {
      console.error(`API client error for GET ${endpoint}:`, error);
      throw error;
    }
  },
  
  
  async post(endpoint: string, data: any) {
    try {
      const token = await this.getToken();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
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
        if (response.status === 401 || response.status === 403) {
          console.error(`Authentication error when posting to ${endpoint}`);
          throw new Error("Please sign in to access this content");
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error posting to ${endpoint}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`API client error for POST ${endpoint}:`, error);
      throw error;
    }
  },
  
  async put(endpoint: string, data: any) {
    try {
      const token = await this.getToken();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
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
        if (response.status === 401 || response.status === 403) {
          console.error(`Authentication error when updating ${endpoint}`);
          throw new Error("Please sign in to access this content");
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error updating ${endpoint}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`API client error for PUT ${endpoint}:`, error);
      throw error;
    }
  },
  
  async upload(endpoint: string, file: File, additionalData: Record<string, string> = {}) {
    try {
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
        if (response.status === 401 || response.status === 403) {
          console.error(`Authentication error when uploading to ${endpoint}`);
          throw new Error("Please sign in to access this content");
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error uploading to ${endpoint}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`API client error for upload to ${endpoint}:`, error);
      throw error;
    }
  },
  
  async storeTokenInDatabase(token: string) {
    try {
      if (!token) return false;
      
      const response = await fetch('/api/py/auth/store-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token })
      });
      
      if (!response.ok) {
        console.error('Failed to store token in database');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error storing token in database:', error);
      return false;
    }
  }
};