export const apiClient = {
  async get(endpoint: string) {
    const response = await fetch(`/api/py/${endpoint.replace(/^\//, '')}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.error(`Authentication error when fetching ${endpoint}`);
        throw new Error("Please sign in to access this content");
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error fetching ${endpoint}`);
    }
    
    return response.json();
  },
  
  async post(endpoint: string, data: any) {
    const response = await fetch(`/api/py/${endpoint.replace(/^\//, '')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
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
  },
  
  async put(endpoint: string, data: any) {
    const response = await fetch(`/api/py/${endpoint.replace(/^\//, '')}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
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
  }
};