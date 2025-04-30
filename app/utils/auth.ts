import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';

interface UserData {
  id: number;
  email: string;
  full_name: string;
}

interface JwtPayload {
  sub: string;
  exp: number;
}

const TOKEN_COOKIE_NAME = 'access_token';
const USER_DATA_KEY = 'user_data';

export const setAuthToken = (token: string): void => {
  Cookies.set(TOKEN_COOKIE_NAME, token, { 
    expires: 7, // 7 days
    path: '/',
    sameSite: 'lax',
    secure: window.location.protocol === 'https:'
  });
  
  // Also store in localStorage as a backup
  localStorage.setItem(TOKEN_COOKIE_NAME, token);
};

export const getAuthToken = (): string | undefined => {
  // Try cookie first
  const cookieToken = Cookies.get(TOKEN_COOKIE_NAME);
  if (cookieToken) return cookieToken;
  
  // Fall back to localStorage
  return localStorage.getItem(TOKEN_COOKIE_NAME) || undefined;
};

export const removeAuthToken = (): void => {
  Cookies.remove(TOKEN_COOKIE_NAME, { path: '/' });
  localStorage.removeItem(TOKEN_COOKIE_NAME);
  localStorage.removeItem(USER_DATA_KEY);
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

export const isTokenValid = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return false;
  }
};

export const isAuthenticated = (): boolean => {
  return isTokenValid();
};