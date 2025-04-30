// app/utils/auth.ts
import Cookies from 'js-cookie';

// Set a consistent token name
const TOKEN_NAME = 'access_token';
const USER_DATA_KEY = 'cv_review_user_data';

interface UserData {
  id: number;
  email: string;
  full_name: string;
}

export const setAuthToken = (token: string): void => {
  // Always set both cookie and localStorage
  localStorage.setItem(TOKEN_NAME, token);
  
  // Use a long expiration and lax security to ensure token persistence
  Cookies.set(TOKEN_NAME, token, {
    expires: 30, // 30 days
    path: '/',
    sameSite: 'lax',
    secure: window.location.protocol === 'https:'
  });
  
  console.log('Token set in both localStorage and cookie');
};

export const getAuthToken = (): string | null => {
  // Try localStorage first (more reliable across pages)
  const lsToken = localStorage.getItem(TOKEN_NAME);
  
  // Then try cookie as fallback
  const cookieToken = Cookies.get(TOKEN_NAME);
  
  const token = lsToken || cookieToken || null;
  
  // Debug token
  if (token) {
    console.log('Token found, first 15 chars:', token.substring(0, 15) + '...');
  } else {
    console.log('No token found');
  }
  
  return token;
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_NAME);
  Cookies.remove(TOKEN_NAME, { path: '/' });
  localStorage.removeItem(USER_DATA_KEY);
  console.log('Token removed from both localStorage and cookie');
};

export const setUserData = (userData: UserData): void => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

export const getUserData = (): UserData | null => {
  const userData = localStorage.getItem(USER_DATA_KEY);
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};