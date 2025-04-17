import { getSession, signOut } from "next-auth/react";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const session = await getSession();
  
  if (!session?.accessToken) {
    throw new Error('No authentication token found');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${session.accessToken}`);
  
  try {
    return await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error(`Auth fetch error for ${url}:`, error);
    throw error;
  }
};

export const isAuthenticated = async () => {
  const session = await getSession();
  return !!session;
};

export const logOut = () => {
  signOut({ callbackUrl: '/login' });
};

export const setAuthToken = () => {
  console.warn("setAuthToken is deprecated with NextAuth - tokens are managed automatically");
};

export const removeAuthToken = () => {
  logOut();
};

export const getAuthToken = async () => {
  const session = await getSession();
  return session?.accessToken || null;
};

export const getAuthHeaders = async () => {
  const session = await getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }
  
  return headers;
};