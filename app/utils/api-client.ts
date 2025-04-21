export const apiClient = {
  async get(endpoint: string) {
    const response = await fetch(`/api/py/${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error fetching ${endpoint}`);
    }
    
    return response.json();
  },
  
  async post(endpoint: string, data: any) {
    const response = await fetch(`/api/py/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error posting to ${endpoint}`);
    }
    
    return response.json();
  },
  
  async put(endpoint: string, data: any) {
    const response = await fetch(`/api/py/${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error updating ${endpoint}`);
    }
    
    return response.json();
  }
};