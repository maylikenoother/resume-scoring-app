
export const setAuthToken = (token: string) => {
    localStorage.setItem('token', token);
    
    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
  };

  export const removeAuthToken = () => {
    localStorage.removeItem('token');
    document.cookie = 'auth_token=; path=/; max-age=0';
  };
  
  export const getAuthToken = () => {
    return localStorage.getItem('token');
  };
  
  export const isAuthenticated = () => {
    return !!getAuthToken();
  };
  
  export const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };